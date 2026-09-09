import type { Metadata } from "next";
import { PageHeader } from "@/components/app-shell/page-header";
import { ImportWizard } from "@/components/import/import-wizard";
import { RecentImports } from "@/components/import/recent-imports";
import { requireUser } from "@/lib/dal";
import { getAccountOptions } from "@/server/queries/accounts";
import { getRecentImportBatches } from "@/server/queries/import";

export const metadata: Metadata = { title: "Importar CSV" };

export default async function ImportPage() {
  const user = await requireUser();
  const [accounts, batches] = await Promise.all([
    getAccountOptions(user.id),
    getRecentImportBatches(user.id),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Importar CSV"
        description="Suba o extrato do banco. Duplicatas são ignoradas e as regras de categorização entram em ação."
      />
      <ImportWizard accounts={accounts} />
      <RecentImports batches={batches} />
    </div>
  );
}
