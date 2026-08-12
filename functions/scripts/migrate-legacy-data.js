const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");
const {
  migrateLegacyProducts,
  migrateLegacyUsers,
  normalizeExistingItems,
} = require("../src/migrations/legacyData");

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  throw new Error(
    "La migración está bloqueada fuera del emulador. " +
      "Ejecuta mediante Firebase Emulator Suite.",
  );
}

const app = initializeApp();
const db = getFirestore(app);
const auth = getAuth(app);
const execute = process.argv.includes("--execute");
const entityArgument = process.argv.find((argument) => argument.startsWith("--entity="));
const entity = entityArgument?.split("=")[1] || "all";

async function resolveUserByEmail(email) {
  try {
    return await auth.getUserByEmail(email);
  } catch (error) {
    if (error.code === "auth/user-not-found") return null;
    throw error;
  }
}

async function resolveUserByUid(uid) {
  try {
    return await auth.getUser(uid);
  } catch (error) {
    if (error.code === "auth/user-not-found") return null;
    throw error;
  }
}

async function main() {
  const results = [];
  if (["all", "products"].includes(entity)) {
    results.push(await migrateLegacyProducts({ db, dryRun: !execute }));
  }
  if (["all", "items"].includes(entity)) {
    results.push(await normalizeExistingItems({ db, dryRun: !execute }));
  }
  if (["all", "users"].includes(entity)) {
    results.push(await migrateLegacyUsers({
      db,
      dryRun: !execute,
      resolveUserByEmail,
      resolveUserByUid,
    }));
  }
  console.log(JSON.stringify({ mode: execute ? "execute" : "dry-run", results }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
