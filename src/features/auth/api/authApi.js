import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { authClient } from "../../../shared/firebase/auth";
import { firestoreClient } from "../../../shared/firebase/firestore";
import { mapAuthError } from "../../../shared/errors/firebaseErrors";
import { isAdminRole, resolveUserRole, USER_ROLES } from "../../../shared/domain/roles";
import {
  validateLoginCredentials,
  validateRegistrationCredentials,
} from "../model/authValidation";

async function getUserProfile(firebaseUser) {
  const uidSnapshot = await getDoc(doc(firestoreClient, "users", firebaseUser.uid));

  if (uidSnapshot.exists()) return uidSnapshot.data();

  if (firebaseUser.email) {
    const legacySnapshot = await getDoc(
      doc(firestoreClient, "users", firebaseUser.email),
    );
    if (legacySnapshot.exists()) return legacySnapshot.data();
  }

  return null;
}

async function createUserProfile(firebaseUser) {
  const profileRef = doc(firestoreClient, "users", firebaseUser.uid);
  const existingProfile = await getDoc(profileRef);

  if (!existingProfile.exists()) {
    await setDoc(profileRef, {
      uid: firebaseUser.uid,
      email: firebaseUser.email ?? "",
      displayName: firebaseUser.displayName ?? "",
      role: USER_ROLES.USER,
      createdAt: serverTimestamp(),
    });
  }
}

export async function loginWithEmail(credentials) {
  try {
    const { email, password } = validateLoginCredentials(credentials);
    return await signInWithEmailAndPassword(authClient, email, password);
  } catch (error) {
    if (error?.code?.startsWith("validation/")) throw error;
    throw mapAuthError(error);
  }
}

export async function registerWithEmail(credentials) {
  try {
    const { email, password } = validateRegistrationCredentials(credentials);
    const credential = await createUserWithEmailAndPassword(
      authClient,
      email,
      password,
    );
    await createUserProfile(credential.user);
    return credential.user;
  } catch (error) {
    if (error?.code?.startsWith("validation/")) throw error;
    throw mapAuthError(error);
  }
}

export async function loginWithGoogle() {
  try {
    const credential = await signInWithPopup(
      authClient,
      new GoogleAuthProvider(),
    );
    await createUserProfile(credential.user);
    return credential.user;
  } catch (error) {
    throw mapAuthError(error);
  }
}

export async function logoutUser() {
  try {
    await signOut(authClient);
  } catch (error) {
    throw mapAuthError(error);
  }
}

export function subscribeToAuthentication(onUser, onError) {
  return onAuthStateChanged(authClient, async (firebaseUser) => {
    if (!firebaseUser) {
      onUser(null);
      return;
    }

    try {
      const [profile, tokenResult] = await Promise.all([
        getUserProfile(firebaseUser),
        firebaseUser.getIdTokenResult(),
      ]);
      const role = resolveUserRole({
        claims: tokenResult.claims,
        profile,
      });

      onUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email ?? "",
        displayName: firebaseUser.displayName ?? "",
        role,
        isAdmin: isAdminRole(role),
      });
    } catch (error) {
      onError(mapAuthError(error), firebaseUser);
    }
  });
}
