import "server-only";

import { monthParamToDate, monthRange, shiftMonthParam } from "@/lib/month";
import { prisma } from "@/lib/prisma";

export type BudgetRow = {
  categoryId: string;
  name: string;
  color: string;
  icon: string;
  limitCents: number; // 0 = no budget set
  spentCents: number;
};

export type BudgetMonth = {
  month: string;
  rows: BudgetRow[];
  totals: { limit: number; spent: number };
  previousMonthHasBudgets: boolean;
};

export async function getBudgetMonth(
  userId: string,
  month: string,
): Promise<BudgetMonth> {
  const monthStart = monthParamToDate(month);
  const { start, end } = monthRange(monthStart);
  const prevMonthStart = monthParamToDate(shiftMonthParam(month, -1));

  const [categories, budgets, spendByCategory, prevCount] = await Promise.all([
    prisma.category.findMany({
      where: { userId, kind: "EXPENSE" },
      select: { id: true, name: true, color: true, icon: true },
      orderBy: { name: "asc" },
    }),
    prisma.budget.findMany({
      where: { userId, month: monthStart },
      select: { categoryId: true, limitCents: true },
    }),
    prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        userId,
        kind: "EXPENSE",
        categoryId: { not: null },
        date: { gte: start, lte: end },
      },
      _sum: { amountCents: true },
    }),
    prisma.budget.count({ where: { userId, month: prevMonthStart } }),
  ]);

  const limitByCat = new Map(budgets.map((b) => [b.categoryId, b.limitCents]));
  const spentByCat = new Map(
    spendByCategory.map((s) => [s.categoryId, s._sum.amountCents ?? 0]),
  );

  const rows: BudgetRow[] = categories.map((c) => ({
    categoryId: c.id,
    name: c.name,
    color: c.color,
    icon: c.icon,
    limitCents: limitByCat.get(c.id) ?? 0,
    spentCents: spentByCat.get(c.id) ?? 0,
  }));

  rows.sort((a, b) => {
    const aHas = a.limitCents > 0 ? 0 : 1;
    const bHas = b.limitCents > 0 ? 0 : 1;
    if (aHas !== bHas) return aHas - bHas;
    return b.spentCents - a.spentCents;
  });

  return {
    month,
    rows,
    totals: {
      limit: rows.reduce((s, r) => s + r.limitCents, 0),
      spent: rows.reduce(
        (s, r) => s + (r.limitCents > 0 ? r.spentCents : 0),
        0,
      ),
    },
    previousMonthHasBudgets: prevCount > 0,
  };
}
