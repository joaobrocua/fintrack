import { Fragment } from "react";
import Link from "next/link";
import { ChartCard } from "@/components/dashboard/chart-card";
import { formatCurrency } from "@/lib/money";
import type { BudgetStatusRow } from "@/server/queries/dashboard";

function tone(ratio: number) {
  if (ratio > 1) return "var(--color-destructive)";
  if (ratio >= 0.8) return "var(--color-warning)";
  return "var(--color-success)";
}

export function BudgetStatusCard({ rows }: { rows: BudgetStatusRow[] }) {
  if (rows.length === 0) return null;

  return (
    <ChartCard
      title="Orçamentos do mês"
      subtitle="Uso atual por categoria"
      action={
        <Link href="/budgets" className="text-xs text-primary hover:underline">
          Gerenciar
        </Link>
      }
    >
      <div className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-3">
        {rows.map((row) => {
          const ratio = row.spentCents / row.limitCents;
          return (
            <Fragment key={row.categoryId}>
              <div className="min-w-0">
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate">{row.name}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {Math.round(ratio * 100)}%
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, ratio * 100)}%`,
                      backgroundColor: tone(ratio),
                    }}
                  />
                </div>
              </div>
              <span className="text-right text-sm text-muted-foreground tabular-nums">
                {formatCurrency(row.spentCents)} /{" "}
                {formatCurrency(row.limitCents)}
              </span>
            </Fragment>
          );
        })}
      </div>
    </ChartCard>
  );
}
