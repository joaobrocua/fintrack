import type { Metadata } from "next";
import { ReportView } from "@/components/reports/report-view";
import { requireUser } from "@/lib/dal";
import { currentMonthParam, isMonthParam } from "@/lib/month";
import { getMonthlyReport } from "@/server/queries/report";

export const metadata: Metadata = { title: "Relatório mensal" };

export default async function ReportsPage({
  searchParams,
}: PageProps<"/reports">) {
  const user = await requireUser();
  const params = await searchParams;
  const month = isMonthParam(params.month) ? params.month : currentMonthParam();

  const report = await getMonthlyReport(user.id, month);

  return <ReportView report={report} />;
}
