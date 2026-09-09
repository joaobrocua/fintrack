"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { actionError, actionOk, type ActionResult } from "@/lib/action-result";
import { requireUserId } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { categorize, type CategorizationRule } from "@/lib/rule-engine";
import { ruleFormSchema } from "@/lib/validation/rule";

const withId = z.intersection(
  ruleFormSchema,
  z.object({ id: z.string().optional() }),
);

async function assertOwnedCategory(userId: string, categoryId: string) {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
    select: { id: true },
  });
  return Boolean(category);
}

export async function saveRule(
  raw: z.input<typeof withId>,
): Promise<ActionResult<{ id: string }>> {
  const userId = await requireUserId();

  const parsed = withId.safeParse(raw);
  if (!parsed.success) {
    return actionError(
      "Dados inválidos",
      z.flattenError(parsed.error).fieldErrors,
    );
  }

  const { id, ...data } = parsed.data;

  if (!(await assertOwnedCategory(userId, data.categoryId))) {
    return actionError("Categoria inválida");
  }

  if (id) {
    const existing = await prisma.categoryRule.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!existing) return actionError("Regra não encontrada");

    await prisma.categoryRule.update({ where: { id }, data });
    revalidatePath("/rules");
    return actionOk({ id });
  }

  const created = await prisma.categoryRule.create({
    data: { ...data, userId },
    select: { id: true },
  });
  revalidatePath("/rules");
  return actionOk({ id: created.id });
}

export async function setRuleEnabled(
  id: string,
  enabled: boolean,
): Promise<ActionResult> {
  const userId = await requireUserId();
  const rule = await prisma.categoryRule.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!rule) return actionError("Regra não encontrada");

  await prisma.categoryRule.update({ where: { id }, data: { enabled } });
  revalidatePath("/rules");
  return actionOk(undefined);
}

export async function deleteRule(id: string): Promise<ActionResult> {
  const userId = await requireUserId();
  const rule = await prisma.categoryRule.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!rule) return actionError("Regra não encontrada");

  await prisma.categoryRule.delete({ where: { id } });
  revalidatePath("/rules");
  return actionOk(undefined);
}

/**
 * Runs the enabled rules against every uncategorized transaction and applies
 * the first match. Returns how many were categorized.
 */
export async function applyRulesToUncategorized(): Promise<
  ActionResult<{ updated: number; scanned: number }>
> {
  const userId = await requireUserId();

  const [rules, transactions] = await Promise.all([
    prisma.categoryRule.findMany({
      where: { userId, enabled: true },
      orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
    }),
    prisma.transaction.findMany({
      where: { userId, categoryId: null },
      select: { id: true, description: true },
    }),
  ]);

  if (rules.length === 0) {
    return actionError("Você ainda não tem regras ativas.");
  }

  const engineRules: CategorizationRule[] = rules.map((r) => ({
    id: r.id,
    matchType: r.matchType,
    pattern: r.pattern,
    categoryId: r.categoryId,
    priority: r.priority,
    enabled: r.enabled,
    createdAt: r.createdAt,
  }));

  const updates = new Map<string, string[]>();
  for (const tx of transactions) {
    const categoryId = categorize(tx.description, engineRules);
    if (!categoryId) continue;
    const bucket = updates.get(categoryId) ?? [];
    bucket.push(tx.id);
    updates.set(categoryId, bucket);
  }

  let updated = 0;
  if (updates.size > 0) {
    await prisma.$transaction(
      [...updates.entries()].map(([categoryId, ids]) => {
        updated += ids.length;
        return prisma.transaction.updateMany({
          where: { id: { in: ids }, userId },
          data: { categoryId },
        });
      }),
    );
  }

  revalidatePath("/transactions");
  revalidatePath("/rules");
  return actionOk({ updated, scanned: transactions.length });
}
