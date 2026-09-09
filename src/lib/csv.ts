import { parseAmountToCents } from "@/lib/money";

export type ColumnMapping = {
  date: string;
  description: string;
  /** "single" = one signed column; "split" = separate inflow/outflow columns. */
  amountMode: "single" | "split";
  amount?: string;
  inflow?: string;
  outflow?: string;
  /** When single-column amounts are positive for expenses (some CC exports). */
  invertSign?: boolean;
};

export type NormalizedRow = {
  index: number;
  date: string; // yyyy-mm-dd
  description: string;
  amountCents: number;
  kind: "INCOME" | "EXPENSE";
};

export type RowError = { index: number; reason: string };

/**
 * Parse a date in the formats Brazilian banks export: dd/mm/yyyy, dd-mm-yyyy,
 * dd.mm.yyyy, yyyy-mm-dd (optionally with a time part). Day-first when
 * ambiguous. Returns yyyy-mm-dd or null.
 */
export function parseFlexibleDate(input: string): string | null {
  const value = input.trim();
  if (!value) return null;

  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s].*)?$/);
  if (iso) {
    const [, y, m, d] = iso;
    return isValidYmd(+y, +m, +d) ? `${y}-${m}-${d}` : null;
  }

  const dmy = value.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2}|\d{4})$/);
  if (dmy) {
    const [, d, m, rawYear] = dmy;
    const year = rawYear.length === 2 ? `20${rawYear}` : rawYear;
    const day = d.padStart(2, "0");
    const month = m.padStart(2, "0");
    return isValidYmd(+year, +month, +day) ? `${year}-${month}-${day}` : null;
  }

  return null;
}

function isValidYmd(y: number, m: number, d: number): boolean {
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
}

/** Guess which raw header best matches a target field. */
export function guessColumn(
  headers: string[],
  candidates: string[],
): string | undefined {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");
  const wanted = candidates.map(norm);
  return headers.find((h) => wanted.some((w) => norm(h).includes(w)));
}

export function suggestMapping(headers: string[]): ColumnMapping {
  return {
    date: guessColumn(headers, ["data", "date"]) ?? headers[0] ?? "",
    description:
      guessColumn(headers, [
        "descricao",
        "historico",
        "lancamento",
        "description",
        "memo",
        "detalhe",
      ]) ??
      headers[1] ??
      "",
    amountMode: "single",
    amount:
      guessColumn(headers, ["valor", "amount", "montante"]) ?? headers[2] ?? "",
    inflow: guessColumn(headers, ["credito", "entrada", "credit"]),
    outflow: guessColumn(headers, ["debito", "saida", "debit"]),
  };
}

/** Turn raw CSV records into normalized rows, collecting per-row errors. */
export function normalizeRows(
  records: Record<string, string>[],
  mapping: ColumnMapping,
): { rows: NormalizedRow[]; errors: RowError[] } {
  const rows: NormalizedRow[] = [];
  const errors: RowError[] = [];

  records.forEach((record, index) => {
    const rawDate = (record[mapping.date] ?? "").trim();
    const description = (record[mapping.description] ?? "").trim();

    const date = parseFlexibleDate(rawDate);
    if (!date) {
      errors.push({ index, reason: `Data inválida: "${rawDate}"` });
      return;
    }
    if (!description) {
      errors.push({ index, reason: "Descrição vazia" });
      return;
    }

    let signedCents: number | null = null;

    if (mapping.amountMode === "split") {
      const inflow = mapping.inflow
        ? parseAmountToCents(record[mapping.inflow] ?? "")
        : 0;
      const outflow = mapping.outflow
        ? parseAmountToCents(record[mapping.outflow] ?? "")
        : 0;
      const inAbs = Math.abs(inflow ?? 0);
      const outAbs = Math.abs(outflow ?? 0);
      if (inAbs === 0 && outAbs === 0) {
        errors.push({ index, reason: "Sem valor de entrada nem saída" });
        return;
      }
      signedCents = inAbs >= outAbs ? inAbs : -outAbs;
    } else {
      const raw = (record[mapping.amount ?? ""] ?? "").trim();
      const cents = parseAmountToCents(raw);
      if (cents === null || cents === 0) {
        errors.push({ index, reason: `Valor inválido: "${raw}"` });
        return;
      }
      signedCents = mapping.invertSign ? -cents : cents;
    }

    const kind: NormalizedRow["kind"] = signedCents >= 0 ? "INCOME" : "EXPENSE";
    rows.push({
      index,
      date,
      description,
      amountCents: Math.abs(signedCents),
      kind,
    });
  });

  return { rows, errors };
}
