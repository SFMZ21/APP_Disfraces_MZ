import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { firebaseApp, useFirebaseEmulators } from "./client";

export const functionsClient = getFunctions(firebaseApp, "us-central1");

if (useFirebaseEmulators && !globalThis.__DISFRACES_FUNCTIONS_EMULATOR__) {
  connectFunctionsEmulator(functionsClient, "127.0.0.1", 5001);
  globalThis.__DISFRACES_FUNCTIONS_EMULATOR__ = true;
}
