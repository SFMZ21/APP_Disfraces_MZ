import { getApp, getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import {
  connectFirestoreEmulator,
  getFirestore,
} from "firebase/firestore";
import {
  connectStorageEmulator,
  getStorage,
} from "firebase/storage";
import {
  connectFunctionsEmulator,
  getFunctions,
} from "firebase/functions";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const requiredKeys = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
];
const missingKeys = requiredKeys.filter((key) => !firebaseConfig[key]);

if (missingKeys.length > 0) {
  throw new Error(
    `Falta configuración de Firebase: ${missingKeys.join(", ")}. ` +
      "Copia .env.example como .env.local y completa los valores.",
  );
}

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const cloudFunctions = getFunctions(app, "us-central1");

const shouldUseEmulators =
  import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === "true";

if (shouldUseEmulators && !globalThis.__DISFRACES_FIREBASE_EMULATORS__) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", {
    disableWarnings: true,
  });
  connectFirestoreEmulator(firestore, "127.0.0.1", 8080);
  connectStorageEmulator(storage, "127.0.0.1", 9199);
  connectFunctionsEmulator(cloudFunctions, "127.0.0.1", 5001);
  globalThis.__DISFRACES_FIREBASE_EMULATORS__ = true;
}

if (
  import.meta.env.PROD &&
  firebaseConfig.measurementId &&
  typeof window !== "undefined"
) {
  import("firebase/analytics")
    .then(async ({ getAnalytics, isSupported }) => {
      if (await isSupported()) {
        getAnalytics(app);
      }
    })
    .catch(() => {
      // Analytics es opcional y nunca debe impedir que cargue la aplicación.
    });
}
