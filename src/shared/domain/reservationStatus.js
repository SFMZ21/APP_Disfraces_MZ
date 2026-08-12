export const RESERVATION_STATUS = Object.freeze({
  PROCESSING: "en Proceso",
  RENTED: "en Alquiler",
  COMPLETED: "completado",
  CANCELLED: "cancelado",
});

export const RESERVATION_STATUS_TRANSITIONS = Object.freeze({
  [RESERVATION_STATUS.PROCESSING]: Object.freeze([
    RESERVATION_STATUS.RENTED,
    RESERVATION_STATUS.CANCELLED,
  ]),
  [RESERVATION_STATUS.RENTED]: Object.freeze([
    RESERVATION_STATUS.COMPLETED,
    RESERVATION_STATUS.CANCELLED,
  ]),
});

export function canTransitionReservation(currentStatus, nextStatus) {
  return RESERVATION_STATUS_TRANSITIONS[currentStatus]?.includes(nextStatus) ?? false;
}
