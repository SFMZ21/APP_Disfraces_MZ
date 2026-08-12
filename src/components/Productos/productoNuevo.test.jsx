import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createProduct } from "../../features/catalog/api/catalogApi";
import { ProductoNuevo } from "./productoNuevo";

vi.mock("../../features/catalog/api/catalogApi", () => ({
  createProduct: vi.fn(),
}));

describe("ProductoNuevo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createProduct.mockResolvedValue();
  });

  it("valida el formulario y crea el producto mediante la API de catálogo", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ProductoNuevo onClose={onClose} />);

    await user.type(screen.getByLabelText("Título:"), "Disfraz nuevo");
    await user.type(screen.getByLabelText("Categoría:"), "Infantil");
    await user.clear(screen.getByLabelText("Precio:"));
    await user.type(screen.getByLabelText("Precio:"), "175");
    await user.type(screen.getByLabelText("Talla:"), "M");
    await user.type(screen.getByLabelText("Código de producto:"), "101");

    for (const label of ["Imagen principal:", "Imagen 1:", "Imagen 2:", "Imagen 3:"]) {
      await user.upload(
        screen.getByLabelText(label),
        new File(["image"], `${label}.png`, { type: "image/png" }),
      );
    }

    fireEvent.submit(screen.getByRole("button", { name: "Guardar" }).closest("form"));
    await waitFor(() => expect(createProduct).toHaveBeenCalledOnce());
    expect(onClose).toHaveBeenCalledOnce();
  });
});
