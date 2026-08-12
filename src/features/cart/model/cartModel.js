export const CART_RESULT = Object.freeze({
  ADDED: "added",
  DUPLICATE: "duplicate",
  INVALID_PRODUCT: "invalid-product",
});

export function isValidCartItem(item) {
  return (
    typeof item?.documentId === "string" &&
    Number.isSafeInteger(item?.quantity) &&
    item.quantity > 0
  );
}

export function sanitizeCart(items) {
  return Array.isArray(items) ? items.filter(isValidCartItem) : [];
}

export function addCartItem(items, product) {
  if (!product || typeof product.documentId !== "string") {
    return { items, result: CART_RESULT.INVALID_PRODUCT };
  }
  if (items.some((item) => item.documentId === product.documentId)) {
    return { items, result: CART_RESULT.DUPLICATE };
  }
  return {
    items: [...items, { ...product, quantity: 1 }],
    result: CART_RESULT.ADDED,
  };
}

export function updateCartItemQuantity(items, documentId, nextQuantity) {
  return items.map((item) => {
    if (item.documentId !== documentId) return item;
    const boundedQuantity = Math.min(
      Math.max(1, Number.isSafeInteger(nextQuantity) ? nextQuantity : 1),
      Math.max(1, Number(item.enStock) || 1),
    );
    return { ...item, quantity: boundedQuantity };
  });
}

export function removeCartItem(items, documentId) {
  return items.filter((item) => item.documentId !== documentId);
}

export function calculateCartTotal(items) {
  return items.reduce(
    (subtotal, item) => subtotal + (Number(item.price) || 0) * item.quantity,
    0,
  );
}
