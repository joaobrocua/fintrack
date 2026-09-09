import { describe, expect, it } from "vitest";
import { isPeriodPreset, resolvePeriod } from "./period";

const NOW = new Date("2026-09-15T10:00:00Z");

describe("isPeriodPreset", () => {
  it("accepts known presets only", () => {
    expect(isPeriodPreset("this-month")).toBe(true);
    expect(isPeriodPreset("last-6-months")).toBe(true);
    expect(isPeriodPreset("yesterday")).toBe(false);
    expect(isPeriodPreset(undefined)).toBe(false);
  });
});

describe("resolvePeriod", () => {
  it("this-month spans the calendar month", () => {
    const { from, to } = resolvePeriod("this-month", NOW);
    expect(from?.toISOString()).toBe("2026-09-01T00:00:00.000Z");
    expect(to?.toISOString()).toBe("2026-09-30T23:59:59.999Z");
  });

  it("last-month is the previous calendar month", () => {
    const { from, to } = resolvePeriod("last-month", NOW);
    expect(from?.toISOString()).toBe("2026-08-01T00:00:00.000Z");
    expect(to?.toISOString()).toBe("2026-08-31T23:59:59.999Z");
  });

  it("last-3-months covers three months up to now", () => {
    const { from, to } = resolvePeriod("last-3-months", NOW);
    expect(from?.toISOString()).toBe("2026-07-01T00:00:00.000Z");
    expect(to?.toISOString()).toBe("2026-09-30T23:59:59.999Z");
  });

  it("this-year spans Jan–Dec", () => {
    const { from, to } = resolvePeriod("this-year", NOW);
    expect(from?.getUTCMonth()).toBe(0);
    expect(to?.getUTCMonth()).toBe(11);
  });

  it("all has no bounds", () => {
    expect(resolvePeriod("all", NOW)).toMatchObject({ from: null, to: null });
  });
});
