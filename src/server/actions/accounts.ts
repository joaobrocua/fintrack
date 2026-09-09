"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { actionError, actionOk, type ActionResult } from "@/lib/action-result";
import { requireUserId } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { accountFormSchema } from "@/lib/validation/account";

const withId = accountFormSchema.and(z.object({ id: z.string().optional() }));

export async function saveAccount(
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

  if (id) {
    const existing = await prisma.financialAccount.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!existing) return actionError("Conta não encontrada");

    await prisma.financialAccount.update({ where: { id }, data });
    revalidatePath("/accounts");
    return actionOk({ id });
  }

  const created = await prisma.financialAccount.create({
    data: { ...data, userId },
    select: { id: true },
  });
  revalidatePath("/accounts");
  return actionOk({ id: created.id });
}

export async function setAccountArchived(
  id: string,
  archived: boolean,
): Promise<ActionResult> {
  const userId = await requireUserId();
  const account = await prisma.financialAccount.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!account) return actionError("Conta não encontrada");

  await prisma.financialAccount.update({ where: { id }, data: { archived } });
  revalidatePath("/accounts");
  return actionOk(undefined);
}

export async function deleteAccount(id: string): Promise<ActionResult> {
  const userId = await requireUserId();
  const account = await prisma.financialAccount.findFirst({
    where: { id, userId },
    select: { _count: { select: { transactions: true } } },
  });
  if (!account) return actionError("Conta não encontrada");
  if (account._count.transactions > 0) {
    return actionError(
      "Esta conta tem transações. Arquive-a em vez de excluir.",
    );
  }

  await prisma.financialAccount.delete({ where: { id } });
  revalidatePath("/accounts");
  return actionOk(undefined);
}
