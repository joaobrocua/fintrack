import "server-only";

import { prisma } from "@/lib/prisma";

export type AccountWithBalance = {
  id: string;
  name: string;
  type: string;
  institution: string | null;
  color: string;
  currency: string;
  archived: boolean;
  initialBalance: number;
  balance: number;
  transactionCount: number;
};

/** All of a user's accounts with their current balance folded in. */
export async function getAccountsWithBalance(
  userId: string,
): Promise<AccountWithBalance[]> {
  const [accounts, grouped] = await Promise.all([
    prisma.financialAccount.findMany({
      where: { userId },
      orderBy: [{ archived: "asc" }, { createdAt: "asc" }],
    }),
    prisma.transaction.groupBy({
      by: ["financialAccountId", "kind"],
      where: { userId },
      _sum: { amountCents: true },
      _count: { _all: true },
    }),
  ]);

  const byAccount = new Map<string, { delta: number; count: number }>();
  for (const row of grouped) {
    const entry = byAccount.get(row.financialAccountId) ?? {
      delta: 0,
      count: 0,
    };
    const sum = row._sum.amountCents ?? 0;
    entry.delta += row.kind === "INCOME" ? sum : -sum;
    entry.count += row._count._all;
    byAccount.set(row.financialAccountId, entry);
  }

  return accounts.map((account) => {
    const agg = byAccount.get(account.id) ?? { delta: 0, count: 0 };
    return {
      id: account.id,
      name: account.name,
      type: account.type,
      institution: account.institution,
      color: account.color,
      currency: account.currency,
      archived: account.archived,
      initialBalance: account.initialBalance,
      balance: account.initialBalance + agg.delta,
      transactionCount: agg.count,
    };
  });
}

/** Lightweight list for form <select>s. */
export async function getAccountOptions(userId: string) {
  return prisma.financialAccount.findMany({
    where: { userId, archived: false },
    select: { id: true, name: true, color: true },
    orderBy: { createdAt: "asc" },
  });
}
