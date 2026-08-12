import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import swal from "sweetalert";
import { firestore } from "../firebase";
import { useAuth } from "./authContext";

const CART_STORAGE_KEY = "disfracesMZ.cart.v2";
const DATES_STORAGE_KEY = "disfracesMZ.reservationDates.v1";

export const DataContext = createContext(null);

export function useStore() {
  const context = useContext(DataContext);

  if (!context) {
    throw new Error("useStore debe usarse dentro de DataProvider.");
  }

  return context;
}

function asNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeProduct(snapshot) {
  const data = snapshot.data();
  const totalUnits = Math.max(0, asNumber(data.cantidad, 1));
  const inUse = Math.max(0, asNumber(data.enUso));
  const availableStock = Math.max(
    0,
    asNumber(data.enStock, Math.max(0, totalUnits - inUse)),
  );

  return {
    ...data,
    documentId: snapshot.id,
    id: data.id ?? snapshot.id,
    cantidad: totalUnits,
    enUso: inUse,
    enStock: availableStock,
    price: Math.max(0, asNumber(data.price)),
    size: data.size || "Única",
    img1: data.img1 || data.image || "",
    img2: data.img2 || data.image || "",
    img3: data.img3 || data.image || "",
  };
}

function loadCart() {
  try {
    const stored = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");

    if (!Array.isArray(stored)) return [];

    return stored.filter(
      (item) =>
        typeof item?.documentId === "string" &&
        Number.isSafeInteger(item?.quantity) &&
        item.quantity > 0,
    );
  } catch {
    return [];
  }
}

function loadDates() {
  try {
    const stored = JSON.parse(localStorage.getItem(DATES_STORAGE_KEY) || "null");
    const startDate = stored?.startDate ? new Date(stored.startDate) : null;
    const endDate = stored?.endDate ? new Date(stored.endDate) : null;

    return {
      startDate: startDate && !Number.isNaN(startDate.getTime()) ? startDate : null,
      endDate: endDate && !Number.isNaN(endDate.getTime()) ? endDate : null,
    };
  } catch {
    return { startDate: null, endDate: null };
  }
}

export function DataProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const initialDates = useMemo(loadDates, []);
  const [productos, setProductos] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [menu, setMenu] = useState(false);
  const [carrito, setCarrito] = useState(loadCart);
  const [startDate, setStartDate] = useState(initialDates.startDate);
  const [endDate, setEndDate] = useState(initialDates.endDate);

  useEffect(() => {
    if (authLoading) return undefined;

    if (!user) {
      setProductos([]);
      setProductsError("");
      setProductsLoading(false);
      setCarrito([]);
      setStartDate(null);
      setEndDate(null);
      return undefined;
    }

    setProductsLoading(true);
    const productsQuery = query(collection(firestore, "items"));
    const unsubscribe = onSnapshot(
      productsQuery,
      (snapshot) => {
        setProductos(snapshot.docs.map(normalizeProduct));
        setProductsError("");
        setProductsLoading(false);
      },
      (error) => {
        console.error("No fue posible cargar el catálogo:", error);
        setProductsError("No fue posible cargar el catálogo.");
        setProductsLoading(false);
      },
    );

    return unsubscribe;
  }, [authLoading, user]);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(carrito));
  }, [carrito]);

  useEffect(() => {
    localStorage.setItem(
      DATES_STORAGE_KEY,
      JSON.stringify({
        startDate: startDate?.toISOString() ?? null,
        endDate: endDate?.toISOString() ?? null,
      }),
    );
  }, [endDate, startDate]);

  const addCarrito = useCallback(
    (productIdentifier, selectedStartDate, selectedEndDate) => {
      const product = productos.find(
        (item) =>
          item.documentId === String(productIdentifier) ||
          String(item.id) === String(productIdentifier),
      );

      if (!product) {
        swal({ title: "No se encontró el producto.", icon: "error" });
        return;
      }

      if (carrito.some((item) => item.documentId === product.documentId)) {
        swal({ title: "El producto ya está en el carrito.", icon: "warning" });
        return;
      }

      setCarrito((current) => [...current, { ...product, quantity: 1 }]);
      setStartDate(selectedStartDate);
      setEndDate(selectedEndDate);
      swal({ title: "Producto añadido correctamente.", icon: "success" });
    },
    [carrito, productos],
  );

  const updateCartQuantity = useCallback((documentId, nextQuantity) => {
    setCarrito((current) =>
      current.map((item) => {
        if (item.documentId !== documentId) return item;

        const boundedQuantity = Math.min(
          Math.max(1, nextQuantity),
          Math.max(1, item.enStock),
        );
        return { ...item, quantity: boundedQuantity };
      }),
    );
  }, []);

  const removeFromCart = useCallback((documentId) => {
    setCarrito((current) =>
      current.filter((item) => item.documentId !== documentId),
    );
  }, []);

  const clearCart = useCallback(() => {
    setCarrito([]);
    setStartDate(null);
    setEndDate(null);
  }, []);

  const total = useMemo(
    () =>
      carrito.reduce(
        (subtotal, item) => subtotal + item.price * item.quantity,
        0,
      ),
    [carrito],
  );

  const value = useMemo(
    () => ({
      productos,
      productsLoading,
      productsError,
      menu,
      setMenu,
      carrito,
      total,
      startDate,
      setStartDate,
      endDate,
      setEndDate,
      addCarrito,
      updateCartQuantity,
      removeFromCart,
      clearCart,
    }),
    [
      addCarrito,
      carrito,
      clearCart,
      endDate,
      menu,
      productsError,
      productsLoading,
      productos,
      removeFromCart,
      startDate,
      total,
      updateCartQuantity,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
