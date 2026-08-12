import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";

const PROJECT_ID = "demo-disfraces-mz";
let testEnvironment;

function storageFor(uid, claims = {}) {
  return testEnvironment.authenticatedContext(uid, {
    email: `${uid}@example.com`,
    ...claims,
  }).storage();
}

beforeAll(async () => {
  testEnvironment = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    storage: {
      rules: readFileSync("storage.rules", "utf8"),
    },
  });
});

beforeEach(async () => {
  await testEnvironment.clearStorage();
});

afterAll(async () => {
  await testEnvironment.cleanup();
});

describe("Firebase Storage", () => {
  it("permite imágenes válidas al administrador y lectura autenticada", async () => {
    const adminFile = storageFor("admin", { admin: true })
      .ref("products/product-1/main.png");
    await assertSucceeds(adminFile.put(new Uint8Array([1, 2, 3]), {
      contentType: "image/png",
    }));
    await assertSucceeds(
      storageFor("user-1").ref("products/product-1/main.png").getDownloadURL(),
    );
    await assertFails(
      testEnvironment.unauthenticatedContext().storage()
        .ref("products/product-1/main.png").getDownloadURL(),
    );
  });

  it("rechaza escrituras de usuarios normales", async () => {
    await assertFails(
      storageFor("user-1").ref("products/product-1/main.png")
        .put(new Uint8Array([1]), { contentType: "image/png" }),
    );
  });

  it("rechaza MIME que no sea imagen", async () => {
    await assertFails(
      storageFor("admin", { admin: true }).ref("products/product-1/file.txt")
        .put(new Uint8Array([1]), { contentType: "text/plain" }),
    );
  });

  it("rechaza imágenes de 10 MB o más", async () => {
    await assertFails(
      storageFor("admin", { admin: true }).ref("products/product-1/large.png")
        .put(new Uint8Array(10 * 1024 * 1024), { contentType: "image/png" }),
    );
  });
});
