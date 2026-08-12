import { connectAuthEmulator, getAuth } from "firebase/auth";
import { firebaseApp, useFirebaseEmulators } from "./client";

export const authClient = getAuth(firebaseApp);

if (useFirebaseEmulators && !globalThis.__DISFRACES_AUTH_EMULATOR__) {
  connectAuthEmulator(authClient, "http://127.0.0.1:9099", {
    disableWarnings: true,
  });
  globalThis.__DISFRACES_AUTH_EMULATOR__ = true;
}
