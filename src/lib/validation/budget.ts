import { z } from "zod";
import { isMonthParam } from "@/lib/month";
import { parseAmountToCents } from "@/lib/money";

export const setBudgetSchema = z.object({
  categoryId: z.string().min(1),
  month: z.string().refine(isMonthParam, "Mês inválido"),
  /** Empty or "0" removes the budget. */
  limit: z
    .string()
    .trim()
    .transform((value, ctx) => {
      if (!value) return 0;
      const cents = parseAmountToCents(value);
      if (cents === null || cents < 0) {
        ctx.addIssue({ code: "custom", message: "Valor inválido" });
        return z.NEVER;
      }
      return cents;
    }),
});

export type SetBudgetInput = z.input<typeof setBudgetSchema>;
