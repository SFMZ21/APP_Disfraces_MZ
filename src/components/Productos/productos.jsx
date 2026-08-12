import { useEffect } from "react";
import { usePurchaseAnalytics } from "../../context/purchaseTimeContext";
import { useCatalog } from "../../features/catalog/context/CatalogContext";
import { ProductoItem } from "./ProductoItem";

export function ListaProductos() {
  const { products, loading, error } = useCatalog();
  const { setPurchaseStartedAt } = usePurchaseAnalytics();

  useEffect(() => {
    setPurchaseStartedAt(new Date());
  }, [setPurchaseStartedAt]);

  return (
    <main>
      <h1 className="title">Productos</h1>
      {loading && <p className="page-status" role="status">Cargando catálogo…</p>}
      {error && <p className="error-message" role="alert">{error}</p>}
      {!loading && !error && products.length === 0 && (
        <p className="page-status">Todavía no hay productos disponibles.</p>
      )}
      <div className="productos">
        {products.map((producto) => (
          <ProductoItem key={producto.documentId} producto={producto} />
        ))}
      </div>
    </main>
  );
}
