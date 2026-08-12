import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

const PurchaseTimeContext = createContext(null);

export function usePurchaseTime() {
  const context = useContext(PurchaseTimeContext);

  if (!context) {
    throw new Error("usePurchaseTime debe usarse dentro de PurchaseTimeProvider.");
  }

  return context;
}

export function PurchaseTimeProvider({ children }) {
  const [PurchaseTimeStart, setPurchaseTimeStart] = useState(null);
  const [PurchaseTimeEnd, setPurchaseTimeEnd] = useState(null);
  const value = useMemo(
    () => ({
      PurchaseTimeStart,
      setPurchaseTimeStart,
      PurchaseTimeEnd,
      setPurchaseTimeEnd,
    }),
    [PurchaseTimeEnd, PurchaseTimeStart],
  );

  return (
    <PurchaseTimeContext.Provider value={value}>
      {children}
    </PurchaseTimeContext.Provider>
  );
}
