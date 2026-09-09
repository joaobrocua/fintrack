import { z } from "zod";
import { parseAmountToCents } from "@/lib/money";

export const ACCOUNT_TYPES = [
  "CHECKING",
  "SAVINGS",
  "CREDIT_CARD",
  "CASH",
  "INVESTMENT",
] as const;

export const ACCOUNT_TYPE_LABELS: Record<
  (typeof ACCOUNT_TYPES)[number],
  string
> = {
  CHECKING: "Conta corrente",
  SAVINGS: "Poupança",
  CREDIT_CARD: "Cartão de crédito",
  CASH: "Dinheiro",
  INVESTMENT: "Investimentos",
};

const amountField = z
  .string()
  .trim()
  .transform((value, ctx) => {
    if (!value) return 0;
    const cents = parseAmountToCents(value);
    if (cents === null) {
      ctx.addIssue({ code: "custom", message: "Valor inválido" });
      return z.NEVER;
    }
    return cents;
  });

export const accountFormSchema = z.object({
  name: z.string().trim().min(1, "Informe um nome").max(60, "Nome muito longo"),
  type: z.enum(ACCOUNT_TYPES),
  institution: z
    .string()
    .trim()
    .max(60)
    .optional()
    .transform((v) => v || null),
  initialBalance: amountField,
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida")
    .default("#6366f1"),
});

export type AccountFormInput = z.input<typeof accountFormSchema>;
export type AccountFormValues = z.output<typeof accountFormSchema>;
