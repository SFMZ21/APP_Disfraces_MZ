export class AppError extends Error {
  constructor(message, { code = "app/unknown", userMessage, cause } = {}) {
    super(message, { cause });
    this.name = new.target.name;
    this.code = code;
    this.userMessage = userMessage || "Ocurrió un error inesperado.";
  }
}

export class AuthError extends AppError {}
export class ValidationError extends AppError {}
export class ReservationError extends AppError {}
export class InventoryError extends AppError {}
export class PermissionError extends AppError {}

export function getUserErrorMessage(error, fallback = "Ocurrió un error inesperado.") {
  return error?.userMessage || fallback;
}
