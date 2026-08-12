import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { firebaseApp, useFirebaseEmulators } from "./client";

export const firestoreClient = getFirestore(firebaseApp);

if (useFirebaseEmulators && !globalThis.__DISFRACES_FIRESTORE_EMULATOR__) {
  connectFirestoreEmulator(firestoreClient, "127.0.0.1", 8080);
  globalThis.__DISFRACES_FIRESTORE_EMULATOR__ = true;
}
