import { describe, expect, it } from "vitest";
import { isReservationRangeValid } from "./reservation";

describe("isReservationRangeValid", () => {
  const today = new Date(2026, 7, 10, 12);

  it("acepta un rango de siete fechas inclusivas", () => {
    expect(
      isReservationRangeValid(
        new Date(2026, 7, 10),
        new Date(2026, 7, 16),
        today,
      ),
    ).toBe(true);
  });

  it("rechaza rangos de más de siete fechas", () => {
    expect(
      isReservationRangeValid(
        new Date(2026, 7, 10),
        new Date(2026, 7, 17),
        today,
      ),
    ).toBe(false);
  });

  it("rechaza fechas pasadas", () => {
    expect(
      isReservationRangeValid(
        new Date(2026, 7, 9),
        new Date(2026, 7, 10),
        today,
      ),
    ).toBe(false);
  });

  it("rechaza un rango incompleto", () => {
    expect(isReservationRangeValid(new Date(2026, 7, 10), null, today)).toBe(false);
  });
});
