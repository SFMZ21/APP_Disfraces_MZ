import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  collection,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { auth, firestore, storage } from "../firebase";

export const authContext = createContext(null);

export const useAuth = () => {
  const context = useContext(authContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider.");
  }

  return context;
};

function isAdminProfile(profile) {
  return (
    profile?.role === "admin" ||
    profile?.rol === "administrador" ||
    profile?.isAdmin === true
  );
}

async function getUserProfile(firebaseUser) {
  const uidSnapshot = await getDoc(doc(firestore, "users", firebaseUser.uid));

  if (uidSnapshot.exists()) {
    return uidSnapshot.data();
  }

  // Compatibilidad con la versión que guardaba perfiles usando el correo.
  if (firebaseUser.email) {
    const legacySnapshot = await getDoc(
      doc(firestore, "users", firebaseUser.email),
    );

    if (legacySnapshot.exists()) {
      return legacySnapshot.data();
    }
  }

  return null;
}

async function createUserProfile(firebaseUser) {
  const profileRef = doc(firestore, "users", firebaseUser.uid);
  const existingProfile = await getDoc(profileRef);

  if (!existingProfile.exists()) {
    await setDoc(profileRef, {
      uid: firebaseUser.uid,
      email: firebaseUser.email ?? "",
      displayName: firebaseUser.displayName ?? "",
      role: "user",
      createdAt: serverTimestamp(),
    });
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email.trim(), password);

  const logOut = () => signOut(auth);

  const registro = async (email, password) => {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password,
    );
    await createUserProfile(credential.user);
    return credential.user;
  };

  const logInGoogle = async () => {
    const credential = await signInWithPopup(auth, new GoogleAuthProvider());
    await createUserProfile(credential.user);
    return credential.user;
  };

  const newProduct = async (productData) => {
    if (!user?.isAdmin) {
      throw new Error("Se requiere rol de administrador.");
    }

    const numericId = Number(productData.id);
    const price = Number(productData.price);
    const totalUnits = Number(productData.cantidad);
    const availableUnits = Number(productData.enStock);
    const inUseUnits = Number(productData.enUso);

    if (
      !Number.isSafeInteger(numericId) ||
      numericId < 1 ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isSafeInteger(totalUnits) ||
      totalUnits < 0 ||
      !Number.isSafeInteger(availableUnits) ||
      availableUnits < 0 ||
      !Number.isSafeInteger(inUseUnits) ||
      inUseUnits < 0 ||
      availableUnits + inUseUnits > totalUnits
    ) {
      throw new Error("Los datos numéricos del producto no son válidos.");
    }

    const productId = String(numericId);
    const directRef = doc(firestore, "items", productId);
    const [directSnapshot, legacySnapshot] = await Promise.all([
      getDoc(directRef),
      getDocs(
        query(collection(firestore, "items"), where("id", "==", numericId)),
      ),
    ]);

    if (directSnapshot.exists() || !legacySnapshot.empty) {
      throw new Error("Ya existe un producto con ese código.");
    }

    const files = [
      ["image", productData.image],
      ["img1", productData.img1],
      ["img2", productData.img2],
      ["img3", productData.img3],
    ];
    const uploadedRefs = [];

    try {
      const uploadedImages = await Promise.all(
        files.map(async ([field, file]) => {
          if (!(file instanceof File) || !file.type.startsWith("image/")) {
            throw new Error("Todas las imágenes deben ser archivos válidos.");
          }

          const extension = file.name.split(".").pop()?.toLowerCase() || "img";
          const imageRef = ref(
            storage,
            `products/${productId}/${crypto.randomUUID()}-${field}.${extension}`,
          );
          await uploadBytes(imageRef, file, { contentType: file.type });
          uploadedRefs.push(imageRef);
          return [field, await getDownloadURL(imageRef)];
        }),
      );
      const imageUrls = Object.fromEntries(uploadedImages);

      await setDoc(directRef, {
        id: numericId,
        title: productData.title.trim(),
        category: productData.category.trim(),
        price,
        size: productData.size.trim(),
        cantidad: totalUnits,
        enStock: availableUnits,
        enUso: inUseUnits,
        ...imageUrls,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return true;
    } catch (error) {
      await Promise.allSettled(uploadedRefs.map((imageRef) => deleteObject(imageRef)));
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);

      try {
        if (!firebaseUser) {
          setUser(null);
          return;
        }

        const [profile, tokenResult] = await Promise.all([
          getUserProfile(firebaseUser),
          firebaseUser.getIdTokenResult(),
        ]);

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? "",
          displayName: firebaseUser.displayName ?? "",
          isAdmin: tokenResult.claims.admin === true || isAdminProfile(profile),
        });
      } catch (error) {
        console.error("No fue posible cargar el perfil del usuario:", error);
        setUser({
          uid: firebaseUser?.uid ?? "",
          email: firebaseUser?.email ?? "",
          displayName: firebaseUser?.displayName ?? "",
          isAdmin: false,
        });
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    login,
    registro,
    user,
    loading,
    logOut,
    logInGoogle,
    newProduct,
  };

  return <authContext.Provider value={value}>{children}</authContext.Provider>;
}
