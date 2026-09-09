import { describe, expect, it } from "vitest";
import {
  normalizeRows,
  parseFlexibleDate,
  suggestMapping,
  type ColumnMapping,
} from "./csv";

describe("parseFlexibleDate", () => {
  it("accepts Brazilian and ISO formats", () => {
    expect(parseFlexibleDate("09/02/2026")).toBe("2026-02-09");
    expect(parseFlexibleDate("9/2/26")).toBe("2026-02-09");
    expect(parseFlexibleDate("2026-02-09")).toBe("2026-02-09");
    expect(parseFlexibleDate("09.02.2026")).toBe("2026-02-09");
    expect(parseFlexibleDate("2026-02-09T10:30:00")).toBe("2026-02-09");
  });

  it("rejects nonsense and impossible dates", () => {
    expect(parseFlexibleDate("")).toBeNull();
    expect(parseFlexibleDate("32/01/2026")).toBeNull();
    expect(parseFlexibleDate("2026-13-01")).toBeNull();
    expect(parseFlexibleDate("hoje")).toBeNull();
  });
});

describe("suggestMapping", () => {
  it("matches common header names", () => {
    const mapping = suggestMapping(["Data", "Histórico", "Valor (R$)"]);
    expect(mapping.date).toBe("Data");
    expect(mapping.description).toBe("Histórico");
    expect(mapping.amount).toBe("Valor (R$)");
  });
});

describe("normalizeRows", () => {
  const single: ColumnMapping = {
    date: "Data",
    description: "Descrição",
    amountMode: "single",
    amount: "Valor",
  };

  it("classifies sign into kind and stores positive cents", () => {
    const { rows, errors } = normalizeRows(
      [
        { Data: "01/02/2026", Descrição: "Salário", Valor: "5.000,00" },
        { Data: "02/02/2026", Descrição: "Mercado", Valor: "-289,90" },
      ],
      single,
    );
    expect(errors).toHaveLength(0);
    expect(rows[0]).toMatchObject({ kind: "INCOME", amountCents: 500000 });
    expect(rows[1]).toMatchObject({ kind: "EXPENSE", amountCents: 28990 });
  });

  it("collects errors for bad rows without dropping good ones", () => {
    const { rows, errors } = normalizeRows(
      [
        { Data: "bad", Descrição: "x", Valor: "1,00" },
        { Data: "03/02/2026", Descrição: "", Valor: "1,00" },
        { Data: "04/02/2026", Descrição: "ok", Valor: "10,00" },
      ],
      single,
    );
    expect(rows).toHaveLength(1);
    expect(errors).toHaveLength(2);
  });

  it("supports split inflow/outflow columns", () => {
    const mapping: ColumnMapping = {
      date: "Data",
      description: "Descrição",
      amountMode: "split",
      inflow: "Crédito",
      outflow: "Débito",
    };
    const { rows } = normalizeRows(
      [
        {
          Data: "01/02/2026",
          Descrição: "Depósito",
          Crédito: "100,00",
          Débito: "",
        },
        {
          Data: "02/02/2026",
          Descrição: "Conta de luz",
          Crédito: "",
          Débito: "80,00",
        },
      ],
      mapping,
    );
    expect(rows[0]).toMatchObject({ kind: "INCOME", amountCents: 10000 });
    expect(rows[1]).toMatchObject({ kind: "EXPENSE", amountCents: 8000 });
  });
});
