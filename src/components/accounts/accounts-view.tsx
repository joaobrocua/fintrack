"use client";

import {
  Archive,
  ArchiveRestore,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AccountFormDialog,
  type EditableAccount,
} from "@/components/accounts/account-form-dialog";
import { PageHeader } from "@/components/app-shell/page-header";
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
import { formatCurrency } from "@/lib/money";
import { ACCOUNT_TYPE_LABELS } from "@/lib/validation/account";
import type { AccountWithBalance } from "@/server/queries/accounts";
import { deleteAccount, setAccountArchived } from "@/server/actions/accounts";

export function AccountsView({ accounts }: { accounts: AccountWithBalance[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EditableAccount | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const active = accounts.filter((a) => !a.archived);
  const archived = accounts.filter((a) => a.archived);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(account: AccountWithBalance) {
    setEditing({
      id: account.id,
      name: account.name,
      type: account.type,
      institution: account.institution,
      color: account.color,
      initialBalance: account.initialBalance,
    });
    setDialogOpen(true);
  }

  async function onArchiveToggle(account: AccountWithBalance) {
    setPendingId(account.id);
    const result = await setAccountArchived(account.id, !account.archived);
    setPendingId(null);
    if (!result.ok) toast.error(result.error);
    else
      toast.success(account.archived ? "Conta reativada" : "Conta arquivada");
  }

  async function onDelete(account: AccountWithBalance) {
    if (!confirm(`Excluir a conta "${account.name}"?`)) return;
    setPendingId(account.id);
    const result = await deleteAccount(account.id);
    setPendingId(null);
    if (!result.ok) toast.error(result.error);
    else toast.success("Conta excluída");
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Contas"
        description="Bancos, carteiras e cartões que você acompanha."
        action={
          <Button onClick={openCreate}>
            <Plus /> Nova conta
          </Button>
        }
      />

      {active.length === 0 && archived.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
            <p className="text-sm text-muted-foreground">
              Você ainda não tem contas. Crie a primeira para começar a
              registrar transações.
            </p>
            <Button onClick={openCreate}>
              <Plus /> Nova conta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...active, ...archived].map((account) => (
            <Card
              key={account.id}
              className={account.archived ? "opacity-60" : undefined}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="size-3 rounded-full"
                      style={{ backgroundColor: account.color }}
                    />
                    <span className="font-medium">{account.name}</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="-mt-1 -mr-1 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                      disabled={pendingId === account.id}
                      aria-label="Ações da conta"
                    >
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => openEdit(account)}>
                        <Pencil className="size-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => void onArchiveToggle(account)}
                      >
                        {account.archived ? (
                          <>
                            <ArchiveRestore className="size-4" /> Reativar
                          </>
                        ) : (
                          <>
                            <Archive className="size-4" /> Arquivar
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onSelect={() => void onDelete(account)}
                      >
                        <Trash2 className="size-4" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <p className="mt-4 text-2xl font-semibold tabular-nums">
                  {formatCurrency(account.balance, {
                    currency: account.currency,
                  })}
                </p>

                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">
                    {ACCOUNT_TYPE_LABELS[
                      account.type as keyof typeof ACCOUNT_TYPE_LABELS
                    ] ?? account.type}
                  </Badge>
                  {account.institution && <span>{account.institution}</span>}
                  <span className="ml-auto">
                    {account.transactionCount} lanç.
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AccountFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        account={editing}
      />
    </div>
  );
}
