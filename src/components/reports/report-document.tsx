import { Logo } from "@/components/logo";
import { formatMonthParam } from "@/lib/month";
import { formatCurrency } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { MonthlyReport } from "@/server/queries/report";

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "income" | "expense";
}) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 text-lg font-semibold tabular-nums",
          tone === "income" && "text-success",
          tone === "expense" && "text-destructive",
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function ReportDocument({ report }: { report: MonthlyReport }) {
  return (
    <article className="mx-auto max-w-3xl rounded-xl border bg-card p-8 print:border-0 print:p-0 print:shadow-none">
      <header className="flex items-end justify-between border-b pb-4">
        <div>
          <Logo />
          <h1 className="mt-2 text-xl font-semibold capitalize">
            Relatório de {formatMonthParam(report.month)}
          </h1>
        </div>
        <p className="text-xs text-muted-foreground">
          {report.transactionCount} transações
        </p>
      </header>

      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric
          label="Receitas"
          value={formatCurrency(report.income)}
          tone="income"
        />
        <Metric
          label="Despesas"
          value={formatCurrency(report.expense)}
          tone="expense"
        />
        <Metric
          label="Resultado"
          value={formatCurrency(report.net)}
          tone={report.net >= 0 ? "income" : "expense"}
        />
        <Metric
          label="Taxa de poupança"
          value={
            report.savingsRate === null
              ? "—"
              : `${Math.round(report.savingsRate * 100)}%`
          }
        />
      </section>

      {report.categorySpend.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold">Despesas por categoria</h2>
          <table className="mt-3 w-full text-sm">
            <tbody>
              {report.categorySpend.map((row) => (
                <tr key={row.name} className="border-b last:border-0">
                  <td className="py-2">
                    <span className="flex items-center gap-2">
                      <span
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: row.color }}
                      />
                      {row.name}
                    </span>
                  </td>
                  <td className="w-24 py-2 text-right text-muted-foreground tabular-nums">
                    {Math.round(row.share * 100)}%
                  </td>
                  <td className="w-32 py-2 text-right font-medium tabular-nums">
                    {formatCurrency(row.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {report.budgets.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold">Orçado × realizado</h2>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                <th className="py-1.5 text-left font-medium">Categoria</th>
                <th className="py-1.5 text-right font-medium">Orçado</th>
                <th className="py-1.5 text-right font-medium">Gasto</th>
                <th className="py-1.5 text-right font-medium">Diferença</th>
              </tr>
            </thead>
            <tbody>
              {report.budgets.map((b) => {
                const diff = b.limitCents - b.spentCents;
                return (
                  <tr key={b.name} className="border-b last:border-0">
                    <td className="py-2">{b.name}</td>
                    <td className="py-2 text-right tabular-nums">
                      {formatCurrency(b.limitCents)}
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {formatCurrency(b.spentCents)}
                    </td>
                    <td
                      className={cn(
                        "py-2 text-right font-medium tabular-nums",
                        diff < 0 ? "text-destructive" : "text-success",
                      )}
                    >
                      {formatCurrency(diff)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}

      {report.topMerchants.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold">Maiores despesas</h2>
          <table className="mt-3 w-full text-sm">
            <tbody>
              {report.topMerchants.map((m) => (
                <tr key={m.description} className="border-b last:border-0">
                  <td className="py-2">{m.description}</td>
                  <td className="w-32 py-2 text-right font-medium tabular-nums">
                    {formatCurrency(m.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <footer className="mt-10 border-t pt-3 text-xs text-muted-foreground">
        Gerado pelo FinTrack em {new Date().toLocaleDateString("pt-BR")}
      </footer>
    </article>
  );
}
