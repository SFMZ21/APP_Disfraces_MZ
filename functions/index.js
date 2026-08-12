const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { logger } = require("firebase-functions");
const { initializeApp } = require("firebase-admin/app");
const {
  FieldValue,
  Timestamp,
  getFirestore,
} = require("firebase-admin/firestore");

initializeApp();

const db = getFirestore();
const REGION = "us-central1";
const PRODUCT_COLLECTION = "items";
const MAX_CART_ITEMS = 10;
const MAX_ITEM_QUANTITY = 20;
const MAX_RENTAL_DAY_DIFFERENCE = 6;

const callableOptions = {
  region: REGION,
  cors: true,
};

function requireAuth(request) {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Debes iniciar sesión.");
  }

  return request.auth;
}

function requiredText(value, field, maxLength) {
  const normalized = typeof value === "string" ? value.trim() : "";

  if (!normalized || normalized.length > maxLength) {
    throw new HttpsError(
      "invalid-argument",
      `El campo ${field} no es válido.`,
    );
  }

  return normalized;
}

function parseReservationDates(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new HttpsError("invalid-argument", "Las fechas no son válidas.");
  }

  const startDay = Date.UTC(
    start.getUTCFullYear(),
    start.getUTCMonth(),
    start.getUTCDate(),
  );
  const endDay = Date.UTC(
    end.getUTCFullYear(),
    end.getUTCMonth(),
    end.getUTCDate(),
  );
  const today = new Date();
  const todayDay = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
  );
  const dayDifference = Math.round((endDay - startDay) / 86_400_000);

  if (
    startDay < todayDay ||
    dayDifference < 0 ||
    dayDifference > MAX_RENTAL_DAY_DIFFERENCE
  ) {
    throw new HttpsError(
      "invalid-argument",
      "La reserva debe iniciar hoy o después y durar como máximo siete días.",
    );
  }

  return {
    start: Timestamp.fromDate(start),
    end: Timestamp.fromDate(end),
  };
}

function parseCart(items) {
  if (!Array.isArray(items) || items.length === 0 || items.length > MAX_CART_ITEMS) {
    throw new HttpsError("invalid-argument", "El carrito no es válido.");
  }

  const uniqueItems = new Map();

  for (const item of items) {
    const documentId = requiredText(item?.documentId, "producto", 150);
    const quantity = Number(item?.quantity);

    if (
      !Number.isSafeInteger(quantity) ||
      quantity < 1 ||
      quantity > MAX_ITEM_QUANTITY
    ) {
      throw new HttpsError("invalid-argument", "La cantidad no es válida.");
    }

    uniqueItems.set(documentId, {
      documentId,
      quantity: (uniqueItems.get(documentId)?.quantity ?? 0) + quantity,
    });
  }

  const normalized = [...uniqueItems.values()];

  if (normalized.some((item) => item.quantity > MAX_ITEM_QUANTITY)) {
    throw new HttpsError("invalid-argument", "La cantidad no es válida.");
  }

  return normalized;
}

function numericValue(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

async function requireAdmin(auth) {
  if (auth.token.admin === true) {
    return;
  }

  const profileIds = [auth.uid, auth.token.email].filter(Boolean);
  const profiles = await db.getAll(
    ...profileIds.map((profileId) => db.collection("users").doc(profileId)),
  );
  const isAdmin = profiles.some((profile) => {
    const data = profile.data() ?? {};
    return (
      data.role === "admin" ||
      data.rol === "administrador" ||
      data.isAdmin === true
    );
  });

  if (!isAdmin) {
    throw new HttpsError("permission-denied", "Se requiere rol de administrador.");
  }
}

exports.createReservation = onCall(callableOptions, async (request) => {
  const auth = requireAuth(request);
  const payload = request.data ?? {};
  const customer = payload.customer ?? {};
  const firstName = requiredText(customer.firstName, "nombre", 80);
  const lastName = requiredText(customer.lastName, "apellido", 80);
  const phone = requiredText(customer.phone, "teléfono", 30);
  const cart = parseCart(payload.items);
  const dates = parseReservationDates(payload.startDate, payload.endDate);
  const orderRef = db.collection("pedidos").doc();
  const logRef = db.collection("Bitacora").doc();
  const startedAt = new Date(payload.purchaseStartedAt);

  const result = await db.runTransaction(async (transaction) => {
    const productRefs = cart.map((item) =>
      db.collection(PRODUCT_COLLECTION).doc(item.documentId),
    );
    const productSnapshots = await transaction.getAll(...productRefs);
    let total = 0;
    const canonicalCart = [];

    productSnapshots.forEach((snapshot, index) => {
      if (!snapshot.exists) {
        throw new HttpsError("not-found", "Uno de los productos ya no existe.");
      }

      const data = snapshot.data();
      const requested = cart[index];
      const stock = numericValue(data.enStock, numericValue(data.cantidad));
      const inUse = numericValue(data.enUso);
      const price = numericValue(data.price, -1);

      if (price < 0 || requested.quantity > stock) {
        throw new HttpsError(
          "failed-precondition",
          `No hay existencias suficientes para ${data.title ?? "el producto"}.`,
        );
      }

      total += price * requested.quantity;
      canonicalCart.push({
        documentId: snapshot.id,
        id: data.id ?? snapshot.id,
        title: data.title ?? "Producto",
        image: data.image ?? "",
        price,
        size: data.size ?? "Única",
        cantidad: requested.quantity,
      });

      transaction.update(snapshot.ref, {
        enStock: stock - requested.quantity,
        enUso: inUse + requested.quantity,
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    const reservation = {
      nombre: firstName,
      apellido: lastName,
      telefono: phone,
      email: auth.token.email ?? "",
      estado: "en Proceso",
      carrito: canonicalCart,
      total,
      startDate: dates.start,
      endDate: dates.end,
    };

    transaction.set(orderRef, {
      ownerId: auth.uid,
      reserva: reservation,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    const completedAt = new Date();
    const validStartedAt = Number.isNaN(startedAt.getTime())
      ? completedAt
      : startedAt;
    const elapsedSeconds = Math.max(
      0,
      Math.floor((completedAt.getTime() - validStartedAt.getTime()) / 1000),
    );

    transaction.set(logRef, {
      tiempoInfo: {
        userId: auth.uid,
        userName: firstName,
        startTime: Timestamp.fromDate(validStartedAt),
        endTime: Timestamp.fromDate(completedAt),
        tiempoDiferencia: {
          horas: Math.floor(elapsedSeconds / 3600),
          minutos: Math.floor((elapsedSeconds % 3600) / 60),
          segundos: elapsedSeconds % 60,
        },
      },
    });

    return { orderId: orderRef.id, total };
  });

  logger.info("Reserva creada", { orderId: result.orderId, uid: auth.uid });
  return result;
});

exports.updateReservationStatus = onCall(callableOptions, async (request) => {
  const auth = requireAuth(request);
  await requireAdmin(auth);

  const orderId = requiredText(request.data?.orderId, "pedido", 150);
  const nextStatus = requiredText(request.data?.status, "estado", 30);
  const transitions = {
    "en Proceso": new Set(["en Alquiler", "cancelado"]),
    "en Alquiler": new Set(["completado", "cancelado"]),
  };

  if (!["en Alquiler", "completado", "cancelado"].includes(nextStatus)) {
    throw new HttpsError("invalid-argument", "El estado solicitado no es válido.");
  }

  const orderRef = db.collection("pedidos").doc(orderId);

  const result = await db.runTransaction(async (transaction) => {
    const orderSnapshot = await transaction.get(orderRef);

    if (!orderSnapshot.exists) {
      throw new HttpsError("not-found", "El pedido no existe.");
    }

    const order = orderSnapshot.data();
    const currentStatus = order.reserva?.estado;

    if (currentStatus === nextStatus) {
      return { orderId, status: currentStatus, unchanged: true };
    }

    if (!transitions[currentStatus]?.has(nextStatus)) {
      throw new HttpsError(
        "failed-precondition",
        `No se puede pasar de ${currentStatus ?? "un estado desconocido"} a ${nextStatus}.`,
      );
    }

    const shouldRestoreStock = ["completado", "cancelado"].includes(nextStatus);
    const cart = Array.isArray(order.reserva?.carrito) ? order.reserva.carrito : [];
    const productsToRestore = [];

    if (shouldRestoreStock) {
      for (const item of cart) {
        let productSnapshot;

        if (item.documentId) {
          productSnapshot = await transaction.get(
            db.collection(PRODUCT_COLLECTION).doc(String(item.documentId)),
          );
        } else {
          const legacyQuery = db
            .collection(PRODUCT_COLLECTION)
            .where("id", "==", item.id)
            .limit(1);
          const legacySnapshot = await transaction.get(legacyQuery);
          productSnapshot = legacySnapshot.docs[0];
        }

        if (!productSnapshot?.exists) {
          throw new HttpsError(
            "failed-precondition",
            `No se encontró el producto ${item.title ?? item.id}.`,
          );
        }

        productsToRestore.push({
          snapshot: productSnapshot,
          quantity: numericValue(item.cantidad, 1),
        });
      }
    }

    for (const { snapshot, quantity } of productsToRestore) {
      const product = snapshot.data();
      const stock = numericValue(product.enStock, numericValue(product.cantidad));
      const inUse = numericValue(product.enUso);

      transaction.update(snapshot.ref, {
        enStock: stock + quantity,
        enUso: Math.max(0, inUse - quantity),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    transaction.update(orderRef, {
      "reserva.estado": nextStatus,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { orderId, status: nextStatus, unchanged: false };
  });

  logger.info("Estado de reserva actualizado", {
    orderId,
    status: result.status,
    uid: auth.uid,
  });
  return result;
});
