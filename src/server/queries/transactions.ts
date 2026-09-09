import "server-only";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { TransactionFilters } from "@/lib/validation/transaction";

export const PAGE_SIZE = 25;

function buildWhere(
  userId: string,
  filters: TransactionFilters,
): Prisma.TransactionWhereInput {
  const where: Prisma.TransactionWhereInput = { userId };

  if (filters.from || filters.to) {
    where.date = {};
    if (filters.from) where.date.gte = new Date(`${filters.from}T00:00:00`);
    if (filters.to) where.date.lte = new Date(`${filters.to}T23:59:59`);
  }
  if (filters.accountId) where.financialAccountId = filters.accountId;
  if (filters.categoryId) {
    where.categoryId =
      filters.categoryId === "none" ? null : filters.categoryId;
  }
  if (filters.kind) where.kind = filters.kind;
  if (filters.q) {
    where.description = { contains: filters.q, mode: "insensitive" };
  }

  return where;
}

export async function getTransactions(
  userId: string,
  filters: TransactionFilters,
) {
  const where = buildWhere(userId, filters);
  const page = filters.page;

  const [rows, total, totals] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, color: true } },
        financialAccount: { select: { id: true, name: true, color: true } },
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.transaction.count({ where }),
    prisma.transaction.groupBy({
      by: ["kind"],
      where,
      _sum: { amountCents: true },
    }),
  ]);

  const income = totals.find((t) => t.kind === "INCOME")?._sum.amountCents ?? 0;
  const expense =
    totals.find((t) => t.kind === "EXPENSE")?._sum.amountCents ?? 0;

  return {
    rows,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    total,
    summary: { income, expense, net: income - expense },
  };
}

export type TransactionRow = Awaited<
  ReturnType<typeof getTransactions>
>["rows"][number];
