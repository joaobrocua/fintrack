"use client";

import { ChevronLeft, ChevronRight, Printer } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/app-shell/page-header";
import { ReportDocument } from "@/components/reports/report-document";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatMonthParam, shiftMonthParam } from "@/lib/month";
import type { MonthlyReport } from "@/server/queries/report";

export function ReportView({ report }: { report: MonthlyReport }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function goToMonth(month: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", month);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="print:hidden">
        <PageHeader
          title="Relatório mensal"
          description="Resumo do mês para guardar ou imprimir em PDF."
          action={
            <Button onClick={() => window.print()} disabled={!report.hasData}>
              <Printer /> Baixar PDF
            </Button>
          }
        />

        <div className="mb-4 flex items-center justify-between">
          <Button
            variant="outline"
            size="icon"
            aria-label="Mês anterior"
            onClick={() => goToMonth(shiftMonthParam(report.month, -1))}
          >
            <ChevronLeft />
          </Button>
          <span className="text-sm font-medium capitalize">
            {formatMonthParam(report.month)}
          </span>
          <Button
            variant="outline"
            size="icon"
            aria-label="Próximo mês"
            onClick={() => goToMonth(shiftMonthParam(report.month, 1))}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      {report.hasData ? (
        <ReportDocument report={report} />
      ) : (
        <Card className="print:hidden">
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            Nenhuma transação neste mês.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
