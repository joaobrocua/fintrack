export const PERIOD_PRESETS = [
  "this-month",
  "last-month",
  "last-3-months",
  "last-6-months",
  "this-year",
  "all",
] as const;

export type PeriodPreset = (typeof PERIOD_PRESETS)[number];

export const PERIOD_LABELS: Record<PeriodPreset, string> = {
  "this-month": "Este mês",
  "last-month": "Mês passado",
  "last-3-months": "Últimos 3 meses",
  "last-6-months": "Últimos 6 meses",
  "this-year": "Este ano",
  all: "Tudo",
};

export type ResolvedPeriod = {
  preset: PeriodPreset;
  /** null on "all" */
  from: Date | null;
  to: Date | null;
};

export function isPeriodPreset(value: unknown): value is PeriodPreset {
  return (
    typeof value === "string" &&
    (PERIOD_PRESETS as readonly string[]).includes(value)
  );
}

/** Resolve a preset to a concrete [from, to] range, relative to `now`. */
export function resolvePeriod(
  preset: PeriodPreset,
  now: Date = new Date(),
): ResolvedPeriod {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const startOfMonth = (year: number, month: number) =>
    new Date(Date.UTC(year, month, 1, 0, 0, 0));
  const endOfMonth = (year: number, month: number) =>
    new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

  switch (preset) {
    case "this-month":
      return { preset, from: startOfMonth(y, m), to: endOfMonth(y, m) };
    case "last-month":
      return { preset, from: startOfMonth(y, m - 1), to: endOfMonth(y, m - 1) };
    case "last-3-months":
      return { preset, from: startOfMonth(y, m - 2), to: endOfMonth(y, m) };
    case "last-6-months":
      return { preset, from: startOfMonth(y, m - 5), to: endOfMonth(y, m) };
    case "this-year":
      return {
        preset,
        from: new Date(Date.UTC(y, 0, 1)),
        to: new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999)),
      };
    case "all":
      return { preset, from: null, to: null };
  }
}
