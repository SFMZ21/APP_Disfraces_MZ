import {
  nonNegativeInteger,
  nonNegativeNumber,
  positiveInteger,
  requiredText,
  validImageFile,
} from "../../../shared/validation/primitives";
import { ValidationError } from "../../../shared/errors/AppError";

export function validateProductForCreation(productData) {
  const cantidad = nonNegativeInteger(productData.cantidad, "unidades totales");
  const enStock = nonNegativeInteger(productData.enStock, "existencias");
  const enUso = nonNegativeInteger(productData.enUso, "unidades en uso");

  if (enStock + enUso > cantidad) {
    throw new ValidationError("El inventario informado es inconsistente.", {
      code: "validation/inventory-balance",
      userMessage: "El stock disponible y en uso no puede superar el total.",
    });
  }

  return {
    id: positiveInteger(productData.id, "código de producto"),
    title: requiredText(productData.title, "título", 120),
    category: requiredText(productData.category, "categoría", 80),
    price: nonNegativeNumber(productData.price, "precio"),
    size: requiredText(productData.size, "talla", 30),
    cantidad,
    enStock,
    enUso,
    image: validImageFile(productData.image, "imagen principal"),
    img1: validImageFile(productData.img1, "imagen 1"),
    img2: validImageFile(productData.img2, "imagen 2"),
    img3: validImageFile(productData.img3, "imagen 3"),
  };
}

export function validateInventoryUpdate({ price, stock, inUse, total }) {
  const normalizedPrice = nonNegativeNumber(price, "precio");
  const normalizedStock = nonNegativeInteger(stock, "existencias");
  const normalizedInUse = nonNegativeInteger(inUse, "unidades en uso");
  const normalizedTotal = nonNegativeInteger(total, "unidades totales");

  return {
    price: normalizedPrice,
    enStock: normalizedStock,
    cantidad: Math.max(normalizedTotal, normalizedStock + normalizedInUse),
  };
}
