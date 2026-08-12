const RESERVATION_STATUS = Object.freeze({
  PROCESSING: "en Proceso",
  RENTED: "en Alquiler",
  COMPLETED: "completado",
  CANCELLED: "cancelado",
});

const RESERVATION_STATUS_TRANSITIONS = Object.freeze({
  [RESERVATION_STATUS.PROCESSING]: new Set([
    RESERVATION_STATUS.RENTED,
    RESERVATION_STATUS.CANCELLED,
  ]),
  [RESERVATION_STATUS.RENTED]: new Set([
    RESERVATION_STATUS.COMPLETED,
    RESERVATION_STATUS.CANCELLED,
  ]),
});

function canTransitionReservation(currentStatus, nextStatus) {
  return RESERVATION_STATUS_TRANSITIONS[currentStatus]?.has(nextStatus) ?? false;
}

module.exports = {
  RESERVATION_STATUS,
  RESERVATION_STATUS_TRANSITIONS,
  canTransitionReservation,
};
