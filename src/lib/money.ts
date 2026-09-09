/**
 * Money is stored everywhere as an integer number of cents to avoid
 * floating-point drift. These helpers are the only place that bridges
 * cents <-> decimal <-> formatted string.
 */

/** Parse a user-entered amount ("1.234,56", "1234.56", "R$ 12,00") into cents. */
export function parseAmountToCents(input: string): number | null {
  const raw = input.trim().replace(/\s/g, "").replace(/^R\$/i, "");
  if (!raw) return null;

  let normalized = raw;
  const hasComma = raw.includes(",");
  const hasDot = raw.includes(".");

  if (hasComma && hasDot) {
    // Last separator is the decimal one.
    normalized =
      raw.lastIndexOf(",") > raw.lastIndexOf(".")
        ? raw.replace(/\./g, "").replace(",", ".")
        : raw.replace(/,/g, "");
  } else if (hasComma) {
    normalized = raw.replace(",", ".");
  }

  const value = Number(normalized);
  if (!Number.isFinite(value)) return null;
  return Math.round(value * 100);
}

/** Format cents as a localized currency string. */
export function formatCurrency(
  cents: number,
  {
    currency = "BRL",
    locale = "pt-BR",
    signed = false,
  }: {
    currency?: string;
    locale?: string;
    signed?: boolean;
  } = {},
): string {
  const formatted = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(cents / 100);
  if (signed && cents > 0) return `+${formatted}`;
  return formatted;
}

/** Cents -> plain decimal string for form inputs ("1234.56"). */
export function centsToDecimalString(cents: number): string {
  return (cents / 100).toFixed(2);
}
