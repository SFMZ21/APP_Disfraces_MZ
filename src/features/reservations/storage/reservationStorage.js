import {
  readJsonStorage,
  removeJsonStorage,
  writeJsonStorage,
} from "../../../shared/storage/jsonStorage";

export const RESERVATION_STORAGE_SCHEMA_VERSION = 1;
export const RESERVATION_STORAGE_KEY =
  `disfracesMZ.reservationDates.v${RESERVATION_STORAGE_SCHEMA_VERSION}`;

function safeDate(value) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

export function loadStoredReservationDates() {
  const stored = readJsonStorage(RESERVATION_STORAGE_KEY, null);
  return {
    startDate: safeDate(stored?.startDate),
    endDate: safeDate(stored?.endDate),
  };
}

export function persistReservationDates({ startDate, endDate }) {
  return writeJsonStorage(RESERVATION_STORAGE_KEY, {
    startDate: startDate?.toISOString() ?? null,
    endDate: endDate?.toISOString() ?? null,
  });
}

export function clearStoredReservationDates() {
  return removeJsonStorage(RESERVATION_STORAGE_KEY);
}
