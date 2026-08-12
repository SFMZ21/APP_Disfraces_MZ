import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  subscribeAdminOrders,
  updateReservationStatus,
} from "../../features/reservations/api/reservationsApi";
import { RESERVATION_STATUS } from "../../shared/domain/reservationStatus";
import { PedidosAdmin } from "./pedidosAdmin";

vi.mock("sweetalert", () => ({ default: vi.fn().mockResolvedValue(true) }));
vi.mock("../../features/reservations/api/reservationsApi", () => ({
  subscribeAdminOrders: vi.fn(),
  updateReservationStatus: vi.fn(),
}));

describe("PedidosAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    subscribeAdminOrders.mockImplementation((onOrders) => {
      onOrders([{
        id: "order-1",
        nombre: "Ana",
        apellido: "López",
        email: "ana@example.com",
        telefono: "5555-5555",
        estado: RESERVATION_STATUS.PROCESSING,
        startDate: new Date(2026, 7, 12),
        endDate: new Date(2026, 7, 14),
        total: 200,
        carrito: [{ documentId: "product-1", cantidad: 1, title: "Disfraz" }],
      }]);
      return vi.fn();
    });
    updateReservationStatus.mockResolvedValue({ status: RESERVATION_STATUS.RENTED });
  });

  it("lista pedidos y solicita una transición válida mediante la API", async () => {
    const user = userEvent.setup();
    render(<PedidosAdmin />);
    expect(screen.getByText("Ana López")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Alquilar" }));
    await waitFor(() => expect(updateReservationStatus).toHaveBeenCalledWith(
      "order-1",
      RESERVATION_STATUS.RENTED,
    ));
  });
});
