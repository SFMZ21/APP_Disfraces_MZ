import {
  readJsonStorage,
  removeJsonStorage,
  writeJsonStorage,
} from "../../../shared/storage/jsonStorage";
import { sanitizeCart } from "../model/cartModel";

export const CART_STORAGE_SCHEMA_VERSION = 2;
export const CART_STORAGE_KEY = `disfracesMZ.cart.v${CART_STORAGE_SCHEMA_VERSION}`;

export function loadStoredCart() {
  const stored = readJsonStorage(CART_STORAGE_KEY, []);
  // La versión vigente guarda directamente el arreglo. También se acepta un
  // envelope futuro para que la lectura sea compatible durante otra migración.
  return sanitizeCart(Array.isArray(stored) ? stored : stored?.items);
}

export function persistCart(items) {
  return writeJsonStorage(CART_STORAGE_KEY, sanitizeCart(items));
}

export function clearStoredCart() {
  return removeJsonStorage(CART_STORAGE_KEY);
}
