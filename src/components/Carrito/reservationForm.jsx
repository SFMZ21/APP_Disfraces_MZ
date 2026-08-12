import { useState } from "react";
import { X } from "lucide-react";
import swal from "sweetalert";
import { usePurchaseAnalytics } from "../../context/purchaseTimeContext";
import { useCart } from "../../features/cart/context/CartContext";
import { createReservation } from "../../features/reservations/api/reservationsApi";
import { useReservation } from "../../features/reservations/context/ReservationContext";
import { getUserErrorMessage } from "../../shared/errors/AppError";

export default function ReservationForm({ onClose }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { items, clearCart } = useCart();
  const { startDate, endDate, clearReservationDates } = useReservation();
  const { purchaseStartedAt, setPurchaseCompletedAt } = usePurchaseAnalytics();

  const handleChange = ({ target: { name, value } }) => {
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const completedAt = new Date();
      const response = await createReservation({
        customer: form,
        items,
        startDate,
        endDate,
        purchaseStartedAt: purchaseStartedAt ?? new Date(),
      });

      setPurchaseCompletedAt(completedAt);
      clearCart();
      clearReservationDates();
      onClose();
      await swal({
        title: "¡Reserva realizada con éxito!",
        text: `Total confirmado: Q${response.total}. Puedes pagar al recogerla.`,
        icon: "success",
      });
    } catch (reservationError) {
      console.error(reservationError);
      setError(getUserErrorMessage(
        reservationError,
        "No fue posible completar la reserva. Intenta nuevamente.",
      ));
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
