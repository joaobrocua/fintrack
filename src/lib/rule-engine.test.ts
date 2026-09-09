import { describe, expect, it } from "vitest";
import { categorize, sortRules, type CategorizationRule } from "./rule-engine";

const rule = (over: Partial<CategorizationRule>): CategorizationRule => ({
  id: "r",
  matchType: "CONTAINS",
  pattern: "ifood",
  categoryId: "food",
  priority: 0,
  enabled: true,
  ...over,
});

describe("categorize", () => {
  it("matches CONTAINS case-insensitively", () => {
    expect(categorize("PAG*IFOOD SP", [rule({})])).toBe("food");
  });

  it("respects match types", () => {
    expect(
      categorize("UBER trip", [
        rule({
          matchType: "STARTS_WITH",
          pattern: "uber",
          categoryId: "transp",
        }),
      ]),
    ).toBe("transp");
    expect(
      categorize("monthly netflix", [
        rule({
          matchType: "ENDS_WITH",
          pattern: "netflix",
          categoryId: "subs",
        }),
      ]),
    ).toBe("subs");
    expect(
      categorize("salario", [
        rule({ matchType: "EQUALS", pattern: "salario", categoryId: "inc" }),
      ]),
    ).toBe("inc");
  });

  it("supports regex and ignores invalid patterns", () => {
    expect(
      categorize("AMZN Mktp BR", [
        rule({
          matchType: "REGEX",
          pattern: "amzn|amazon",
          categoryId: "shop",
        }),
      ]),
    ).toBe("shop");
    expect(
      categorize("anything", [
        rule({ matchType: "REGEX", pattern: "([", categoryId: "x" }),
      ]),
    ).toBeNull();
  });

  it("skips disabled rules and returns null when nothing matches", () => {
    expect(categorize("ifood", [rule({ enabled: false })])).toBeNull();
    expect(categorize("padaria", [rule({})])).toBeNull();
  });

  it("higher priority wins; ties go to the older rule", () => {
    const rules = [
      rule({ id: "a", pattern: "loja", categoryId: "low", priority: 1 }),
      rule({ id: "b", pattern: "loja", categoryId: "high", priority: 5 }),
    ];
    expect(categorize("Loja X", rules)).toBe("high");

    const tie = [
      rule({
        id: "old",
        pattern: "x",
        categoryId: "old",
        createdAt: "2026-01-01",
      }),
      rule({
        id: "new",
        pattern: "x",
        categoryId: "new",
        createdAt: "2026-06-01",
      }),
    ];
    expect(categorize("x", tie)).toBe("old");
  });
});

describe("sortRules", () => {
  it("does not mutate its input", () => {
    const input = [rule({ priority: 1 }), rule({ priority: 9 })];
    const copy = [...input];
    sortRules(input);
    expect(input).toEqual(copy);
  });
});
