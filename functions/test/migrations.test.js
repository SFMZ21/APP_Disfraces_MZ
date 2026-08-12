const { after, before, beforeEach, describe, test } = require("node:test");
const assert = require("node:assert/strict");
const { deleteApp, initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const {
  migrateLegacyProducts,
  migrateLegacyUsers,
  normalizeExistingItems,
} = require("../src/migrations/legacyData");

const PROJECT_ID = "demo-disfraces-mz";
let app;
let db;

async function clearCollection(name) {
  const snapshot = await db.collection(name).get();
  if (snapshot.empty) return;
  const batch = db.batch();
  snapshot.forEach((document) => batch.delete(document.ref));
  await batch.commit();
}

before(() => {
  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    throw new Error("Estas pruebas deben ejecutarse con el emulador de Firestore.");
  }
  app = initializeApp({ projectId: PROJECT_ID }, "migration-tests");
  db = getFirestore(app);
});

beforeEach(async () => {
  await Promise.all([clearCollection("products"), clearCollection("items"), clearCollection("users")]);
});

after(async () => deleteApp(app));

describe("migrateLegacyProducts", () => {
  test("dry-run informa sin escribir", async () => {
    await db.collection("products").doc("legacy-1").set({ title: "Disfraz" });
    const result = await migrateLegacyProducts({ db, dryRun: true });
    assert.equal(result.created, 1);
    assert.equal((await db.collection("items").get()).size, 0);
  });

  test("es idempotente y no sobrescribe destinos existentes", async () => {
    await db.collection("products").doc("legacy-1").set({ title: "Disfraz" });
    const first = await migrateLegacyProducts({ db, dryRun: false });
    const second = await migrateLegacyProducts({ db, dryRun: false });
    assert.equal(first.created, 1);
    assert.equal(second.created, 0);
    assert.equal(second.skipped, 1);
    assert.equal((await db.collection("items").get()).size, 1);
  });
});

describe("normalizeExistingItems", () => {
  test("normaliza tipos y completa el inventario faltante", async () => {
    await db.collection("items").doc("legacy-item").set({
      cantidad: "3",
      enUso: 1,
    });
    const first = await normalizeExistingItems({ db, dryRun: false });
    const second = await normalizeExistingItems({ db, dryRun: false });
    const item = (await db.collection("items").doc("legacy-item").get()).data();
    assert.equal(first.updated, 1);
    assert.equal(second.updated, 0);
    assert.equal(second.skipped, 1);
    assert.equal(item.cantidad, 3);
    assert.equal(item.enUso, 1);
    assert.equal(item.enStock, 2);
  });
});

describe("migrateLegacyUsers", () => {
  test("normaliza documento por correo y conserva administrador", async () => {
    await db.collection("users").doc("admin@example.com").set({
      uid: "admin-uid",
      email: "admin@example.com",
      nombre: "Admin",
      rol: "administrador",
    });
    const first = await migrateLegacyUsers({ db, dryRun: false });
    const second = await migrateLegacyUsers({ db, dryRun: false });
    const profile = await db.collection("users").doc("admin-uid").get();
    assert.equal(first.created, 1);
    assert.equal(second.created, 0);
    assert.equal(profile.data().role, "admin");
    assert.equal((await db.collection("users").doc("admin@example.com").get()).exists, true);
  });

  test("promueve destino normal cuando el perfil histórico era administrador", async () => {
    await db.collection("users").doc("admin-uid").set({
      uid: "admin-uid",
      email: "admin@example.com",
      role: "user",
    });
    await db.collection("users").doc("admin@example.com").set({
      uid: "admin-uid",
      email: "admin@example.com",
      isAdmin: true,
    });
    const result = await migrateLegacyUsers({ db, dryRun: false });
    const profile = await db.collection("users").doc("admin-uid").get();
    assert.equal(result.promoted, 1);
    assert.equal(profile.data().role, "admin");
  });

  test("reporta perfiles sin UID resoluble", async () => {
    await db.collection("users").doc("unknown@example.com").set({
      email: "unknown@example.com",
      role: "user",
    });
    const result = await migrateLegacyUsers({
      db,
      dryRun: true,
      resolveUidByEmail: async () => "",
    });
    assert.equal(result.unresolved, 1);
  });

  test("normaliza un documento por UID que no contiene el campo uid", async () => {
    await db.collection("users").doc("auth-uid").set({ rol: "usuario" });
    const result = await migrateLegacyUsers({
      db,
      dryRun: false,
      resolveUserByUid: async (uid) => ({
        uid,
        email: "user@example.com",
        displayName: "Usuario",
        customClaims: {},
      }),
    });
    const profile = (await db.collection("users").doc("auth-uid").get()).data();
    assert.equal(result.updated, 1);
    assert.equal(profile.uid, "auth-uid");
    assert.equal(profile.email, "user@example.com");
    assert.equal(profile.role, "user");
  });

  test("preserva un administrador definido mediante custom claim", async () => {
    await db.collection("users").doc("admin@example.com").set({ rol: "usuario" });
    const result = await migrateLegacyUsers({
      db,
      dryRun: false,
      resolveUserByEmail: async () => ({
        uid: "admin-uid",
        email: "admin@example.com",
        displayName: "Admin",
        customClaims: { admin: true },
      }),
    });
    const profile = (await db.collection("users").doc("admin-uid").get()).data();
    assert.equal(result.created, 1);
    assert.equal(profile.role, "admin");
  });
});
