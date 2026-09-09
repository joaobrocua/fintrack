import "server-only";

import { prisma } from "@/lib/prisma";

export type CategoryOption = {
  id: string;
  name: string;
  color: string;
  kind: "INCOME" | "EXPENSE";
};

export type CategoryWithUsage = CategoryOption & {
  icon: string;
  transactionCount: number;
  ruleCount: number;
};

export async function getCategoryOptions(
  userId: string,
): Promise<CategoryOption[]> {
  const rows = await prisma.category.findMany({
    where: { userId },
    select: { id: true, name: true, color: true, kind: true },
    orderBy: [{ kind: "asc" }, { name: "asc" }],
  });
  return rows as CategoryOption[];
}

export async function getCategoriesWithUsage(
  userId: string,
): Promise<CategoryWithUsage[]> {
  const rows = await prisma.category.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      color: true,
      kind: true,
      icon: true,
      _count: { select: { transactions: true, rules: true } },
    },
    orderBy: [{ kind: "asc" }, { name: "asc" }],
  });

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    color: r.color,
    kind: r.kind as "INCOME" | "EXPENSE",
    icon: r.icon,
    transactionCount: r._count.transactions,
    ruleCount: r._count.rules,
  }));
}
