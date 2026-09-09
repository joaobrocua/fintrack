import "server-only";

import { prisma } from "@/lib/prisma";

export type CategoryOption = {
  id: string;
  name: string;
  color: string;
  kind: "INCOME" | "EXPENSE";
};

export async function getCategoryOptions(
  userId: string,
): Promise<CategoryOption[]> {
  const rows = await prisma.category.findMany({
    where: { userId },
    select: { id: true, name: true, color: true, kind: true },
    orderBy: [{ kind: "asc" }, { name: "asc" }],
  });
  return rows as CategoryOption[];
}
