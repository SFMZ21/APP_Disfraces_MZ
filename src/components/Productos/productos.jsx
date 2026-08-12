import { useEffect } from "react";
import { useStore } from "../../context/DataProvider";
import { usePurchaseTime } from "../../context/purchaseTimeContext";
import { ProductoItem } from "./ProductoItem";

export function ListaProductos() {
  const { productos, productsLoading, productsError } = useStore();
  const { setPurchaseTimeStart } = usePurchaseTime();

  useEffect(() => {
    setPurchaseTimeStart(new Date());
  }, [setPurchaseTimeStart]);

  return (
    <main>
      <h1 className="title">Productos</h1>
      {productsLoading && <p className="page-status" role="status">Cargando catálogo…</p>}
      {productsError && <p className="error-message" role="alert">{productsError}</p>}
      {!productsLoading && !productsError && productos.length === 0 && (
        <p className="page-status">Todavía no hay productos disponibles.</p>
      )}
      <div className="productos">
        {productos.map((producto) => (
          <ProductoItem key={producto.documentId} producto={producto} />
        ))}
      </div>
    </main>
  );
}
