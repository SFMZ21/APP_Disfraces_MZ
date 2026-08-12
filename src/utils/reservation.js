import { differenceInCalendarDays, startOfDay } from "date-fns";

export const MAX_RESERVATION_DAY_DIFFERENCE = 6;

export function isReservationRangeValid(startDate, endDate, now = new Date()) {
  if (!(startDate instanceof Date) || !(endDate instanceof Date)) return false;
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return false;
  }

  const start = startOfDay(startDate);
  const end = startOfDay(endDate);
  const today = startOfDay(now);
  const difference = differenceInCalendarDays(end, start);

  return (
    start >= today &&
    difference >= 0 &&
    difference <= MAX_RESERVATION_DAY_DIFFERENCE
  );
}
