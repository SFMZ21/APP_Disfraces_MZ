import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { authContext } from "../../context/authContext";
import { PurchaseAnalyticsProvider } from "../../context/purchaseTimeContext";
import { CartProvider } from "../../features/cart/context/CartContext";
import { CART_STORAGE_KEY } from "../../features/cart/storage/cartStorage";
import { createReservation } from "../../features/reservations/api/reservationsApi";
import { ReservationProvider } from "../../features/reservations/context/ReservationContext";
import { RESERVATION_STORAGE_KEY } from "../../features/reservations/storage/reservationStorage";
import ReservationForm from "./reservationForm";

vi.mock("sweetalert", () => ({ default: vi.fn().mockResolvedValue(true) }));
vi.mock("../../features/reservations/api/reservationsApi", () => ({
  createReservation: vi.fn(),
}));

describe("ReservationForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([{
      documentId: "product-1",
      title: "Disfraz",
      price: 100,
      enStock: 2,
      quantity: 1,
    }]));
    localStorage.setItem(RESERVATION_STORAGE_KEY, JSON.stringify({
      startDate: "2026-08-12T00:00:00.000Z",
      endDate: "2026-08-14T00:00:00.000Z",
    }));
    createReservation.mockResolvedValue({ orderId: "order-1", total: 100 });
  });

  it("limpia carrito y fechas después de una reserva correcta", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <authContext.Provider value={{
        user: { uid: "user-1", isAdmin: false },
        loading: false,
      }}>
        <CartProvider>
          <ReservationProvider>
            <PurchaseAnalyticsProvider>
              <ReservationForm onClose={onClose} />
            </PurchaseAnalyticsProvider>
          </ReservationProvider>
        </CartProvider>
      </authContext.Provider>,
    );

    await user.type(screen.getByLabelText("Nombre:"), "Ana");
    await user.type(screen.getByLabelText("Apellido:"), "López");
    await user.type(screen.getByLabelText("Teléfono:"), "5555-5555");
    await user.click(screen.getByRole("button", { name: "Confirmar reserva" }));

    await waitFor(() => expect(createReservation).toHaveBeenCalledOnce());
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem(CART_STORAGE_KEY))).toEqual([]);
      expect(JSON.parse(localStorage.getItem(RESERVATION_STORAGE_KEY))).toEqual({
        startDate: null,
        endDate: null,
      });
    });
  });
});
