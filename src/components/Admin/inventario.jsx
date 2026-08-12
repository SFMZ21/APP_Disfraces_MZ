import { useEffect, useMemo, useState } from "react";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { firestore } from "../../firebase";

function asNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function Inventario() {
  const [productos, setProductos] = useState([]);
  const [filtroNombre, setFiltroNombre] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({ price: "", stock: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(firestore, "items"),
      (snapshot) => {
        setProductos(
          snapshot.docs.map((product) => {
            const data = product.data();
            const total = asNumber(data.cantidad, 1);
            const inUse = asNumber(data.enUso);
            return {
              documentId: product.id,
              ...data,
              cantidad: total,
              enUso: inUse,
              enStock: asNumber(data.enStock, Math.max(0, total - inUse)),
            };
          }),
        );
        setError("");
      },
      (snapshotError) => {
        console.error("No fue posible cargar el inventario:", snapshotError);
        setError("No fue posible cargar el inventario.");
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
    const price = Number(form.price);
    const stock = Number(form.stock);

    if (
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isSafeInteger(stock) ||
      stock < 0
    ) {
      setError("Precio y existencias deben ser números no negativos.");
      return;
    }

    try {
      await updateDoc(doc(firestore, "items", product.documentId), {
        price,
        enStock: stock,
        cantidad: Math.max(product.cantidad, stock + product.enUso),
      });
      cancelEditing();
    } catch (updateError) {
      console.error("No fue posible actualizar el producto:", updateError);
      setError("No fue posible actualizar el producto.");
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
