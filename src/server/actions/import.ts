"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { actionError, actionOk, type ActionResult } from "@/lib/action-result";
import { requireUserId } from "@/lib/dal";
import { transactionHash } from "@/lib/hash";
import { prisma } from "@/lib/prisma";
import { clientIpFrom, rateLimit } from "@/lib/rate-limit";
import { categorize, type CategorizationRule } from "@/lib/rule-engine";
import { commitImportSchema } from "@/lib/validation/import";

export type CommitImportResult = {
  batchId: string;
  imported: number;
  duplicates: number;
  categorized: number;
  totalRows: number;
};

export async function commitImport(
  raw: z.input<typeof commitImportSchema>,
): Promise<ActionResult<CommitImportResult>> {
  const userId = await requireUserId();

  const gate = rateLimit(
    `import:${clientIpFrom(await headers())}`,
    10,
    60 * 1000,
  );
  if (!gate.ok) {
    return actionError("Muitas importações seguidas. Aguarde um minuto.");
  }

  const parsed = commitImportSchema.safeParse(raw);
  if (!parsed.success) {
    return actionError("Arquivo inválido para importação");
  }
  const { financialAccountId, filename, columnMapping, rows } = parsed.data;

  const account = await prisma.financialAccount.findFirst({
    where: { id: financialAccountId, userId },
    select: { id: true },
  });
  if (!account) return actionError("Conta inválida");

  const rules = await prisma.categoryRule.findMany({
    where: { userId, enabled: true },
    orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
  });
  const engineRules: CategorizationRule[] = rules.map((r) => ({
    id: r.id,
    matchType: r.matchType,
    pattern: r.pattern,
    categoryId: r.categoryId,
    priority: r.priority,
    enabled: r.enabled,
    createdAt: r.createdAt,
  }));

  // Hash every row and drop within-file duplicates.
  const seen = new Set<string>();
  const hashed = rows
    .map((row) => ({
      ...row,
      externalHash: transactionHash({ financialAccountId, ...row }),
    }))
    .filter((row) => {
      if (seen.has(row.externalHash)) return false;
      seen.add(row.externalHash);
      return true;
    });

  // Drop rows already stored for this account.
  const existing = await prisma.transaction.findMany({
    where: {
      financialAccountId,
      externalHash: { in: hashed.map((r) => r.externalHash) },
    },
    select: { externalHash: true },
  });
  const existingHashes = new Set(existing.map((e) => e.externalHash));
  const fresh = hashed.filter((r) => !existingHashes.has(r.externalHash));

  const duplicates = rows.length - fresh.length;

  if (fresh.length === 0) {
    return actionError(
      "Todas as linhas já haviam sido importadas nesta conta.",
    );
  }

  let categorized = 0;
  const data = fresh.map((row) => {
    const categoryId = categorize(row.description, engineRules);
    if (categoryId) categorized += 1;
    return {
      userId,
      financialAccountId,
      date: new Date(`${row.date}T12:00:00`),
      description: row.description,
      amountCents: row.amountCents,
      kind: row.kind,
      categoryId,
      externalHash: row.externalHash,
    };
  });

  const { batchId, imported } = await prisma.$transaction(async (tx) => {
    const created = await tx.importBatch.create({
      data: {
        userId,
        financialAccountId,
        filename,
        columnMapping: columnMapping as object,
        rowCount: rows.length,
        importedCount: fresh.length,
        skippedCount: duplicates,
      },
      select: { id: true },
    });

    const result = await tx.transaction.createMany({
      data: data.map((row) => ({ ...row, importBatchId: created.id })),
      skipDuplicates: true,
    });

    return { batchId: created.id, imported: result.count };
  });

  revalidatePath("/transactions");
  revalidatePath("/accounts");
  revalidatePath("/import");

  return actionOk({
    batchId,
    imported,
    duplicates,
    categorized,
    totalRows: rows.length,
  });
}

export async function undoImport(batchId: string): Promise<ActionResult> {
  const userId = await requireUserId();

  const batch = await prisma.importBatch.findFirst({
    where: { id: batchId, userId },
    select: { id: true },
  });
  if (!batch) return actionError("Importação não encontrada");

  await prisma.$transaction([
    prisma.transaction.deleteMany({
      where: { importBatchId: batchId, userId },
    }),
    prisma.importBatch.delete({ where: { id: batchId } }),
  ]);

  revalidatePath("/transactions");
  revalidatePath("/accounts");
  revalidatePath("/import");
  return actionOk(undefined);
}
