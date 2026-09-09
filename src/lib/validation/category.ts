import { z } from "zod";
import { ICON_NAMES } from "@/lib/icons";

export const CATEGORY_KINDS = ["INCOME", "EXPENSE"] as const;

export const CATEGORY_KIND_LABELS: Record<
  (typeof CATEGORY_KINDS)[number],
  string
> = {
  INCOME: "Receita",
  EXPENSE: "Despesa",
};

export const categoryFormSchema = z.object({
  name: z.string().trim().min(1, "Informe um nome").max(40, "Nome muito longo"),
  kind: z.enum(CATEGORY_KINDS),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida")
    .default("#64748b"),
  icon: z
    .string()
    .refine((v) => ICON_NAMES.includes(v), "Ícone inválido")
    .default("tag"),
});

export type CategoryFormInput = z.input<typeof categoryFormSchema>;
export type CategoryFormValues = z.output<typeof categoryFormSchema>;
