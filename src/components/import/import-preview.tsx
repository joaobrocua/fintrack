"use client";

import { AlertTriangle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { formatCurrency } from "@/lib/money";
import type { NormalizedRow, RowError } from "@/lib/csv";
import { cn } from "@/lib/utils";

export function ImportPreview({
  rows,
  errors,
}: {
  rows: NormalizedRow[];
  errors: RowError[];
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-4 text-sm">
        <span>
          <strong className="tabular-nums">{rows.length}</strong> linhas válidas
        </span>
        {errors.length > 0 && (
          <span className="inline-flex items-center gap-1 text-warning">
            <AlertTriangle className="size-4" />
            {errors.length} ignorada(s)
          </span>
        )}
      </div>

      {rows.length > 0 && (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.slice(0, 8).map((row) => (
                <TableRow key={row.index}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDate(`${row.date}T12:00:00`)}
                  </TableCell>
                  <TableCell>{row.description}</TableCell>
                  <TableCell
                    className={cn(
                      "text-right whitespace-nowrap tabular-nums",
                      row.kind === "INCOME"
                        ? "text-success"
                        : "text-destructive",
                    )}
                  >
                    {formatCurrency(
                      row.kind === "INCOME"
                        ? row.amountCents
                        : -row.amountCents,
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {rows.length > 8 && (
            <p className="border-t px-3 py-2 text-xs text-muted-foreground">
              + {rows.length - 8} outras linhas
            </p>
          )}
        </div>
      )}

      {errors.length > 0 && (
        <details className="rounded-lg border px-3 py-2 text-sm">
          <summary className="cursor-pointer text-muted-foreground">
            Ver linhas ignoradas
          </summary>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            {errors.slice(0, 20).map((err) => (
              <li key={err.index}>
                Linha {err.index + 2}: {err.reason}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
