"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell/page-header";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import {
  TransactionFormDialog,
  type EditableTransaction,
} from "@/components/transactions/transaction-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { cn } from "@/lib/utils";
import { deleteTransaction } from "@/server/actions/transactions";
import type { CategoryOption } from "@/server/queries/categories";
import type { TransactionRow } from "@/server/queries/transactions";

type AccountOption = { id: string; name: string };

type Props = {
  data: {
    rows: TransactionRow[];
    page: number;
    pageCount: number;
    total: number;
    summary: { income: number; expense: number; net: number };
  };
  accounts: AccountOption[];
  categories: CategoryOption[];
};

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "income" | "expense" | "net";
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p
          className={cn(
            "mt-1 text-xl font-semibold tabular-nums",
            tone === "income" && "text-success",
            tone === "expense" && "text-destructive",
          )}
        >
          {formatCurrency(value, { signed: tone !== "expense" })}
        </p>
      </CardContent>
    </Card>
  );
}

export function TransactionsView({ data, accounts, categories }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EditableTransaction | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const pageHref = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    return `${pathname}?${params.toString()}`;
  };

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(row: TransactionRow) {
    setEditing({
      id: row.id,
      date: row.date.toISOString(),
      description: row.description,
      amountCents: row.amountCents,
      kind: row.kind as "INCOME" | "EXPENSE",
      financialAccountId: row.financialAccountId,
      categoryId: row.categoryId,
      notes: row.notes,
    });
    setDialogOpen(true);
  }

  async function onDelete(row: TransactionRow) {
    if (!confirm("Excluir esta transação?")) return;
    setPendingId(row.id);
    const result = await deleteTransaction(row.id);
    setPendingId(null);
    if (!result.ok) toast.error(result.error);
    else toast.success("Transação excluída");
  }

  const noAccounts = accounts.length === 0;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Transações"
        description="Todas as receitas e despesas das suas contas."
        action={
          <Button onClick={openCreate} disabled={noAccounts}>
            <Plus /> Nova transação
          </Button>
        }
      />

      {noAccounts ? (
        <Card>
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            Crie uma conta antes de registrar transações.{" "}
            <Link href="/accounts" className="text-primary hover:underline">
              Ir para Contas
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <SummaryCard
              label="Receitas (filtro atual)"
              value={data.summary.income}
              tone="income"
            />
            <SummaryCard
              label="Despesas (filtro atual)"
              value={data.summary.expense}
              tone="expense"
            />
            <SummaryCard
              label="Saldo do período"
              value={data.summary.net}
              tone="net"
            />
          </div>

          <TransactionFilters accounts={accounts} categories={categories} />

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Conta</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      Nenhuma transação encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.rows.map((row) => {
                    const isIncome = row.kind === "INCOME";
                    return (
                      <TableRow
                        key={row.id}
                        className={
                          pendingId === row.id ? "opacity-50" : undefined
                        }
                      >
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {formatDate(row.date)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {row.description}
                        </TableCell>
                        <TableCell>
                          {row.category ? (
                            <Badge
                              variant="outline"
                              style={{
                                borderColor: `${row.category.color}55`,
                                color: row.category.color,
                              }}
                            >
                              {row.category.name}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {row.financialAccount.name}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-right font-medium whitespace-nowrap tabular-nums",
                            isIncome ? "text-success" : "text-destructive",
                          )}
                        >
                          <span className="inline-flex items-center gap-1">
                            {isIncome ? (
                              <ArrowUpRight className="size-3.5" />
                            ) : (
                              <ArrowDownLeft className="size-3.5" />
                            )}
                            {formatCurrency(
                              isIncome ? row.amountCents : -row.amountCents,
                            )}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                              aria-label="Ações"
                              disabled={pendingId === row.id}
                            >
                              <MoreHorizontal className="size-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => openEdit(row)}>
                                <Pencil className="size-4" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onSelect={() => void onDelete(row)}
                              >
                                <Trash2 className="size-4" /> Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Card>

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>{data.total} transação(ões)</span>
            {data.pageCount > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  disabled={data.page <= 1}
                >
                  <Link href={pageHref(Math.max(1, data.page - 1))}>
                    Anterior
                  </Link>
                </Button>
                <span>
                  {data.page} / {data.pageCount}
                </span>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  disabled={data.page >= data.pageCount}
                >
                  <Link
                    href={pageHref(Math.min(data.pageCount, data.page + 1))}
                  >
                    Próxima
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      <TransactionFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        transaction={editing}
        accounts={accounts}
        categories={categories}
      />
    </div>
  );
}
