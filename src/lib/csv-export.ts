/** Minimal RFC-4180-ish CSV writer. Uses ";" so pt-BR Excel opens it cleanly. */

const DELIMITER = ";";

function escapeCell(value: string): string {
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
