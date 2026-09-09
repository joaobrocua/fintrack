import type { Metadata } from "next";
import { CategoriesView } from "@/components/categories/categories-view";
import { requireUser } from "@/lib/dal";
import { getCategoriesWithUsage } from "@/server/queries/categories";

export const metadata: Metadata = { title: "Categorias" };

export default async function CategoriesPage() {
  const user = await requireUser();
  const categories = await getCategoriesWithUsage(user.id);

  return <CategoriesView categories={categories} />;
}
