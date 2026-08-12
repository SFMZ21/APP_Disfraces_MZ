import { beforeEach, describe, expect, it } from "vitest";
import {
  CART_STORAGE_KEY,
  clearStoredCart,
  loadStoredCart,
  persistCart,
} from "./cartStorage";

const item = { documentId: "product-1", quantity: 2, price: 100 };

describe("cartStorage", () => {
  beforeEach(() => localStorage.clear());

  it("restaura el formato histórico vigente", () => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([item]));
    expect(loadStoredCart()).toEqual([item]);
  });

  it("persiste y limpia el carrito", () => {
    expect(persistCart([item])).toBe(true);
    expect(JSON.parse(localStorage.getItem(CART_STORAGE_KEY))).toEqual([item]);
    expect(clearStoredCart()).toBe(true);
    expect(localStorage.getItem(CART_STORAGE_KEY)).toBeNull();
  });

  it("tolera JSON inválido", () => {
    localStorage.setItem(CART_STORAGE_KEY, "{invalid");
    expect(loadStoredCart()).toEqual([]);
  });

  it("acepta un envelope versionado futuro", () => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ version: 3, items: [item] }));
    expect(loadStoredCart()).toEqual([item]);
  });
});
