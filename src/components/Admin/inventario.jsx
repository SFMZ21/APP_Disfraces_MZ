import { useEffect, useMemo, useState } from "react";
import {
  subscribeInventory,
  updateProductInventory,
} from "../../features/catalog/api/catalogApi";
import { getUserErrorMessage } from "../../shared/errors/AppError";

export function Inventario() {
  const [productos, setProductos] = useState([]);
  const [filtroNombre, setFiltroNombre] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({ price: "", stock: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeInventory(
      (products) => {
        setProductos(products);
        setError("");
      },
      (subscriptionError) => {
        console.error(subscriptionError);
        setError(getUserErrorMessage(subscriptionError, "No fue posible cargar el inventario."));
      },
    );

    return unsubscribe;
  }, []);

  const filteredProducts = useMemo(() => {
    const normalizedFilter = filtroNombre.trim().toLocaleLowerCase("es");
    if (!normalizedFilter) return productos;

    return productos.filter((product) =>
      (product.title ?? "").toLocaleLowerCase("es").includes(normalizedFilter),
    );
  }, [filtroNombre, productos]);

  const startEditing = (product) => {
    setEditingProduct(product.documentId);
    setForm({ price: String(product.price), stock: String(product.enStock) });
    setError("");
  };

  const cancelEditing = () => {
    setEditingProduct(null);
    setForm({ price: "", stock: "" });
  };

  const saveProduct = async (product) => {
    try {
      await updateProductInventory(product.documentId, {
        price: form.price,
        stock: form.stock,
        total: product.cantidad,
        inUse: product.enUso,
      });
      cancelEditing();
    } catch (updateError) {
      console.error(updateError);
      setError(getUserErrorMessage(updateError, "No fue posible actualizar el producto."));
    }
  };

  return (
    <main className="table-container">
      <h1>Inventario</h1>
      <label htmlFor="inventory-search" className="sr-only">Buscar producto</label>
      <input
        id="inventory-search"
        className="buscador"
        type="search"
        placeholder="Buscar por nombre del producto"
        value={filtroNombre}
        onChange={(event) => setFiltroNombre(event.target.value)}
      />
      {error && <p className="error-message" role="alert">{error}</p>}

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Título</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Talla</th>
              <th>En stock</th>
              <th>En uso</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => {
              const isEditing = editingProduct === product.documentId;

              return (
                <tr key={product.documentId}>
                  <td data-label="Título">{product.title}</td>
                  <td data-label="Categoría">{product.category}</td>
                  <td data-label="Precio">
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        value={form.price}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, price: event.target.value }))
                        }
                        aria-label={`Precio de ${product.title}`}
                      />
                    ) : (
                      `Q${product.price}`
                    )}
                  </td>
                  <td data-label="Talla">{product.size || "Única"}</td>
                  <td data-label="En stock">
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={form.stock}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, stock: event.target.value }))
                        }
                        aria-label={`Existencias de ${product.title}`}
                      />
                    ) : (
                      product.enStock
                    )}
                  </td>
                  <td data-label="En uso">{product.enUso}</td>
                  <td data-label="Acciones" className="table-actions">
                    {isEditing ? (
                      <>
                        <button className="btn-save" type="button" onClick={() => saveProduct(product)}>
                          Guardar
                        </button>
                        <button className="btn-secondary" type="button" onClick={cancelEditing}>
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <button className="btn-edit" type="button" onClick={() => startEditing(product)}>
                        Editar
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
