import "server-only";

import { monthParamToDate, monthRange } from "@/lib/month";
import { prisma } from "@/lib/prisma";

export type ReportCategoryRow = {
  name: string;
  color: string;
  total: number;
  share: number; // 0..1 of total expense
};

export type ReportBudgetRow = {
  name: string;
  limitCents: number;
  spentCents: number;
};

export type MonthlyReport = {
  month: string;
  hasData: boolean;
  income: number;
  expense: number;
  net: number;
  savingsRate: number | null; // net / income
  transactionCount: number;
  categorySpend: ReportCategoryRow[];
  budgets: ReportBudgetRow[];
  topMerchants: Array<{ description: string; total: number }>;
};

export async function getMonthlyReport(
  userId: string,
  month: string,
): Promise<MonthlyReport> {
  const monthStart = monthParamToDate(month);
  const { start, end } = monthRange(monthStart);
  const where = { userId, date: { gte: start, lte: end } } as const;

  const [byKind, txs, budgets, categories] = await Promise.all([
    prisma.transaction.groupBy({
      by: ["kind"],
      where,
      _sum: { amountCents: true },
      _count: { _all: true },
    }),
    prisma.transaction.findMany({
      where: { ...where, kind: "EXPENSE" },
      select: { amountCents: true, categoryId: true, description: true },
    }),
    prisma.budget.findMany({
      where: { userId, month: monthStart },
      include: { category: { select: { name: true } } },
    }),
    prisma.category.findMany({
      where: { userId },
      select: { id: true, name: true, color: true },
    }),
  ]);

  const catMap = new Map(categories.map((c) => [c.id, c]));
  const income = byKind.find((k) => k.kind === "INCOME")?._sum.amountCents ?? 0;
  const expense =
    byKind.find((k) => k.kind === "EXPENSE")?._sum.amountCents ?? 0;
  const transactionCount = byKind.reduce((s, k) => s + k._count._all, 0);

  const byCategory = new Map<string | null, number>();
  const byMerchant = new Map<string, number>();
  for (const t of txs) {
    byCategory.set(
      t.categoryId,
      (byCategory.get(t.categoryId) ?? 0) + t.amountCents,
    );
    const key = t.description.trim().toUpperCase().slice(0, 40);
    byMerchant.set(key, (byMerchant.get(key) ?? 0) + t.amountCents);
  }

  const categorySpend: ReportCategoryRow[] = [...byCategory.entries()]
    .map(([categoryId, total]) => {
      const cat = categoryId ? catMap.get(categoryId) : undefined;
      return {
        name: cat?.name ?? "Sem categoria",
        color: cat?.color ?? "#94a3b8",
        total,
        share: expense > 0 ? total / expense : 0,
      };
    })
    .sort((a, b) => b.total - a.total);

  const spentByCat = byCategory;
  const budgetRows: ReportBudgetRow[] = budgets
    .map((b) => ({
      name: b.category.name,
      limitCents: b.limitCents,
      spentCents: spentByCat.get(b.categoryId) ?? 0,
    }))
    .sort((a, b) => b.limitCents - a.limitCents);

  const topMerchants = [...byMerchant.entries()]
    .map(([description, total]) => ({ description, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  return {
    month,
    hasData: transactionCount > 0,
    income,
    expense,
    net: income - expense,
    savingsRate: income > 0 ? (income - expense) / income : null,
    transactionCount,
    categorySpend,
    budgets: budgetRows,
    topMerchants,
  };
}
