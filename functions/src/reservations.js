const { HttpsError } = require("firebase-functions/v2/https");
const { logger } = require("firebase-functions");
const { FieldValue, Timestamp } = require("firebase-admin/firestore");
const {
  RESERVATION_STATUS,
  canTransitionReservation,
} = require("./domain/reservationStatus");
const { USER_ROLES, resolveUserRole } = require("./domain/roles");
const {
  numericValue,
  parseCart,
  parseReservationDates,
  requireAuth,
  requiredText,
} = require("./validation");

const PRODUCT_COLLECTION = "items";

async function requireAdmin(db, auth) {
  if (resolveUserRole({ claims: auth.token }) === USER_ROLES.ADMIN) return;

  const profileIds = [auth.uid, auth.token.email].filter(Boolean);
  const profiles = await db.getAll(
    ...profileIds.map((profileId) => db.collection("users").doc(profileId)),
  );
  const role = resolveUserRole({
    profiles: profiles.map((profile) => profile.data()),
  });

  if (role !== USER_ROLES.ADMIN) {
    throw new HttpsError("permission-denied", "Se requiere rol de administrador.");
  }
}

async function createReservationHandler({ db, request, now = new Date() }) {
  const auth = requireAuth(request);
  const payload = request.data ?? {};
  const customer = payload.customer ?? {};
  const firstName = requiredText(customer.firstName, "nombre", 80);
  const lastName = requiredText(customer.lastName, "apellido", 80);
  const phone = requiredText(customer.phone, "teléfono", 30);
  const cart = parseCart(payload.items);
  const dates = parseReservationDates(payload.startDate, payload.endDate, now);
  const orderRef = db.collection("pedidos").doc();
  const logRef = db.collection("Bitacora").doc();
  const startedAt = new Date(payload.purchaseStartedAt);

  const result = await db.runTransaction(async (transaction) => {
    const productRefs = cart.map((item) =>
      db.collection(PRODUCT_COLLECTION).doc(item.documentId));
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
      estado: RESERVATION_STATUS.PROCESSING,
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

    const completedAt = now;
    const validStartedAt = Number.isNaN(startedAt.getTime()) ? completedAt : startedAt;
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
}

async function updateReservationStatusHandler({ db, request }) {
  const auth = requireAuth(request);
  await requireAdmin(db, auth);

  const orderId = requiredText(request.data?.orderId, "pedido", 150);
  const nextStatus = requiredText(request.data?.status, "estado", 30);
  const allowedStatuses = [
    RESERVATION_STATUS.RENTED,
    RESERVATION_STATUS.COMPLETED,
    RESERVATION_STATUS.CANCELLED,
  ];
  if (!allowedStatuses.includes(nextStatus)) {
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
    if (!canTransitionReservation(currentStatus, nextStatus)) {
      throw new HttpsError(
        "failed-precondition",
        `No se puede pasar de ${currentStatus ?? "un estado desconocido"} a ${nextStatus}.`,
      );
    }

    const shouldRestoreStock = [
      RESERVATION_STATUS.COMPLETED,
      RESERVATION_STATUS.CANCELLED,
    ].includes(nextStatus);
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
          const legacyQuery = db.collection(PRODUCT_COLLECTION)
            .where("id", "==", item.id).limit(1);
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
}

module.exports = {
  createReservationHandler,
  requireAdmin,
  updateReservationStatusHandler,
};
