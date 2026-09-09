"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldRow } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { centsToDecimalString } from "@/lib/money";
import { toDateInputValue } from "@/lib/format";
import {
  TRANSACTION_KIND_LABELS,
  TRANSACTION_KINDS,
  transactionFormSchema,
  type TransactionFormInput,
  type TransactionFormValues,
} from "@/lib/validation/transaction";
import { saveTransaction } from "@/server/actions/transactions";
import type { CategoryOption } from "@/server/queries/categories";

export type EditableTransaction = {
  id: string;
  date: string;
  description: string;
  amountCents: number;
  kind: "INCOME" | "EXPENSE";
  financialAccountId: string;
  categoryId: string | null;
  notes: string | null;
};

type AccountOption = { id: string; name: string };

function emptyValues(accountId?: string): TransactionFormInput {
  return {
    date: toDateInputValue(new Date()),
    description: "",
    amount: "",
    kind: "EXPENSE",
    financialAccountId: accountId ?? "",
    categoryId: "none",
    notes: "",
  };
}

export function TransactionFormDialog({
  open,
  onOpenChange,
  transaction,
  accounts,
  categories,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: EditableTransaction | null;
  accounts: AccountOption[];
  categories: CategoryOption[];
}) {
  const form = useForm<TransactionFormInput, unknown, TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: emptyValues(),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    if (!open) return;
    reset(
      transaction
        ? {
            date: toDateInputValue(transaction.date),
            description: transaction.description,
            amount: centsToDecimalString(transaction.amountCents),
            kind: transaction.kind,
            financialAccountId: transaction.financialAccountId,
            categoryId: transaction.categoryId ?? "none",
            notes: transaction.notes ?? "",
          }
        : emptyValues(accounts[0]?.id),
    );
  }, [open, transaction, accounts, reset]);

  const kind = watch("kind");
  const accountId = watch("financialAccountId");
  const categoryId = watch("categoryId");

  const visibleCategories = useMemo(
    () => categories.filter((c) => c.kind === kind),
    [categories, kind],
  );

  async function onSubmit() {
    const result = await saveTransaction({
      ...form.getValues(),
      id: transaction?.id,
    });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(transaction ? "Transação atualizada" : "Transação criada");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {transaction ? "Editar transação" : "Nova transação"}
          </DialogTitle>
          <DialogDescription>
            Registre uma receita ou despesa em uma das suas contas.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FieldRow>
            <Field label="Tipo" error={errors.kind?.message}>
              <Select
                value={kind}
                onValueChange={(v) => {
                  setValue("kind", v as TransactionFormInput["kind"], {
                    shouldValidate: true,
                  });
                  setValue("categoryId", "none");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_KINDS.map((k) => (
                    <SelectItem key={k} value={k}>
                      {TRANSACTION_KIND_LABELS[k]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Data" htmlFor="date" error={errors.date?.message}>
              <Input id="date" type="date" {...register("date")} />
            </Field>
          </FieldRow>

          <Field
            label="Descrição"
            htmlFor="description"
            error={errors.description?.message}
          >
            <Input
              id="description"
              placeholder="Mercado, salário, aluguel…"
              {...register("description")}
            />
          </Field>

          <FieldRow>
            <Field
              label="Valor"
              htmlFor="amount"
              error={errors.amount?.message}
              hint="Ex.: 89,90"
            >
              <Input
                id="amount"
                inputMode="decimal"
                placeholder="0,00"
                {...register("amount")}
              />
            </Field>

            <Field label="Conta" error={errors.financialAccountId?.message}>
              <Select
                value={accountId}
                onValueChange={(v) =>
                  setValue("financialAccountId", v, { shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </FieldRow>

          <Field label="Categoria" error={errors.categoryId?.message}>
            <Select
              value={categoryId}
              onValueChange={(v) => setValue("categoryId", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem categoria</SelectItem>
                {visibleCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field
            label="Observações"
            htmlFor="notes"
            error={errors.notes?.message}
          >
            <Input id="notes" placeholder="Opcional" {...register("notes")} />
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || accounts.length === 0}
            >
              {isSubmitting ? "Salvando…" : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
