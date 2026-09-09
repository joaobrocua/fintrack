import { describe, expect, it } from "vitest";
import { centsToCsvAmount, toCsv } from "./csv-export";

describe("toCsv", () => {
  const cols = [
    { key: "a", header: "Coluna A" },
    { key: "b", header: "B" },
  ];

  it("writes a header and rows joined by ;", () => {
    const out = toCsv([{ a: "1", b: "x" }], cols).replace("﻿", "");
    expect(out).toBe("Coluna A;B\r\n1;x");
  });

  it("quotes cells containing the delimiter, quotes or newlines", () => {
    const out = toCsv([{ a: 'diz "oi"', b: "linha1\nlinha2" }], cols).replace(
      "﻿",
      "",
    );
    expect(out).toContain('"diz ""oi"""');
    expect(out).toContain('"linha1\nlinha2"');
  });

  it("prepends a UTF-8 BOM", () => {
    expect(toCsv([], cols).startsWith("﻿")).toBe(true);
  });

  it("defuses formula-injection cells but leaves amounts alone", () => {
    const out = toCsv(
      [
        { a: "=SUM(A1:A9)", b: "-289,90" },
        { a: "@cmd", b: "+55 11 99999" },
      ],
      cols,
    ).replace("﻿", "");
    expect(out).toContain("'=SUM(A1:A9)");
    expect(out).toContain("'@cmd");
    expect(out).toContain("'+55 11 99999");
    expect(out).toContain(";-289,90"); // real negative amount untouched
  });
});

describe("centsToCsvAmount", () => {
  it("formats pt-BR with two decimals and sign", () => {
    expect(centsToCsvAmount(-28990)).toBe("-289,90");
    expect(centsToCsvAmount(500000)).toBe("5.000,00");
    expect(centsToCsvAmount(0)).toBe("0,00");
  });
});
