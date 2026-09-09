import type { Prisma } from "@prisma/client";

/** Seed categories every new account starts with. */
export const DEFAULT_CATEGORIES: Array<
  Pick<Prisma.CategoryCreateManyInput, "name" | "kind" | "color" | "icon">
> = [
  { name: "Salário", kind: "INCOME", color: "#16a34a", icon: "wallet" },
  { name: "Renda extra", kind: "INCOME", color: "#0d9488", icon: "plus" },
  { name: "Moradia", kind: "EXPENSE", color: "#6366f1", icon: "home" },
  { name: "Alimentação", kind: "EXPENSE", color: "#f97316", icon: "utensils" },
  { name: "Transporte", kind: "EXPENSE", color: "#0ea5e9", icon: "car" },
  { name: "Saúde", kind: "EXPENSE", color: "#ef4444", icon: "heart-pulse" },
  { name: "Lazer", kind: "EXPENSE", color: "#a855f7", icon: "party-popper" },
  { name: "Assinaturas", kind: "EXPENSE", color: "#ec4899", icon: "repeat" },
  {
    name: "Educação",
    kind: "EXPENSE",
    color: "#eab308",
    icon: "graduation-cap",
  },
  { name: "Compras", kind: "EXPENSE", color: "#14b8a6", icon: "shopping-bag" },
  { name: "Outros", kind: "EXPENSE", color: "#64748b", icon: "ellipsis" },
];

export function defaultCategoriesFor(
  userId: string,
): Prisma.CategoryCreateManyInput[] {
  return DEFAULT_CATEGORIES.map((c) => ({ ...c, userId }));
}
