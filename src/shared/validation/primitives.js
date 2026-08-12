import { ValidationError } from "../errors/AppError";

function validationError(field, userMessage) {
  return new ValidationError(`El campo ${field} no es válido.`, {
    code: `validation/${field}`,
    userMessage,
  });
}

export function requiredText(value, field, maxLength) {
  const normalized = typeof value === "string" ? value.trim() : "";

  if (!normalized || normalized.length > maxLength) {
    throw validationError(field, `Revisa el campo ${field}.`);
  }

  return normalized;
}

export function nonNegativeNumber(value, field) {
  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    throw validationError(field, `${field} debe ser un número no negativo.`);
  }

  return number;
}

export function nonNegativeInteger(value, field) {
  const number = Number(value);

  if (!Number.isSafeInteger(number) || number < 0) {
    throw validationError(field, `${field} debe ser un número entero no negativo.`);
  }

  return number;
}

export function positiveInteger(value, field) {
  const number = Number(value);

  if (!Number.isSafeInteger(number) || number < 1) {
    throw validationError(field, `${field} debe ser un número entero positivo.`);
  }

  return number;
}

export function validImageFile(value, field) {
  const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp"]);

  if (!(value instanceof File) || !allowedTypes.has(value.type)) {
    throw validationError(field, "Todas las imágenes deben ser archivos válidos.");
  }

  if (value.size >= 10 * 1024 * 1024) {
    throw validationError(field, "Cada imagen debe pesar menos de 10 MB.");
  }

  return value;
}

// Conserva la regla funcional actual: teléfono obligatorio con máximo 30
// caracteres. Se centraliza ahora para poder endurecerla en una fase futura.
export function validPhone(value) {
  return requiredText(value, "teléfono", 30);
}
