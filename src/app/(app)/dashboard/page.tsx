import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { BalanceTrendChart } from "@/components/dashboard/balance-trend-chart";
import { BudgetStatusCard } from "@/components/dashboard/budget-status-card";
import { CategorySpendChart } from "@/components/dashboard/category-spend-chart";
import { ChartCard } from "@/components/dashboard/chart-card";
import { MonthlyFlowChart } from "@/components/dashboard/monthly-flow-chart";
import { PeriodPicker } from "@/components/dashboard/period-picker";
import { StatCard } from "@/components/dashboard/stat-card";
import { TopMerchants } from "@/components/dashboard/top-merchants";
import { PageHeader } from "@/components/app-shell/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/dal";
import {
  PERIOD_LABELS,
  isPeriodPreset,
  resolvePeriod,
  type PeriodPreset,
} from "@/lib/period";
import { getDashboardData } from "@/server/queries/dashboard";

export const metadata: Metadata = { title: "Painel" };

export default async function DashboardPage({
  searchParams,
}: PageProps<"/dashboard">) {
  const user = await requireUser();
  const params = await searchParams;
  const preset: PeriodPreset = isPeriodPreset(params.period)
    ? params.period
    : "last-6-months";

  const data = await getDashboardData(user.id, resolvePeriod(preset));

  if (!data.hasData) {
    return (
      <div className="mx-auto max-w-3xl">
        <PageHeader title="Painel" />
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
            <p className="text-sm text-muted-foreground">
              Ainda não há dados. Cadastre uma conta e importe um extrato (ou
              lance transações) para ver seus gráficos.
            </p>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/accounts">Criar conta</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/import">Importar CSV</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const firstName = user.name?.split(" ")[0];

  const stats = [
    { label: "Receitas", value: data.totals.income, tone: "income" as const },
    { label: "Despesas", value: data.totals.expense, tone: "expense" as const },
    {
      label: "Resultado do período",
      value: data.totals.net,
      tone: (data.totals.net >= 0 ? "income" : "expense") as
        "income" | "expense",
    },
    {
      label: "Patrimônio",
      value: data.netWorth,
      tone: "neutral" as const,
      hint: "Todas as contas, saldo atual",
    },
  ];

  const charts = [
    <ChartCard
      key="flow"
      title="Receitas × Despesas"
      subtitle="Por mês, no período selecionado"
    >
      <MonthlyFlowChart data={data.monthlyFlow} />
    </ChartCard>,
    <ChartCard key="trend" title="Evolução do saldo" subtitle="Saldo acumulado">
      <BalanceTrendChart data={data.balanceTrend} />
    </ChartCard>,
    <ChartCard
      key="cat"
      title="Gastos por categoria"
      subtitle="Despesas do período, maiores primeiro"
    >
      <CategorySpendChart data={data.categorySpend} />
    </ChartCard>,
    <ChartCard
      key="merch"
      title="Onde você mais gastou"
      subtitle="Estabelecimentos com maior total"
    >
      <TopMerchants rows={data.topMerchants} />
    </ChartCard>,
    data.budgetStatus.length > 0 ? (
      <BudgetStatusCard key="budget" rows={data.budgetStatus} />
    ) : null,
  ].filter(Boolean);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={firstName ? `Olá, ${firstName}` : "Painel"}
        description={`Um panorama dos seus ${PERIOD_LABELS[preset].toLowerCase()}.`}
        action={<PeriodPicker value={preset} />}
      />

      <div className="grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="reveal-fast bg-card"
            style={{ "--d": `${i * 55}ms` } as CSSProperties}
          >
            <StatCard
              label={s.label}
              value={s.value}
              tone={s.tone}
              hint={"hint" in s ? s.hint : undefined}
            />
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {charts.map((c, i) => (
          <div
            key={i}
            className="reveal"
            style={{ "--d": `${140 + i * 70}ms` } as CSSProperties}
          >
            {c}
          </div>
        ))}
      </div>
    </div>
  );
}
