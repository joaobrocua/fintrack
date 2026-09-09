"use client";

import { Undo2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { undoImport } from "@/server/actions/import";
import type { ImportBatchSummary } from "@/server/queries/import";

export function RecentImports({ batches }: { batches: ImportBatchSummary[] }) {
  const [pendingId, setPendingId] = useState<string | null>(null);

  if (batches.length === 0) return null;

  async function onUndo(batch: ImportBatchSummary) {
    if (
      !confirm(
        `Desfazer esta importação? ${batch.liveCount} transação(ões) serão excluídas.`,
      )
    )
      return;
    setPendingId(batch.id);
    const result = await undoImport(batch.id);
    setPendingId(null);
    if (!result.ok) toast.error(result.error);
    else toast.success("Importação desfeita");
  }

  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          Importações recentes
        </h2>
        <ul className="divide-y">
          {batches.map((batch) => (
            <li
              key={batch.id}
              className="flex items-center gap-3 py-2.5 text-sm"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{batch.filename}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(batch.createdAt)} · {batch.accountName} ·{" "}
                  {batch.importedCount} importadas
                  {batch.skippedCount > 0 &&
                    ` · ${batch.skippedCount} ignoradas`}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={pendingId === batch.id || batch.liveCount === 0}
                onClick={() => void onUndo(batch)}
              >
                <Undo2 /> Desfazer
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
