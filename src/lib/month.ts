/** Helpers for the `?month=yyyy-mm` budget navigation. */

const MONTH_RE = /^(\d{4})-(\d{2})$/;

export function isMonthParam(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const m = value.match(MONTH_RE);
  return Boolean(m) && +m![2] >= 1 && +m![2] <= 12;
}

export function currentMonthParam(now: Date = new Date()): string {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** yyyy-mm -> UTC midnight of the first day of that month. */
export function monthParamToDate(param: string): Date {
  const [, y, m] = param.match(MONTH_RE)!;
  return new Date(Date.UTC(+y, +m - 1, 1));
}

export function dateToMonthParam(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function shiftMonthParam(param: string, delta: number): string {
  const d = monthParamToDate(param);
  d.setUTCMonth(d.getUTCMonth() + delta);
  return dateToMonthParam(d);
}

/** Inclusive [start, end] range covering the whole month. */
export function monthRange(monthStart: Date): { start: Date; end: Date } {
  const start = new Date(
    Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth(), 1),
  );
  const end = new Date(
    Date.UTC(
      monthStart.getUTCFullYear(),
      monthStart.getUTCMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    ),
  );
  return { start, end };
}

export function formatMonthParam(param: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(monthParamToDate(param));
}
