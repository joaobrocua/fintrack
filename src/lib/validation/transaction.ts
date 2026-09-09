import { z } from "zod";
import { parseAmountToCents } from "@/lib/money";

export const TRANSACTION_KINDS = ["INCOME", "EXPENSE"] as const;

export const TRANSACTION_KIND_LABELS: Record<
  (typeof TRANSACTION_KINDS)[number],
  string
> = {
  INCOME: "Receita",
  EXPENSE: "Despesa",
};

export const transactionFormSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  description: z
    .string()
    .trim()
    .min(1, "Informe uma descrição")
    .max(140, "Descrição muito longa"),
  amount: z
    .string()
    .trim()
    .transform((value, ctx) => {
      const cents = parseAmountToCents(value);
      if (cents === null || cents <= 0) {
        ctx.addIssue({
          code: "custom",
          message: "Informe um valor maior que zero",
        });
        return z.NEVER;
      }
      return cents;
    }),
  kind: z.enum(TRANSACTION_KINDS),
  financialAccountId: z.string().min(1, "Selecione uma conta"),
  categoryId: z
    .string()
    .optional()
    .transform((v) => (v && v !== "none" ? v : undefined)),
  notes: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((v) => v || undefined),
});

export type TransactionFormInput = z.input<typeof transactionFormSchema>;
export type TransactionFormValues = z.output<typeof transactionFormSchema>;

/** Filters accepted by the transactions list (all optional, from the URL). */
export const transactionFilterSchema = z.object({
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .catch(undefined),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .catch(undefined),
  accountId: z.string().optional().catch(undefined),
  categoryId: z.string().optional().catch(undefined),
  kind: z.enum(TRANSACTION_KINDS).optional().catch(undefined),
  q: z.string().trim().max(140).optional().catch(undefined),
  page: z.coerce.number().int().min(1).catch(1).default(1),
});

export type TransactionFilters = z.output<typeof transactionFilterSchema>;
