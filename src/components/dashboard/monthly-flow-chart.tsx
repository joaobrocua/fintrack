"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AXIS_PROPS,
  MoneyTooltip,
  compactCurrency,
} from "@/components/dashboard/chart-primitives";
import { ChartEmpty } from "@/components/dashboard/chart-card";
import type { MonthlyFlowPoint } from "@/server/queries/dashboard";

export function MonthlyFlowChart({ data }: { data: MonthlyFlowPoint[] }) {
  if (data.length === 0)
    return <ChartEmpty message="Sem transações no período" />;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barGap={4} margin={{ left: 4, right: 4, top: 4 }}>
        <CartesianGrid
          vertical={false}
          stroke="var(--color-border)"
          strokeDasharray="3 3"
        />
        <XAxis dataKey="label" {...AXIS_PROPS} />
        <YAxis
          {...AXIS_PROPS}
          width={64}
          tickFormatter={(v) => compactCurrency(Number(v))}
        />
        <Tooltip
          cursor={{ fill: "var(--color-muted)", opacity: 0.4 }}
          content={<MoneyTooltip />}
        />
        <Legend
          iconType="circle"
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
        />
        <Bar
          dataKey="income"
          name="Receitas"
          fill="var(--color-success)"
          radius={[4, 4, 0, 0]}
          maxBarSize={28}
          isAnimationActive={false}
        />
        <Bar
          dataKey="expense"
          name="Despesas"
          fill="var(--color-destructive)"
          radius={[4, 4, 0, 0]}
          maxBarSize={28}
          isAnimationActive={false}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
