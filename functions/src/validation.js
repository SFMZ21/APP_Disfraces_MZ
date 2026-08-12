const { HttpsError } = require("firebase-functions/v2/https");
const { Timestamp } = require("firebase-admin/firestore");

const MAX_CART_ITEMS = 10;
const MAX_ITEM_QUANTITY = 20;
const MAX_RENTAL_DAY_DIFFERENCE = 6;

function requireAuth(request) {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Debes iniciar sesión.");
  }
  return request.auth;
}

function requiredText(value, field, maxLength) {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized || normalized.length > maxLength) {
    throw new HttpsError("invalid-argument", `El campo ${field} no es válido.`);
  }
  return normalized;
}

function parseReservationDates(startDate, endDate, now = new Date()) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new HttpsError("invalid-argument", "Las fechas no son válidas.");
  }

  const startDay = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
  const endDay = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());
  const todayDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
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

  return { start: Timestamp.fromDate(start), end: Timestamp.fromDate(end) };
}

function parseCart(items) {
  if (!Array.isArray(items) || items.length === 0 || items.length > MAX_CART_ITEMS) {
    throw new HttpsError("invalid-argument", "El carrito no es válido.");
  }

  const uniqueItems = new Map();
  for (const item of items) {
    const documentId = requiredText(item?.documentId, "producto", 150);
    const quantity = Number(item?.quantity);
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > MAX_ITEM_QUANTITY) {
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

module.exports = {
  MAX_CART_ITEMS,
  MAX_ITEM_QUANTITY,
  MAX_RENTAL_DAY_DIFFERENCE,
  numericValue,
  parseCart,
  parseReservationDates,
  requireAuth,
  requiredText,
};
