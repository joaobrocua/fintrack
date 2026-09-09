/** Minimal RFC-4180-ish CSV writer. Uses ";" so pt-BR Excel opens it cleanly. */

const DELIMITER = ";";

/**
 * Neutralise CSV formula injection: a cell a spreadsheet would evaluate
 * (starts with = @ TAB CR, or a leading +/- that isn't just a number) gets a
 * leading apostrophe so it's imported as text. Plain amounts like "-289,90"
 * are left alone.
 */
function defuseFormula(value: string): string {
  if (/^[=@+\t\r]/.test(value)) return `'${value}`;
  // A leading "-" is defused too, unless the cell is just a negative number
  // (amounts like "-289,90" must stay numeric).
  if (value.startsWith("-") && !/^-[\d.,\s]*$/.test(value)) return `'${value}`;
  return value;
}

function escapeCell(raw: string): string {
  const value = defuseFormula(raw);
  if (
    value.includes(DELIMITER) ||
    value.includes('"') ||
    /[\r\n]/.test(value)
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function toCsv(
  rows: Array<Record<string, string | number>>,
  columns: { key: string; header: string }[],
): string {
  const lines: string[] = [];
  lines.push(columns.map((c) => escapeCell(c.header)).join(DELIMITER));
  for (const row of rows) {
    lines.push(
      columns.map((c) => escapeCell(String(row[c.key] ?? ""))).join(DELIMITER),
    );
  }
  // BOM so Excel detects UTF-8.
  return `﻿${lines.join("\r\n")}`;
}

/** "-1.234,56" / "1.234,56" — pt-BR decimal, sign preserved. */
export function centsToCsvAmount(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
