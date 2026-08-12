import {
  AuthError,
  InventoryError,
  PermissionError,
  ReservationError,
} from "./AppError";

function includesCode(error, fragment) {
  return String(error?.code ?? "").includes(fragment);
}

export function mapAuthError(error) {
  let userMessage = "No fue posible completar la operación de acceso.";

  if (includesCode(error, "invalid-credential")) {
    userMessage = "El correo o la contraseña no son correctos.";
  } else if (includesCode(error, "email-already-in-use")) {
    userMessage = "Ya existe una cuenta con ese correo.";
  } else if (includesCode(error, "weak-password")) {
    userMessage = "La contraseña no cumple los requisitos de seguridad.";
  } else if (includesCode(error, "too-many-requests")) {
    userMessage = "Hay demasiados intentos. Espera un momento y vuelve a intentar.";
  } else if (includesCode(error, "popup-closed")) {
    userMessage = "Se cerró la ventana de Google antes de completar el acceso.";
  }

  return new AuthError("Firebase Authentication rechazó la operación.", {
    code: error?.code || "auth/unknown",
    userMessage,
    cause: error,
  });
}

export function mapReservationError(error) {
  let userMessage = "No fue posible completar la reserva. Intenta nuevamente.";

  if (includesCode(error, "failed-precondition")) {
    userMessage = error.message || "El inventario cambió. Revisa tu carrito.";
  } else if (includesCode(error, "unauthenticated")) {
    userMessage = "Tu sesión terminó. Inicia sesión nuevamente.";
  } else if (includesCode(error, "invalid-argument")) {
    userMessage = error.message || "Revisa los datos de la reserva.";
  } else if (includesCode(error, "permission-denied")) {
    return new PermissionError("La operación de reserva fue rechazada.", {
      code: error?.code,
      userMessage: "No tienes permisos para realizar esta operación.",
      cause: error,
    });
  }

  return new ReservationError("Cloud Functions rechazó la operación de reserva.", {
    code: error?.code || "reservation/unknown",
    userMessage,
    cause: error,
  });
}

export function mapInventoryError(error, fallback) {
  return new InventoryError("No fue posible completar la operación de inventario.", {
    code: error?.code || "inventory/unknown",
    userMessage: error?.userMessage || fallback,
    cause: error,
  });
}
