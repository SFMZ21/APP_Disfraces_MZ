import React, { createContext, useContext, useState } from "react";

const PurchaseTimeContext = createContext();

export const usePurchaseTime = () => {
  return useContext(PurchaseTimeContext);
};

export const PurchaseTimeProvider = ({ children }) => {
  const [PurchaseTimeStart, setPurchaseTimeStart] = useState(null);
  const [PurchaseTimeEnd, setPurchaseTimeEnd] = useState(null); // Define PurchaseTimeEnd

  const contextValue = {
    PurchaseTimeStart,
    setPurchaseTimeStart,
    PurchaseTimeEnd, // Asegúrate de incluir PurchaseTimeEnd en el valor del contexto
    setPurchaseTimeEnd,
  };

  return (
    <PurchaseTimeContext.Provider value={contextValue}>
      {children}
    </PurchaseTimeContext.Provider>
  );
};