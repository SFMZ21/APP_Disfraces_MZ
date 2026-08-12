import { describe, expect, it } from "vitest";
import {
  validateInventoryUpdate,
  validateProductForCreation,
} from "./productValidation";

function image(name) {
  return new File(["image"], name, { type: "image/png" });
}

function validProduct(overrides = {}) {
  return {
    id: "101",
    title: " Disfraz nuevo ",
    category: " Infantil ",
    price: "175.50",
    size: " M ",
    cantidad: "5",
    enStock: "4",
    enUso: "1",
    image: image("main.png"),
    img1: image("one.png"),
    img2: image("two.png"),
    img3: image("three.png"),
    ...overrides,
  };
}

describe("validación de producto", () => {
  it("normaliza texto y números antes de persistir", () => {
    expect(validateProductForCreation(validProduct())).toMatchObject({
      id: 101,
      title: "Disfraz nuevo",
      category: "Infantil",
      price: 175.5,
      size: "M",
      cantidad: 5,
      enStock: 4,
      enUso: 1,
    });
  });

  it("rechaza un balance de inventario inconsistente", () => {
    expect(() => validateProductForCreation(validProduct({ enStock: "5", enUso: "1" })))
      .toThrow("inventario informado es inconsistente");
  });

  it("rechaza archivos que no sean imágenes", () => {
    expect(() => validateProductForCreation(validProduct({
      image: new File(["text"], "main.txt", { type: "text/plain" }),
    }))).toThrow("imagen principal");
  });

  it("normaliza actualizaciones y conserva el balance total", () => {
    expect(validateInventoryUpdate({
      price: "150",
      stock: "6",
      inUse: 2,
      total: 5,
    })).toEqual({ price: 150, enStock: 6, cantidad: 8 });
  });
});
