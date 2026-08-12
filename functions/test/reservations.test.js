const {
  after,
  before,
  beforeEach,
  describe,
  test,
} = require("node:test");
const assert = require("node:assert/strict");
const { deleteApp, getApps, initializeApp } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const {
  createReservationHandler,
  updateReservationStatusHandler,
} = require("../src/reservations");
const { RESERVATION_STATUS } = require("../src/domain/reservationStatus");

const PROJECT_ID = "demo-disfraces-mz";
const NOW = new Date("2026-08-12T12:00:00.000Z");
let app;
let db;

function auth(uid = "user-1", token = {}) {
  return { uid, token: { email: `${uid}@example.com`, ...token } };
}

function reservationData(overrides = {}) {
  return {
    customer: { firstName: "Ana", lastName: "López", phone: "5555-5555" },
    items: [{ documentId: "costume-1", quantity: 2 }],
    startDate: "2026-08-12T00:00:00.000Z",
    endDate: "2026-08-14T00:00:00.000Z",
    purchaseStartedAt: "2026-08-12T11:55:00.000Z",
    ...overrides,
  };
}

async function clearCollection(name) {
  const snapshot = await db.collection(name).get();
  if (snapshot.empty) return;
  const batch = db.batch();
  snapshot.docs.forEach((document) => batch.delete(document.ref));
  await batch.commit();
}

async function seedProduct(id = "costume-1", overrides = {}) {
  await db.collection("items").doc(id).set({
    id,
    title: "Disfraz de prueba",
    price: 125,
    cantidad: 5,
    enStock: 5,
    enUso: 0,
    size: "M",
    image: "https://example.com/image.png",
    ...overrides,
  });
}

async function seedOrder(status = RESERVATION_STATUS.PROCESSING) {
  await seedProduct("costume-1", { enStock: 3, enUso: 2 });
  await db.collection("pedidos").doc("order-1").set({
    ownerId: "user-1",
    reserva: {
      estado: status,
      carrito: [{
        documentId: "costume-1",
        id: "costume-1",
        title: "Disfraz de prueba",
        cantidad: 2,
        price: 125,
      }],
    },
  });
}

before(() => {
  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    throw new Error("Estas pruebas deben ejecutarse con el emulador de Firestore.");
  }
  process.env.GCLOUD_PROJECT = PROJECT_ID;
  app = initializeApp({ projectId: PROJECT_ID }, "functions-tests");
  db = getFirestore(app);
});

beforeEach(async () => {
  await Promise.all([
    clearCollection("items"),
    clearCollection("pedidos"),
    clearCollection("Bitacora"),
    clearCollection("users"),
  ]);
});

after(async () => {
  await Promise.all(getApps().map((firebaseApp) => deleteApp(firebaseApp)));
});

describe("createReservation", () => {
  test("rechaza usuarios no autenticados", async () => {
    await assert.rejects(
      createReservationHandler({ db, request: { data: reservationData() }, now: NOW }),
      (error) => error.code === "unauthenticated",
    );
  });

  test("rechaza un carrito vacío", async () => {
    await assert.rejects(
      createReservationHandler({
        db,
        request: { auth: auth(), data: reservationData({ items: [] }) },
        now: NOW,
      }),
      (error) => error.code === "invalid-argument",
    );
  });

  test("rechaza cantidades inválidas", async () => {
    await assert.rejects(
      createReservationHandler({
        db,
        request: {
          auth: auth(),
          data: reservationData({ items: [{ documentId: "costume-1", quantity: 0 }] }),
        },
        now: NOW,
      }),
      (error) => error.code === "invalid-argument",
    );
  });

  test("rechaza productos inexistentes", async () => {
    await assert.rejects(
      createReservationHandler({ db, request: { auth: auth(), data: reservationData() }, now: NOW }),
      (error) => error.code === "not-found",
    );
  });

  test("rechaza stock insuficiente", async () => {
    await seedProduct("costume-1", { enStock: 1 });
    await assert.rejects(
      createReservationHandler({ db, request: { auth: auth(), data: reservationData() }, now: NOW }),
      (error) => error.code === "failed-precondition",
    );
  });

  test("ignora precio y total manipulados por el cliente", async () => {
    await seedProduct("costume-1", { price: 125 });
    const result = await createReservationHandler({
      db,
      request: {
        auth: auth(),
        data: reservationData({
          total: 1,
          items: [{ documentId: "costume-1", quantity: 2, price: 0.5 }],
        }),
      },
      now: NOW,
    });
    assert.equal(result.total, 250);
    const orders = await db.collection("pedidos").get();
    assert.equal(orders.docs[0].data().reserva.total, 250);
    assert.equal(orders.docs[0].data().reserva.carrito[0].price, 125);
  });

  test("crea pedido y bitácora y actualiza inventario de forma atómica", async () => {
    await seedProduct();
    const result = await createReservationHandler({
      db,
      request: { auth: auth(), data: reservationData() },
      now: NOW,
    });
    assert.ok(result.orderId);
    assert.equal(result.total, 250);
    const product = await db.collection("items").doc("costume-1").get();
    assert.equal(product.data().enStock, 3);
    assert.equal(product.data().enUso, 2);
    assert.equal((await db.collection("pedidos").get()).size, 1);
    const logs = await db.collection("Bitacora").get();
    assert.equal(logs.size, 1);
    assert.ok(logs.docs[0].data().tiempoInfo.startTime instanceof Timestamp);
  });

  test("revierte toda la transacción cuando un producto no existe", async () => {
    await seedProduct("costume-1");
    await assert.rejects(createReservationHandler({
      db,
      request: {
        auth: auth(),
        data: reservationData({ items: [
          { documentId: "costume-1", quantity: 1 },
          { documentId: "missing", quantity: 1 },
        ] }),
      },
      now: NOW,
    }));
    const product = await db.collection("items").doc("costume-1").get();
    assert.equal(product.data().enStock, 5);
    assert.equal(product.data().enUso, 0);
    assert.equal((await db.collection("pedidos").get()).size, 0);
    assert.equal((await db.collection("Bitacora").get()).size, 0);
  });
});

describe("updateReservationStatus", () => {
  test("rechaza usuarios no autenticados", async () => {
    await assert.rejects(
      updateReservationStatusHandler({ db, request: { data: {} } }),
      (error) => error.code === "unauthenticated",
    );
  });

  test("rechaza usuarios no administradores", async () => {
    await assert.rejects(
      updateReservationStatusHandler({
        db,
        request: { auth: auth(), data: { orderId: "order-1", status: RESERVATION_STATUS.RENTED } },
      }),
      (error) => error.code === "permission-denied",
    );
  });

  test("rechaza pedidos inexistentes", async () => {
    await assert.rejects(
      updateReservationStatusHandler({
        db,
        request: {
          auth: auth("admin", { admin: true }),
          data: { orderId: "missing", status: RESERVATION_STATUS.RENTED },
        },
      }),
      (error) => error.code === "not-found",
    );
  });

  test("permite una transición válida sin restaurar antes de finalizar", async () => {
    await seedOrder();
    await updateReservationStatusHandler({
      db,
      request: {
        auth: auth("admin", { admin: true }),
        data: { orderId: "order-1", status: RESERVATION_STATUS.RENTED },
      },
    });
    const order = await db.collection("pedidos").doc("order-1").get();
    const product = await db.collection("items").doc("costume-1").get();
    assert.equal(order.data().reserva.estado, RESERVATION_STATUS.RENTED);
    assert.equal(product.data().enStock, 3);
    assert.equal(product.data().enUso, 2);
  });

  test("rechaza una transición inválida", async () => {
    await seedOrder();
    await assert.rejects(
      updateReservationStatusHandler({
        db,
        request: {
          auth: auth("admin", { admin: true }),
          data: { orderId: "order-1", status: RESERVATION_STATUS.COMPLETED },
        },
      }),
      (error) => error.code === "failed-precondition",
    );
  });

  for (const terminalStatus of [
    RESERVATION_STATUS.CANCELLED,
    RESERVATION_STATUS.COMPLETED,
  ]) {
    test(`restaura inventario al cambiar a ${terminalStatus}`, async () => {
      await seedOrder(
        terminalStatus === RESERVATION_STATUS.COMPLETED
          ? RESERVATION_STATUS.RENTED
          : RESERVATION_STATUS.PROCESSING,
      );
      await updateReservationStatusHandler({
        db,
        request: {
          auth: auth("admin", { admin: true }),
          data: { orderId: "order-1", status: terminalStatus },
        },
      });
      const product = await db.collection("items").doc("costume-1").get();
      assert.equal(product.data().enStock, 5);
      assert.equal(product.data().enUso, 0);
    });
  }

  test("no restaura dos veces el inventario", async () => {
    await seedOrder();
    const request = {
      auth: auth("admin", { admin: true }),
      data: { orderId: "order-1", status: RESERVATION_STATUS.CANCELLED },
    };
    await updateReservationStatusHandler({ db, request });
    const repeated = await updateReservationStatusHandler({ db, request });
    const product = await db.collection("items").doc("costume-1").get();
    assert.equal(repeated.unchanged, true);
    assert.equal(product.data().enStock, 5);
    assert.equal(product.data().enUso, 0);
  });
});
