import type { Metadata } from "next";
import { RulesView } from "@/components/rules/rules-view";
import { requireUser } from "@/lib/dal";
import { getCategoryOptions } from "@/server/queries/categories";
import { getRules } from "@/server/queries/rules";

export const metadata: Metadata = { title: "Regras" };

export default async function RulesPage() {
  const user = await requireUser();
  const [rules, categories] = await Promise.all([
    getRules(user.id),
    getCategoryOptions(user.id),
  ]);

  return <RulesView rules={rules} categories={categories} />;
}
