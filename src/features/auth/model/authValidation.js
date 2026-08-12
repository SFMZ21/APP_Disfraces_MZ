import { requiredText } from "../../../shared/validation/primitives";
import { ValidationError } from "../../../shared/errors/AppError";

export function validateLoginCredentials({ email, password }) {
  return {
    email: requiredText(email, "correo", 320),
    password: requiredText(password, "contraseña", 4096),
  };
}

export function validateRegistrationCredentials({ email, password }) {
  const credentials = validateLoginCredentials({ email, password });

  if (credentials.password.length < 8) {
    throw new ValidationError("La contraseña es demasiado corta.", {
      code: "validation/password-length",
      userMessage: "La contraseña debe tener al menos 8 caracteres.",
    });
  }

  return credentials;
}
