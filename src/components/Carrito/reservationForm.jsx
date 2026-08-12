import { useState } from "react";
import { httpsCallable } from "firebase/functions";
import { X } from "lucide-react";
import swal from "sweetalert";
import { cloudFunctions } from "../../firebase";
import { useStore } from "../../context/DataProvider";
import { usePurchaseTime } from "../../context/purchaseTimeContext";

function callableErrorMessage(error) {
  const code = error?.code ?? "";

  if (code.includes("failed-precondition")) {
    return error.message || "El inventario cambió. Revisa tu carrito.";
  }
  if (code.includes("unauthenticated")) {
    return "Tu sesión terminó. Inicia sesión nuevamente.";
  }
  if (code.includes("invalid-argument")) {
    return error.message || "Revisa los datos de la reserva.";
  }
  return "No fue posible completar la reserva. Intenta nuevamente.";
}

export default function ReservationForm({ onClose }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { carrito, startDate, endDate, clearCart } = useStore();
  const { PurchaseTimeStart, setPurchaseTimeEnd } = usePurchaseTime();

  const handleChange = ({ target: { name, value } }) => {
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!startDate || !endDate || carrito.length === 0) {
      setError("El carrito o las fechas de reserva ya no son válidos.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const createReservation = httpsCallable(
        cloudFunctions,
        "createReservation",
      );
      const completedAt = new Date();
      const response = await createReservation({
        customer: form,
        items: carrito.map((item) => ({
          documentId: item.documentId,
          quantity: item.quantity,
        })),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        purchaseStartedAt: (PurchaseTimeStart ?? new Date()).toISOString(),
      });

      setPurchaseTimeEnd(completedAt);
      clearCart();
      onClose();
      await swal({
        title: "¡Reserva realizada con éxito!",
        text: `Total confirmado: Q${response.data.total}. Puedes pagar al recogerla.`,
        icon: "success",
      });
    } catch (reservationError) {
      console.error("No fue posible crear la reserva:", reservationError);
      setError(callableErrorMessage(reservationError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reservation-form-title"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar formulario de reserva"
        >
          <X color="#bf2a1b" aria-hidden="true" />
        </button>

        <h2 id="reservation-form-title">Ficha de entrega</h2>
        {error && <p className="error-message" role="alert">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="firstName">Nombre:</label>
            <input
              type="text"
              className="inputFormR"
              id="firstName"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              maxLength={80}
              autoComplete="given-name"
              required
            />
          </div>
          <div>
            <label htmlFor="lastName">Apellido:</label>
            <input
              type="text"
              className="inputFormR"
              id="lastName"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              maxLength={80}
              autoComplete="family-name"
              required
            />
          </div>
          <div>
            <label htmlFor="phone">Teléfono:</label>
            <input
              type="tel"
              className="inputFormR"
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              maxLength={30}
              autoComplete="tel"
              required
            />
          </div>
          <button type="submit" className="btn-confirmar" disabled={submitting}>
            {submitting ? "Confirmando…" : "Confirmar reserva"}
          </button>
        </form>
      </section>
    </div>
  );
}
