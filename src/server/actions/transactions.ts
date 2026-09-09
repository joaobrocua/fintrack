"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { actionError, actionOk, type ActionResult } from "@/lib/action-result";
import { requireUserId } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { transactionFormSchema } from "@/lib/validation/transaction";

const withId = transactionFormSchema.and(
  z.object({ id: z.string().optional() }),
);

async function assertOwnedAccount(userId: string, accountId: string) {
  const account = await prisma.financialAccount.findFirst({
    where: { id: accountId, userId },
    select: { id: true },
  });
  return Boolean(account);
}

async function assertOwnedCategory(userId: string, categoryId: string) {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
    select: { id: true },
  });
  return Boolean(category);
}

export async function saveTransaction(
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

  const { id, date, amount, financialAccountId, categoryId, ...rest } =
    parsed.data;

  if (!(await assertOwnedAccount(userId, financialAccountId))) {
    return actionError("Conta inválida");
  }
  if (categoryId && !(await assertOwnedCategory(userId, categoryId))) {
    return actionError("Categoria inválida");
  }

  const data = {
    ...rest,
    date: new Date(`${date}T12:00:00`),
    amountCents: amount,
    financialAccountId,
    categoryId: categoryId ?? null,
  };

  if (id) {
    const existing = await prisma.transaction.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!existing) return actionError("Transação não encontrada");

    await prisma.transaction.update({ where: { id }, data });
    revalidatePath("/transactions");
    revalidatePath("/accounts");
    return actionOk({ id });
  }

  const created = await prisma.transaction.create({
    data: { ...data, userId },
    select: { id: true },
  });
  revalidatePath("/transactions");
  revalidatePath("/accounts");
  return actionOk({ id: created.id });
}

export async function deleteTransaction(id: string): Promise<ActionResult> {
  const userId = await requireUserId();
  const existing = await prisma.transaction.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!existing) return actionError("Transação não encontrada");

  await prisma.transaction.delete({ where: { id } });
  revalidatePath("/transactions");
  revalidatePath("/accounts");
  return actionOk(undefined);
}
