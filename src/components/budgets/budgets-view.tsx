"use client";

import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CopyPlus,
  Pencil,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell/page-header";
import { BudgetLimitDialog } from "@/components/budgets/budget-limit-dialog";
import { CategoryIcon } from "@/components/categories/category-icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatMonthParam, shiftMonthParam } from "@/lib/month";
import { formatCurrency } from "@/lib/money";
import { cn } from "@/lib/utils";
import { copyBudgetsFromPreviousMonth } from "@/server/actions/budgets";
import type { BudgetMonth, BudgetRow } from "@/server/queries/budgets";

function toneFor(ratio: number) {
  if (ratio > 1) return "var(--color-destructive)";
  if (ratio >= 0.8) return "var(--color-warning)";
  return "var(--color-success)";
}

function BudgetLine({ row, onEdit }: { row: BudgetRow; onEdit: () => void }) {
  const hasBudget = row.limitCents > 0;
  const ratio = hasBudget ? row.spentCents / row.limitCents : 0;
  const remaining = row.limitCents - row.spentCents;
  const over = hasBudget && remaining < 0;

  return (
    <div className="flex items-center gap-3 rounded-lg border px-3 py-3">
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: `${row.color}22`, color: row.color }}
      >
        <CategoryIcon name={row.icon} className="size-4" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate font-medium">{row.name}</span>
          {hasBudget ? (
            <span className="shrink-0 text-sm text-muted-foreground tabular-nums">
              {formatCurrency(row.spentCents)} /{" "}
              {formatCurrency(row.limitCents)}
            </span>
          ) : (
            <Button variant="ghost" size="sm" onClick={onEdit}>
              Definir orçamento
            </Button>
          )}
        </div>

        {hasBudget && (
          <>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, ratio * 100)}%`,
                  backgroundColor: toneFor(ratio),
                }}
              />
            </div>
            <p
              className={cn(
                "mt-1 text-xs",
                over ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {over ? (
                <span className="inline-flex items-center gap-1">
                  <AlertTriangle className="size-3" />
                  Estourou {formatCurrency(-remaining)}
                </span>
              ) : (
                `Restam ${formatCurrency(remaining)}`
              )}
            </p>
          </>
        )}
      </div>

      {hasBudget && (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Editar orçamento"
          onClick={onEdit}
        >
          <Pencil />
        </Button>
      )}
    </div>
  );
}

export function BudgetsView({ data }: { data: BudgetMonth }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [copying, startCopy] = useTransition();
  const [editing, setEditing] = useState<BudgetRow | null>(null);

  function goToMonth(month: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", month);
    router.push(`${pathname}?${params.toString()}`);
  }

  function onCopy() {
    startCopy(async () => {
      const result = await copyBudgetsFromPreviousMonth(data.month);
      if (!result.ok) toast.error(result.error);
      else toast.success(`${result.data.copied} orçamentos copiados`);
    });
  }

  const withBudget = data.rows.filter((r) => r.limitCents > 0);
  const totalRatio =
    data.totals.limit > 0 ? data.totals.spent / data.totals.limit : 0;

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Orçamentos"
        description="Um limite de gasto por categoria, mês a mês."
        action={
          data.previousMonthHasBudgets && (
            <Button variant="outline" onClick={onCopy} disabled={copying}>
              <CopyPlus /> {copying ? "Copiando…" : "Copiar do mês anterior"}
            </Button>
          )
        }
      />

      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="outline"
          size="icon"
          aria-label="Mês anterior"
          onClick={() => goToMonth(shiftMonthParam(data.month, -1))}
        >
          <ChevronLeft />
        </Button>
        <span className="text-sm font-medium capitalize">
          {formatMonthParam(data.month)}
        </span>
        <Button
          variant="outline"
          size="icon"
          aria-label="Próximo mês"
          onClick={() => goToMonth(shiftMonthParam(data.month, 1))}
        >
          <ChevronRight />
        </Button>
      </div>

      {withBudget.length > 0 && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total orçado</span>
              <span className="font-medium tabular-nums">
                {formatCurrency(data.totals.spent)} de{" "}
                {formatCurrency(data.totals.limit)}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, totalRatio * 100)}%`,
                  backgroundColor: toneFor(totalRatio),
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {data.rows.map((row) => (
          <BudgetLine
            key={row.categoryId}
            row={row}
            onEdit={() => setEditing(row)}
          />
        ))}
      </div>

      <BudgetLimitDialog
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        month={data.month}
        category={
          editing
            ? {
                id: editing.categoryId,
                name: editing.name,
                limitCents: editing.limitCents,
              }
            : null
        }
      />
    </div>
  );
}
