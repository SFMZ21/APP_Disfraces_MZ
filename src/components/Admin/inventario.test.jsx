import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  subscribeInventory,
  updateProductInventory,
} from "../../features/catalog/api/catalogApi";
import { Inventario } from "./inventario";

vi.mock("../../features/catalog/api/catalogApi", () => ({
  subscribeInventory: vi.fn(),
  updateProductInventory: vi.fn(),
}));

describe("Inventario", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    subscribeInventory.mockImplementation((onProducts) => {
      onProducts([{
        documentId: "product-1",
        title: "Disfraz",
        category: "Infantil",
        price: 100,
        size: "M",
        cantidad: 5,
        enStock: 4,
        enUso: 1,
      }]);
      return vi.fn();
    });
    updateProductInventory.mockResolvedValue();
  });

  it("lista y actualiza precio y stock mediante la API de catálogo", async () => {
    const user = userEvent.setup();
    render(<Inventario />);
    expect(screen.getByText("Disfraz")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Editar" }));
    const price = screen.getByRole("spinbutton", { name: "Precio de Disfraz" });
    const stock = screen.getByRole("spinbutton", { name: "Existencias de Disfraz" });
    await user.clear(price);
    await user.type(price, "150");
    await user.clear(stock);
    await user.type(stock, "3");
    await user.click(screen.getByRole("button", { name: "Guardar" }));
    await waitFor(() => expect(updateProductInventory).toHaveBeenCalledWith(
      "product-1",
      { price: "150", stock: "3", total: 5, inUse: 1 },
    ));
  });
});
