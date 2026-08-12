import { readFileSync } from "node:fs";
import { beforeAll, beforeEach, afterAll, describe, expect, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

const PROJECT_ID = "demo-disfraces-mz";
let testEnvironment;

function userContext(uid, claims = {}) {
  return testEnvironment.authenticatedContext(uid, {
    email: `${uid}@example.com`,
    ...claims,
  });
}

async function seed(path, data) {
  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), path), data);
  });
}

beforeAll(async () => {
  testEnvironment = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync("firestore.rules", "utf8"),
    },
  });
});

beforeEach(async () => {
  await testEnvironment.clearFirestore();
});

afterAll(async () => {
  await testEnvironment.cleanup();
});

describe("items", () => {
  it("permite lectura autenticada y rechaza lectura anónima", async () => {
    await seed("items/product-1", { title: "Disfraz" });
    await assertSucceeds(getDoc(doc(userContext("user-1").firestore(), "items/product-1")));
    await assertFails(getDoc(doc(testEnvironment.unauthenticatedContext().firestore(), "items/product-1")));
  });

  it("rechaza escritura normal y permite escritura administrativa", async () => {
    const normalRef = doc(userContext("user-1").firestore(), "items/product-1");
    const adminRef = doc(userContext("admin", { admin: true }).firestore(), "items/product-2");
    await assertFails(setDoc(normalRef, { title: "No permitido" }));
    await assertSucceeds(setDoc(adminRef, { title: "Permitido" }));
  });
});

describe("pedidos", () => {
  beforeEach(async () => {
    await seed("pedidos/order-1", {
      ownerId: "owner",
      reserva: { email: "owner@example.com" },
    });
  });

  it("permite lectura al propietario y la rechaza a otro usuario", async () => {
    await assertSucceeds(getDoc(doc(userContext("owner").firestore(), "pedidos/order-1")));
    await assertFails(getDoc(doc(userContext("other").firestore(), "pedidos/order-1")));
  });

  it("permite lectura administrativa y prohíbe escritura del cliente", async () => {
    await assertSucceeds(getDoc(doc(userContext("admin", { admin: true }).firestore(), "pedidos/order-1")));
    await assertFails(setDoc(
      doc(userContext("owner").firestore(), "pedidos/new-order"),
      { ownerId: "owner" },
    ));
  });
});

describe("Bitacora", () => {
  beforeEach(async () => seed("Bitacora/log-1", { tiempoInfo: {} }));

  it("solo permite lectura administrativa y nunca escritura del cliente", async () => {
    await assertFails(getDoc(doc(userContext("user-1").firestore(), "Bitacora/log-1")));
    await assertSucceeds(getDoc(doc(userContext("admin", { admin: true }).firestore(), "Bitacora/log-1")));
    await assertFails(setDoc(doc(userContext("user-1").firestore(), "Bitacora/log-2"), {}));
  });
});

describe("users", () => {
  it("permite crear el perfil propio con rol user", async () => {
    const profile = doc(userContext("user-1").firestore(), "users/user-1");
    await assertSucceeds(setDoc(profile, {
      uid: "user-1",
      email: "user-1@example.com",
      displayName: "Usuario",
      role: "user",
    }));
  });

  it("impide elevar privilegios durante la creación", async () => {
    const profile = doc(userContext("user-1").firestore(), "users/user-1");
    await assertFails(setDoc(profile, {
      uid: "user-1",
      email: "user-1@example.com",
      role: "admin",
    }));
  });

  it("impide modificar roles al usuario normal y lo permite al administrador", async () => {
    await seed("users/user-1", {
      uid: "user-1",
      email: "user-1@example.com",
      role: "user",
    });
    await assertFails(updateDoc(
      doc(userContext("user-1").firestore(), "users/user-1"),
      { role: "admin" },
    ));
    await assertSucceeds(updateDoc(
      doc(userContext("admin", { admin: true }).firestore(), "users/user-1"),
      { role: "admin" },
    ));
    const snapshot = await getDoc(
      doc(userContext("admin", { admin: true }).firestore(), "users/user-1"),
    );
    expect(snapshot.data().role).toBe("admin");
  });
});
