import { Fragment } from "react";
import { ChartEmpty } from "@/components/dashboard/chart-card";
import { formatCurrency } from "@/lib/money";
import type { MerchantRow } from "@/server/queries/dashboard";

export function TopMerchants({ rows }: { rows: MerchantRow[] }) {
  if (rows.length === 0)
    return <ChartEmpty message="Sem despesas no período" />;

  const max = Math.max(...rows.map((r) => r.total), 1);

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2.5">
      {rows.map((row) => (
        <Fragment key={row.description}>
          <div className="min-w-0">
            <p className="truncate text-sm">{row.description}</p>
            <span
              className="mt-1 block h-1.5 rounded-full bg-muted-foreground/40"
              style={{ width: `${Math.max(6, (row.total / max) * 100)}%` }}
            />
          </div>
          <span className="text-right text-sm font-medium tabular-nums">
            {formatCurrency(row.total)}
          </span>
        </Fragment>
      ))}
    </div>
  );
}
