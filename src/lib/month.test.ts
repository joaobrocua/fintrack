import { describe, expect, it } from "vitest";
import {
  dateToMonthParam,
  isMonthParam,
  monthParamToDate,
  monthRange,
  shiftMonthParam,
} from "./month";

describe("month helpers", () => {
  it("validates the yyyy-mm shape", () => {
    expect(isMonthParam("2026-09")).toBe(true);
    expect(isMonthParam("2026-13")).toBe(false);
    expect(isMonthParam("2026-9")).toBe(false);
    expect(isMonthParam(42)).toBe(false);
  });

  it("round-trips param <-> date at UTC month start", () => {
    const d = monthParamToDate("2026-09");
    expect(d.toISOString()).toBe("2026-09-01T00:00:00.000Z");
    expect(dateToMonthParam(d)).toBe("2026-09");
  });

  it("shifts across year boundaries", () => {
    expect(shiftMonthParam("2026-01", -1)).toBe("2025-12");
    expect(shiftMonthParam("2026-12", 1)).toBe("2027-01");
  });

  it("builds an inclusive month range", () => {
    const { start, end } = monthRange(monthParamToDate("2026-02"));
    expect(start.toISOString()).toBe("2026-02-01T00:00:00.000Z");
    expect(end.toISOString()).toBe("2026-02-28T23:59:59.999Z");
  });
});
