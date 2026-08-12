import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "../../../context/authContext";
import {
  addCartItem,
  calculateCartTotal,
  removeCartItem,
  updateCartItemQuantity,
} from "../model/cartModel";
import { loadStoredCart, persistCart } from "../storage/cartStorage";

const CartContext = createContext(null);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe usarse dentro de CartProvider.");
  return context;
}

export function CartProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState(loadStoredCart);

  useEffect(() => {
    if (!authLoading && !user) {
      setItems([]);
      setIsOpen(false);
    }
  }, [authLoading, user]);

  useEffect(() => {
    persistCart(items);
  }, [items]);

  const addItem = useCallback((product) => {
    const next = addCartItem(items, product);
    setItems(next.items);
    return next.result;
  }, [items]);

  const updateQuantity = useCallback((documentId, nextQuantity) => {
    setItems((current) =>
      updateCartItemQuantity(current, documentId, nextQuantity));
  }, []);

  const removeItem = useCallback((documentId) => {
    setItems((current) => removeCartItem(current, documentId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const total = useMemo(() => calculateCartTotal(items), [items]);
  const value = useMemo(() => ({
    isOpen,
    setIsOpen,
    items,
    total,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  }), [addItem, clearCart, isOpen, items, removeItem, total, updateQuantity]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
