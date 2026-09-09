import { z } from "zod";
import { isValidRegex } from "@/lib/rule-engine";

export const RULE_MATCH_TYPES = [
  "CONTAINS",
  "STARTS_WITH",
  "ENDS_WITH",
  "EQUALS",
  "REGEX",
] as const;

export const RULE_MATCH_TYPE_LABELS: Record<
  (typeof RULE_MATCH_TYPES)[number],
  string
> = {
  CONTAINS: "Contém",
  STARTS_WITH: "Começa com",
  ENDS_WITH: "Termina com",
  EQUALS: "É igual a",
  REGEX: "Regex",
};

export const ruleFormSchema = z
  .object({
    matchType: z.enum(RULE_MATCH_TYPES),
    pattern: z
      .string()
      .trim()
      .min(1, "Informe um padrão")
      .max(120, "Padrão muito longo"),
    categoryId: z.string().min(1, "Selecione uma categoria"),
    priority: z.coerce.number().int().min(0).max(999).default(0),
    enabled: z.boolean().default(true),
  })
  .refine((data) => data.matchType !== "REGEX" || isValidRegex(data.pattern), {
    message: "Expressão regular inválida",
    path: ["pattern"],
  });

export type RuleFormInput = z.input<typeof ruleFormSchema>;
export type RuleFormValues = z.output<typeof ruleFormSchema>;
