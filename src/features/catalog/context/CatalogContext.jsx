import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "../../../context/authContext";
import { subscribeProducts } from "../api/catalogApi";

const CatalogContext = createContext(null);

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) throw new Error("useCatalog debe usarse dentro de CatalogProvider.");
  return context;
}

export function CatalogProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return undefined;
    if (!user) {
      setProducts([]);
      setError("");
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    return subscribeProducts(
      (nextProducts) => {
        setProducts(nextProducts);
        setError("");
        setLoading(false);
      },
      (subscriptionError) => {
        console.error(subscriptionError);
        setError(subscriptionError.userMessage);
        setLoading(false);
      },
    );
  }, [authLoading, user]);

  const value = useMemo(() => ({ products, loading, error }), [error, loading, products]);
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}
