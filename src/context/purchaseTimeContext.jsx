import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

const PurchaseAnalyticsContext = createContext(null);

export function usePurchaseAnalytics() {
  const context = useContext(PurchaseAnalyticsContext);

  if (!context) {
    throw new Error(
      "usePurchaseAnalytics debe usarse dentro de PurchaseAnalyticsProvider.",
    );
  }

  return context;
}

export function PurchaseAnalyticsProvider({ children }) {
  // Valores informativos provenientes del navegador. No deben utilizarse para
  // autorización, auditoría confiable ni decisiones del negocio.
  const [purchaseStartedAt, setPurchaseStartedAt] = useState(null);
  const [purchaseCompletedAt, setPurchaseCompletedAt] = useState(null);
  const value = useMemo(
    () => ({
      purchaseStartedAt,
      setPurchaseStartedAt,
      purchaseCompletedAt,
      setPurchaseCompletedAt,
    }),
    [purchaseCompletedAt, purchaseStartedAt],
  );

  return (
    <PurchaseAnalyticsContext.Provider value={value}>
      {children}
    </PurchaseAnalyticsContext.Provider>
  );
}
