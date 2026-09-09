"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { actionError, actionOk, type ActionResult } from "@/lib/action-result";
import { requireUserId } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { categoryFormSchema } from "@/lib/validation/category";

const withId = categoryFormSchema.and(z.object({ id: z.string().optional() }));

export async function saveCategory(
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

  const clash = await prisma.category.findFirst({
    where: {
      userId,
      name: data.name,
      kind: data.kind,
      id: id ? { not: id } : undefined,
    },
    select: { id: true },
  });
  if (clash) {
    return actionError("Já existe uma categoria com esse nome e tipo", {
      name: ["Nome já usado nesse tipo"],
    });
  }

  if (id) {
    const existing = await prisma.category.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!existing) return actionError("Categoria não encontrada");

    await prisma.category.update({ where: { id }, data });
    revalidatePath("/categories");
    revalidatePath("/transactions");
    return actionOk({ id });
  }

  const created = await prisma.category.create({
    data: { ...data, userId },
    select: { id: true },
  });
  revalidatePath("/categories");
  revalidatePath("/transactions");
  return actionOk({ id: created.id });
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const userId = await requireUserId();
  const category = await prisma.category.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!category) return actionError("Categoria não encontrada");

  // Transactions keep their history (categoryId -> null via FK rule);
  // rules targeting this category are removed (FK cascade).
  await prisma.category.delete({ where: { id } });
  revalidatePath("/categories");
  revalidatePath("/transactions");
  revalidatePath("/rules");
  return actionOk(undefined);
}
