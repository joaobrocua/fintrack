import { describe, expect, it } from "vitest";
import { transactionFilterSchema, transactionFormSchema } from "./transaction";

const validForm = {
  date: "2026-09-09",
  description: "Mercado",
  amount: "289,90",
  kind: "EXPENSE" as const,
  financialAccountId: "acc_1",
  categoryId: "cat_1",
  notes: "",
};

describe("transactionFormSchema", () => {
  it("parses a pt-BR amount into positive cents", () => {
    const parsed = transactionFormSchema.parse(validForm);
    expect(parsed.amount).toBe(28990);
  });

  it("maps the sentinel category to undefined", () => {
    const parsed = transactionFormSchema.parse({
      ...validForm,
      categoryId: "none",
    });
    expect(parsed.categoryId).toBeUndefined();
  });

  it("rejects zero or negative amounts", () => {
    expect(
      transactionFormSchema.safeParse({ ...validForm, amount: "0" }).success,
    ).toBe(false);
    expect(
      transactionFormSchema.safeParse({ ...validForm, amount: "-5" }).success,
    ).toBe(false);
  });

  it("requires an account", () => {
    expect(
      transactionFormSchema.safeParse({ ...validForm, financialAccountId: "" })
        .success,
    ).toBe(false);
  });
});

describe("transactionFilterSchema", () => {
  it("defaults page to 1 and drops junk", () => {
    const parsed = transactionFilterSchema.parse({
      page: "abc",
      from: "not-a-date",
    });
    expect(parsed.page).toBe(1);
    expect(parsed.from).toBeUndefined();
  });

  it("keeps valid filters", () => {
    const parsed = transactionFilterSchema.parse({
      from: "2026-01-01",
      kind: "INCOME",
      page: "3",
    });
    expect(parsed).toMatchObject({
      from: "2026-01-01",
      kind: "INCOME",
      page: 3,
    });
  });
});
