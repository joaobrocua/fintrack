import "server-only";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ResolvedPeriod } from "@/lib/period";

export type MonthlyFlowPoint = {
  month: string; // yyyy-mm
  label: string; // "ago/26"
  income: number;
  expense: number;
};

export type CategorySlice = {
  categoryId: string | null;
  name: string;
  color: string;
  total: number;
};

export type BalancePoint = { date: string; balance: number };

export type MerchantRow = { description: string; total: number; count: number };

export type DashboardData = {
  hasData: boolean;
  totals: { income: number; expense: number; net: number };
  netWorth: number;
  monthlyFlow: MonthlyFlowPoint[];
  categorySpend: CategorySlice[];
  balanceTrend: BalancePoint[];
  topMerchants: MerchantRow[];
};

const MONTH_LABEL = new Intl.DateTimeFormat("pt-BR", {
  month: "short",
  year: "2-digit",
});

function monthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function getDashboardData(
  userId: string,
  period: ResolvedPeriod,
): Promise<DashboardData> {
  const dateFilter: Prisma.DateTimeFilter = {};
  if (period.from) dateFilter.gte = period.from;
  if (period.to) dateFilter.lte = period.to;
  const inPeriod: Prisma.TransactionWhereInput = { userId };
  if (period.from || period.to) inPeriod.date = dateFilter;

  const [accountAgg, beforeAgg, periodTx, categories, totalCount] =
    await Promise.all([
      prisma.financialAccount.aggregate({
        where: { userId, archived: false },
        _sum: { initialBalance: true },
      }),
      period.from
        ? prisma.transaction.groupBy({
            by: ["kind"],
            where: { userId, date: { lt: period.from } },
            _sum: { amountCents: true },
          })
        : Promise.resolve(
            [] as Array<{ kind: string; _sum: { amountCents: number | null } }>,
          ),
      prisma.transaction.findMany({
        where: inPeriod,
        select: {
          date: true,
          amountCents: true,
          kind: true,
          categoryId: true,
          description: true,
        },
        orderBy: { date: "asc" },
      }),
      prisma.category.findMany({
        where: { userId },
        select: { id: true, name: true, color: true },
      }),
      prisma.transaction.count({ where: { userId } }),
    ]);

  const catMap = new Map(categories.map((c) => [c.id, c]));

  // All-time net worth.
  const allTimeAgg = await prisma.transaction.groupBy({
    by: ["kind"],
    where: { userId },
    _sum: { amountCents: true },
  });
  const sumBy = (
    rows: Array<{ kind: string; _sum: { amountCents: number | null } }>,
    kind: string,
  ) => rows.find((r) => r.kind === kind)?._sum.amountCents ?? 0;

  const initial = accountAgg._sum.initialBalance ?? 0;
  const netWorth =
    initial + sumBy(allTimeAgg, "INCOME") - sumBy(allTimeAgg, "EXPENSE");

  // Period totals.
  let income = 0;
  let expense = 0;
  const monthly = new Map<string, { income: number; expense: number }>();
  const byCategory = new Map<string | null, number>();
  const byMerchant = new Map<string, { total: number; count: number }>();

  for (const tx of periodTx) {
    const isIncome = tx.kind === "INCOME";
    if (isIncome) income += tx.amountCents;
    else expense += tx.amountCents;

    const mk = monthKey(tx.date);
    const bucket = monthly.get(mk) ?? { income: 0, expense: 0 };
    if (isIncome) bucket.income += tx.amountCents;
    else bucket.expense += tx.amountCents;
    monthly.set(mk, bucket);

    if (!isIncome) {
      byCategory.set(
        tx.categoryId,
        (byCategory.get(tx.categoryId) ?? 0) + tx.amountCents,
      );
      const key = tx.description.trim().toUpperCase().slice(0, 40);
      const m = byMerchant.get(key) ?? { total: 0, count: 0 };
      m.total += tx.amountCents;
      m.count += 1;
      byMerchant.set(key, m);
    }
  }

  const monthlyFlow: MonthlyFlowPoint[] = [...monthly.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, v]) => ({
      month,
      label: MONTH_LABEL.format(new Date(`${month}-15T12:00:00`)),
      income: v.income,
      expense: v.expense,
    }));

  const categorySpend: CategorySlice[] = [...byCategory.entries()]
    .map(([categoryId, total]) => {
      const cat = categoryId ? catMap.get(categoryId) : undefined;
      return {
        categoryId,
        name: cat?.name ?? "Sem categoria",
        color: cat?.color ?? "#94a3b8",
        total,
      };
    })
    .sort((a, b) => b.total - a.total);

  // Cumulative balance across the period, one point per day with movement.
  const opening =
    initial +
    (period.from
      ? sumBy(beforeAgg, "INCOME") - sumBy(beforeAgg, "EXPENSE")
      : 0);
  const balanceTrend: BalancePoint[] = [];
  let running = opening;
  let lastKey = "";
  for (const tx of periodTx) {
    running += tx.kind === "INCOME" ? tx.amountCents : -tx.amountCents;
    const key = tx.date.toISOString().slice(0, 10);
    if (key === lastKey) {
      balanceTrend[balanceTrend.length - 1].balance = running;
    } else {
      balanceTrend.push({ date: key, balance: running });
      lastKey = key;
    }
  }
  if (balanceTrend.length === 1) {
    balanceTrend.unshift({
      date: period.from
        ? period.from.toISOString().slice(0, 10)
        : balanceTrend[0].date,
      balance: opening,
    });
  }

  const topMerchants: MerchantRow[] = [...byMerchant.entries()]
    .map(([description, v]) => ({ description, ...v }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return {
    hasData: totalCount > 0,
    totals: { income, expense, net: income - expense },
    netWorth,
    monthlyFlow,
    categorySpend,
    balanceTrend,
    topMerchants,
  };
}
