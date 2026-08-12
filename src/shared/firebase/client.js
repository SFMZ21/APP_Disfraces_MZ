import { getApp, getApps, initializeApp } from "firebase/app";

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

export const firebaseApp = getApps().length > 0
  ? getApp()
  : initializeApp(firebaseConfig);

export const useFirebaseEmulators =
  import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === "true";

if (
  import.meta.env.PROD &&
  firebaseConfig.measurementId &&
  typeof window !== "undefined"
) {
  import("firebase/analytics")
    .then(async ({ getAnalytics, isSupported }) => {
      if (await isSupported()) getAnalytics(firebaseApp);
    })
    .catch(() => {
      // Analytics es opcional y nunca debe impedir que cargue la aplicación.
    });
}

if (
  import.meta.env.PROD &&
  import.meta.env.VITE_ENABLE_FIREBASE_APP_CHECK === "true" &&
  import.meta.env.VITE_FIREBASE_APP_CHECK_SITE_KEY &&
  typeof window !== "undefined"
) {
  import("firebase/app-check")
    .then(({ initializeAppCheck, ReCaptchaV3Provider }) => {
      initializeAppCheck(firebaseApp, {
        provider: new ReCaptchaV3Provider(
          import.meta.env.VITE_FIREBASE_APP_CHECK_SITE_KEY,
        ),
        isTokenAutoRefreshEnabled: true,
      });
    })
    .catch((error) => {
      console.error("No fue posible inicializar Firebase App Check:", error);
    });
}
