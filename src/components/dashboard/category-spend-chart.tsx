"use client";

import { Fragment } from "react";
import { formatCurrency } from "@/lib/money";
import { ChartEmpty } from "@/components/dashboard/chart-card";
import type { CategorySlice } from "@/server/queries/dashboard";

/**
 * Ranked horizontal bars — easier to compare than a pie, and each bar carries
 * its category's own colour so identity never rides on rank.
 */
export function CategorySpendChart({ data }: { data: CategorySlice[] }) {
  if (data.length === 0)
    return <ChartEmpty message="Sem despesas no período" />;

  const top = data.slice(0, 6);
  const rest = data.slice(6);
  const restTotal = rest.reduce((sum, c) => sum + c.total, 0);
  const rows = restTotal
    ? [
        ...top,
        {
          categoryId: "__rest",
          name: `Outras (${rest.length})`,
          color: "#94a3b8",
          total: restTotal,
        },
      ]
    : top;

  const max = Math.max(...rows.map((r) => r.total), 1);

  return (
    <div className="grid grid-cols-[minmax(6rem,auto)_1fr_auto] items-center gap-x-3 gap-y-2.5">
      {rows.map((row) => (
        <Fragment key={row.categoryId ?? row.name}>
          <span className="truncate text-sm text-muted-foreground">
            {row.name}
          </span>
          <span
            className="h-2.5 rounded-full"
            style={{
              width: `${Math.max(4, (row.total / max) * 100)}%`,
              backgroundColor: row.color,
            }}
          />
          <span className="text-right text-sm font-medium tabular-nums">
            {formatCurrency(row.total)}
          </span>
        </Fragment>
      ))}
    </div>
  );
}
