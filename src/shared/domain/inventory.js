export function asFiniteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

// Semántica vigente: `enUso` incluye unidades comprometidas desde que se crea
// una reserva, aunque todavía no hayan sido entregadas. No debe interpretarse
// como `checkedOut` hasta que se migre el modelo de disponibilidad.
export function normalizeInventory(data = {}) {
  const total = Math.max(0, asFiniteNumber(data.cantidad, 1));
  const committed = Math.max(0, asFiniteNumber(data.enUso));
  const available = Math.max(
    0,
    asFiniteNumber(data.enStock, Math.max(0, total - committed)),
  );

  return {
    cantidad: total,
    enUso: committed,
    enStock: available,
  };
}
