import { describe, expect, it } from "vitest";
import {
  centsToDecimalString,
  formatCurrency,
  parseAmountToCents,
} from "./money";

describe("parseAmountToCents", () => {
  it("parses plain decimals", () => {
    expect(parseAmountToCents("1234.56")).toBe(123456);
  });

  it("parses pt-BR formatting", () => {
    expect(parseAmountToCents("1.234,56")).toBe(123456);
    expect(parseAmountToCents("R$ 12,00")).toBe(1200);
  });

  it("parses integers and comma-only decimals", () => {
    expect(parseAmountToCents("42")).toBe(4200);
    expect(parseAmountToCents("42,5")).toBe(4250);
  });

  it("returns null for garbage", () => {
    expect(parseAmountToCents("")).toBeNull();
    expect(parseAmountToCents("abc")).toBeNull();
  });
});

describe("formatCurrency", () => {
  it("formats BRL by default", () => {
    // non-breaking space between symbol and number
    expect(formatCurrency(123456).replace(/ /g, " ")).toBe("R$ 1.234,56");
  });

  it("adds an explicit plus when signed", () => {
    expect(formatCurrency(1000, { signed: true })).toMatch(/^\+/);
  });
});

describe("centsToDecimalString", () => {
  it("always keeps two decimals", () => {
    expect(centsToDecimalString(1200)).toBe("12.00");
    expect(centsToDecimalString(1234)).toBe("12.34");
  });
});
