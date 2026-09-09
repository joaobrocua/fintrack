import "server-only";

import { prisma } from "@/lib/prisma";

export type ImportBatchSummary = {
  id: string;
  filename: string;
  createdAt: Date;
  importedCount: number;
  skippedCount: number;
  accountName: string;
  liveCount: number;
};

export async function getRecentImportBatches(
  userId: string,
): Promise<ImportBatchSummary[]> {
  const rows = await prisma.importBatch.findMany({
    where: { userId },
    include: {
      financialAccount: { select: { name: true } },
      _count: { select: { transactions: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return rows.map((r) => ({
    id: r.id,
    filename: r.filename,
    createdAt: r.createdAt,
    importedCount: r.importedCount,
    skippedCount: r.skippedCount,
    accountName: r.financialAccount.name,
    liveCount: r._count.transactions,
  }));
}
