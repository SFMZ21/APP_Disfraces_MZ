import { describe, expect, it } from "vitest";
import {
  CART_RESULT,
  addCartItem,
  calculateCartTotal,
  removeCartItem,
  sanitizeCart,
  updateCartItemQuantity,
} from "./cartModel";

const product = {
  documentId: "product-1",
  title: "Disfraz",
  price: 125,
  enStock: 3,
};

describe("cartModel", () => {
  it("agrega un producto con cantidad inicial uno", () => {
    const result = addCartItem([], product);
    expect(result.result).toBe(CART_RESULT.ADDED);
    expect(result.items).toEqual([{ ...product, quantity: 1 }]);
  });

  it("no duplica un producto", () => {
    const existing = [{ ...product, quantity: 1 }];
    const result = addCartItem(existing, product);
    expect(result.result).toBe(CART_RESULT.DUPLICATE);
    expect(result.items).toBe(existing);
  });

  it("elimina por documentId", () => {
    expect(removeCartItem([{ ...product, quantity: 1 }], "product-1")).toEqual([]);
  });

  it("limita cantidades entre uno y el stock", () => {
    const items = [{ ...product, quantity: 1 }];
    expect(updateCartItemQuantity(items, "product-1", 9)[0].quantity).toBe(3);
    expect(updateCartItemQuantity(items, "product-1", -1)[0].quantity).toBe(1);
    expect(updateCartItemQuantity(items, "product-1", Number.NaN)[0].quantity).toBe(1);
  });

  it("calcula el total usando precio y cantidad", () => {
    expect(calculateCartTotal([
      { ...product, quantity: 2 },
      { ...product, documentId: "product-2", price: 50, quantity: 1 },
    ])).toBe(300);
  });

  it("descarta elementos inválidos al normalizar", () => {
    expect(sanitizeCart([
      { ...product, quantity: 1 },
      { documentId: "bad", quantity: 0 },
      null,
    ])).toEqual([{ ...product, quantity: 1 }]);
  });
});
