import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/app-shell/page-header";
import { BudgetsView } from "@/components/budgets/budgets-view";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/dal";
import { currentMonthParam, isMonthParam } from "@/lib/month";
import { getBudgetMonth } from "@/server/queries/budgets";

export const metadata: Metadata = { title: "Orçamentos" };

export default async function BudgetsPage({
  searchParams,
}: PageProps<"/budgets">) {
  const user = await requireUser();
  const params = await searchParams;
  const month = isMonthParam(params.month) ? params.month : currentMonthParam();

  const data = await getBudgetMonth(user.id, month);

  if (data.rows.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader title="Orçamentos" />
        <Card>
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            Crie categorias de despesa antes de definir orçamentos.{" "}
            <Link href="/categories" className="text-primary hover:underline">
              Ir para Categorias
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <BudgetsView data={data} />;
}
