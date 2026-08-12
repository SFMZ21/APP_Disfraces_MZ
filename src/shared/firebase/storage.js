import { connectStorageEmulator, getStorage } from "firebase/storage";
import { firebaseApp, useFirebaseEmulators } from "./client";

export const storageClient = getStorage(firebaseApp);

if (useFirebaseEmulators && !globalThis.__DISFRACES_STORAGE_EMULATOR__) {
  connectStorageEmulator(storageClient, "127.0.0.1", 9199);
  globalThis.__DISFRACES_STORAGE_EMULATOR__ = true;
}
