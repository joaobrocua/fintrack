"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { actionError, actionOk, type ActionResult } from "@/lib/action-result";
import { requireUserId } from "@/lib/dal";
import { isMonthParam, monthParamToDate, shiftMonthParam } from "@/lib/month";
import { prisma } from "@/lib/prisma";
import { setBudgetSchema } from "@/lib/validation/budget";

export async function setBudget(
  raw: z.input<typeof setBudgetSchema>,
): Promise<ActionResult> {
  const userId = await requireUserId();

  const parsed = setBudgetSchema.safeParse(raw);
  if (!parsed.success) {
    return actionError("Valor ou mês inválido");
  }
  const { categoryId, month, limit } = parsed.data;

  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId, kind: "EXPENSE" },
    select: { id: true },
  });
  if (!category) return actionError("Categoria inválida");

  const monthStart = monthParamToDate(month);

  if (limit <= 0) {
    await prisma.budget.deleteMany({
      where: { userId, categoryId, month: monthStart },
    });
  } else {
    await prisma.budget.upsert({
      where: {
        userId_categoryId_month: { userId, categoryId, month: monthStart },
      },
      create: { userId, categoryId, month: monthStart, limitCents: limit },
      update: { limitCents: limit },
    });
  }

  revalidatePath("/budgets");
  revalidatePath("/dashboard");
  return actionOk(undefined);
}

export async function copyBudgetsFromPreviousMonth(
  month: string,
): Promise<ActionResult<{ copied: number }>> {
  const userId = await requireUserId();
  if (!isMonthParam(month)) return actionError("Mês inválido");

  const target = monthParamToDate(month);
  const source = monthParamToDate(shiftMonthParam(month, -1));

  const previous = await prisma.budget.findMany({
    where: { userId, month: source },
    select: { categoryId: true, limitCents: true },
  });
  if (previous.length === 0) {
    return actionError("O mês anterior não tem orçamentos.");
  }

  await prisma.$transaction(
    previous.map((b) =>
      prisma.budget.upsert({
        where: {
          userId_categoryId_month: {
            userId,
            categoryId: b.categoryId,
            month: target,
          },
        },
        create: {
          userId,
          categoryId: b.categoryId,
          month: target,
          limitCents: b.limitCents,
        },
        update: { limitCents: b.limitCents },
      }),
    ),
  );

  revalidatePath("/budgets");
  revalidatePath("/dashboard");
  return actionOk({ copied: previous.length });
}
