import "server-only";

import { prisma } from "@/lib/prisma";

export type RuleWithCategory = {
  id: string;
  matchType: "CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "EQUALS" | "REGEX";
  pattern: string;
  priority: number;
  enabled: boolean;
  categoryId: string;
  category: { id: string; name: string; color: string; kind: string };
};

export async function getRules(userId: string): Promise<RuleWithCategory[]> {
  const rows = await prisma.categoryRule.findMany({
    where: { userId },
    include: {
      category: { select: { id: true, name: true, color: true, kind: true } },
    },
    orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
  });
  return rows as RuleWithCategory[];
}
