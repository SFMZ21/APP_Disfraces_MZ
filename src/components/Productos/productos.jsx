import { useEffect } from "react";
import { usePurchaseAnalytics } from "../../context/purchaseTimeContext";
import { useCatalog } from "../../features/catalog/context/CatalogContext";
import { PageState } from "../../shared/components/PageState";
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
      {loading && <PageState>Cargando catálogo…</PageState>}
      {error && <PageState kind="error">{error}</PageState>}
      {!loading && !error && products.length === 0 && (
        <PageState role="status">Todavía no hay productos disponibles.</PageState>
      )}
      <div className="productos">
        {products.map((producto) => (
          <ProductoItem key={producto.documentId} producto={producto} />
        ))}
      </div>
    </main>
  );
}
