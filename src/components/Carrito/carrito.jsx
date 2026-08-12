import { useState } from "react";
import { ChevronDown, ChevronUp, Trash2, X } from "lucide-react";
import swal from "sweetalert";
import { useCart } from "../../features/cart/context/CartContext";
import { useReservation } from "../../features/reservations/context/ReservationContext";
import ReservationForm from "./reservationForm";

export function Carrito() {
  const {
    isOpen,
    setIsOpen,
    items,
    total,
    updateQuantity,
    removeItem,
  } = useCart();
  const { startDate, endDate } = useReservation();
  const [showModal, setShowModal] = useState(false);

  const handleRemove = async (documentId) => {
    const confirmed = await swal({
      title: "Eliminar producto",
      text: "¿Quieres quitarlo del carrito?",
      icon: "warning",
      buttons: ["No", "Sí"],
    });

    if (confirmed) {
      removeItem(documentId);
    }
  };

  const handleOpenReservation = () => {
    if (items.length === 0) {
      swal({ title: "El carrito está vacío.", icon: "warning" });
      return;
    }

    if (!startDate || !endDate) {
      swal({
        title: "Faltan las fechas de reserva.",
        text: "Vuelve al producto y selecciona el período.",
        icon: "warning",
      });
      return;
    }

    setShowModal(true);
  };

  return (
    <>
      <div
        className={isOpen ? "carritos show" : "carritos"}
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        <button
          type="button"
          className="cart-backdrop"
          onClick={() => setIsOpen(false)}
          aria-label="Cerrar carrito"
          tabIndex={isOpen ? 0 : -1}
        />
        <aside
          className={isOpen ? "carrito show" : "carrito"}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cart-title"
        >
          <button
            type="button"
            className="carrito_close"
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar carrito"
          >
            <X aria-hidden="true" />
          </button>
          <h2 id="cart-title">Tu carrito</h2>
          <div className="carrito_center">
            {items.length === 0 ? (
              <p className="carritoVacio">Carrito vacío</p>
            ) : (
              items.map((producto) => (
                <article className="carrito_item" key={producto.documentId}>
                  <img src={producto.image} alt="" />
                  <div className="infoProducto">
                    <h3>{producto.title}</h3>
                    <p>Talla: {producto.size}</p>
                    <p className="price">Q{producto.price}</p>
                  </div>
                  <div className="quantity-controls">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          producto.documentId,
                          producto.quantity + 1,
                        )
                      }
                      disabled={producto.quantity >= producto.enStock}
                      aria-label={`Aumentar cantidad de ${producto.title}`}
                    >
                      <ChevronUp aria-hidden="true" />
                    </button>
                    <p className="cantidad" aria-live="polite">{producto.quantity}</p>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          producto.documentId,
                          producto.quantity - 1,
                        )
                      }
                      disabled={producto.quantity <= 1}
                      aria-label={`Reducir cantidad de ${producto.title}`}
                    >
                      <ChevronDown aria-hidden="true" />
                    </button>
                  </div>
                  <button
                    type="button"
                    className="remove_item"
                    onClick={() => handleRemove(producto.documentId)}
                    aria-label={`Quitar ${producto.title}`}
                  >
                    <Trash2 aria-hidden="true" />
                  </button>
                </article>
              ))
            )}
          </div>

          <footer className="carrito_footer">
            <p>
              Fecha de inicio:{" "}
              {startDate ? startDate.toLocaleDateString("es-GT") : "No seleccionada"}
            </p>
            <p>
              Fecha de fin:{" "}
              {endDate ? endDate.toLocaleDateString("es-GT") : "No seleccionada"}
            </p>
            <h3>Total estimado: Q{total}</h3>
            <button type="button" className="btn-pago" onClick={handleOpenReservation}>
              Reservar
            </button>
          </footer>
        </aside>
      </div>

      {showModal && <ReservationForm onClose={() => setShowModal(false)} />}
    </>
  );
}
