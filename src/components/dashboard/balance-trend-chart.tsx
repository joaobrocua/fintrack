"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
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
import { formatDate } from "@/lib/format";
import type { BalancePoint } from "@/server/queries/dashboard";

export function BalanceTrendChart({ data }: { data: BalancePoint[] }) {
  if (data.length < 2)
    return <ChartEmpty message="Poucos dados para a curva" />;

  const points = data.map((p) => ({
    ...p,
    label: formatDate(`${p.date}T12:00:00`).slice(0, 5),
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={points} margin={{ left: 4, right: 8, top: 4 }}>
        <defs>
          <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--color-chart-1)"
              stopOpacity={0.25}
            />
            <stop
              offset="100%"
              stopColor="var(--color-chart-1)"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <CartesianGrid
          vertical={false}
          stroke="var(--color-border)"
          strokeDasharray="3 3"
        />
        <XAxis dataKey="label" {...AXIS_PROPS} minTickGap={24} />
        <YAxis
          {...AXIS_PROPS}
          width={64}
          tickFormatter={(v) => compactCurrency(Number(v))}
        />
        <Tooltip
          cursor={{ stroke: "var(--color-muted-foreground)", strokeWidth: 1 }}
          content={<MoneyTooltip />}
        />
        <Area
          type="monotone"
          dataKey="balance"
          name="Saldo"
          stroke="var(--color-chart-1)"
          strokeWidth={2}
          fill="url(#balanceFill)"
          dot={false}
          activeDot={{ r: 4 }}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
