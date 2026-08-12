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

async function getUserProfiles(firebaseUser) {
  const profileIds = [firebaseUser.uid, firebaseUser.email].filter(Boolean);
  const snapshots = await Promise.all(
    profileIds.map((profileId) =>
      getDoc(doc(firestoreClient, "users", profileId))),
  );
  return snapshots
    .filter((snapshot) => snapshot.exists())
    .map((snapshot) => snapshot.data());
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
      const [profiles, tokenResult] = await Promise.all([
        getUserProfiles(firebaseUser),
        firebaseUser.getIdTokenResult(),
      ]);
      const role = resolveUserRole({
        claims: tokenResult.claims,
        profiles,
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
