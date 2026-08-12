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
  loadStoredReservationDates,
  persistReservationDates,
} from "../storage/reservationStorage";

const ReservationContext = createContext(null);

export function useReservation() {
  const context = useContext(ReservationContext);
  if (!context) {
    throw new Error("useReservation debe usarse dentro de ReservationProvider.");
  }
  return context;
}

export function ReservationProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const initialDates = useMemo(loadStoredReservationDates, []);
  const [startDate, setStartDate] = useState(initialDates.startDate);
  const [endDate, setEndDate] = useState(initialDates.endDate);

  useEffect(() => {
    if (!authLoading && !user) {
      setStartDate(null);
      setEndDate(null);
    }
  }, [authLoading, user]);

  useEffect(() => {
    persistReservationDates({ startDate, endDate });
  }, [endDate, startDate]);

  const setReservationDates = useCallback((start, end) => {
    setStartDate(start);
    setEndDate(end);
  }, []);
  const clearReservationDates = useCallback(() => {
    setStartDate(null);
    setEndDate(null);
  }, []);
  const value = useMemo(() => ({
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    setReservationDates,
    clearReservationDates,
  }), [clearReservationDates, endDate, setReservationDates, startDate]);

  return (
    <ReservationContext.Provider value={value}>
      {children}
    </ReservationContext.Provider>
  );
}
