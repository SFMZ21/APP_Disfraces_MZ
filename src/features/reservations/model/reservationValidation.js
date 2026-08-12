import { requiredText } from "../../../shared/validation/primitives";
import { ValidationError } from "../../../shared/errors/AppError";
import { isReservationRangeValid } from "../../../utils/reservation";

export function validateReservationCustomer(customer) {
  return {
    firstName: requiredText(customer.firstName, "nombre", 80),
    lastName: requiredText(customer.lastName, "apellido", 80),
    phone: requiredText(customer.phone, "teléfono", 30),
  };
}

export function validateReservationRequest({ customer, items, startDate, endDate }) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new ValidationError("La reserva no contiene productos.", {
      code: "validation/empty-cart",
      userMessage: "El carrito está vacío.",
    });
  }

  if (!isReservationRangeValid(startDate, endDate)) {
    throw new ValidationError("El rango de la reserva no es válido.", {
      code: "validation/reservation-range",
      userMessage: "La reserva debe iniciar hoy o después y durar hasta siete días.",
    });
  }

  return {
    customer: validateReservationCustomer(customer),
    items,
    startDate,
    endDate,
  };
}
