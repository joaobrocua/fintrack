"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
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
import {
  ACCOUNT_TYPE_LABELS,
  ACCOUNT_TYPES,
  accountFormSchema,
  type AccountFormInput,
  type AccountFormValues,
} from "@/lib/validation/account";
import { saveAccount } from "@/server/actions/accounts";

export type EditableAccount = {
  id: string;
  name: string;
  type: string;
  institution: string | null;
  color: string;
  initialBalance: number;
};

const EMPTY: AccountFormInput = {
  name: "",
  type: "CHECKING",
  institution: "",
  initialBalance: "",
  color: "#6366f1",
};

export function AccountFormDialog({
  open,
  onOpenChange,
  account,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: EditableAccount | null;
}) {
  const form = useForm<AccountFormInput, unknown, AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: EMPTY,
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
      account
        ? {
            name: account.name,
            type: account.type as AccountFormInput["type"],
            institution: account.institution ?? "",
            initialBalance: centsToDecimalString(account.initialBalance),
            color: account.color,
          }
        : EMPTY,
    );
  }, [open, account, reset]);

  const color = watch("color");
  const type = watch("type");

  // The resolver validates on the client; the server re-parses the raw
  // (string) values, so we forward those rather than the transformed output.
  async function onSubmit() {
    const result = await saveAccount({
      ...form.getValues(),
      id: account?.id,
    });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(account ? "Conta atualizada" : "Conta criada");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{account ? "Editar conta" : "Nova conta"}</DialogTitle>
          <DialogDescription>
            Contas agrupam suas transações e têm um saldo próprio.
          </DialogDescription>
        </DialogHeader>

        <form
          id="account-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <Field label="Nome" htmlFor="name" error={errors.name?.message}>
            <Input
              id="name"
              placeholder="Nubank, Carteira…"
              {...register("name")}
            />
          </Field>

          <FieldRow>
            <Field label="Tipo" error={errors.type?.message}>
              <Select
                value={type}
                onValueChange={(v) =>
                  setValue("type", v as AccountFormInput["type"], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {ACCOUNT_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field
              label="Instituição"
              htmlFor="institution"
              error={errors.institution?.message}
            >
              <Input
                id="institution"
                placeholder="Opcional"
                {...register("institution")}
              />
            </Field>
          </FieldRow>

          <FieldRow>
            <Field
              label="Saldo inicial"
              htmlFor="initialBalance"
              error={errors.initialBalance?.message}
              hint="Ex.: 1.250,00"
            >
              <Input
                id="initialBalance"
                inputMode="decimal"
                placeholder="0,00"
                {...register("initialBalance")}
              />
            </Field>

            <Field label="Cor" error={errors.color?.message}>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) =>
                    setValue("color", e.target.value, { shouldValidate: true })
                  }
                  className="h-9 w-12 cursor-pointer rounded-md border border-input bg-background"
                  aria-label="Cor da conta"
                />
                <Input
                  value={color}
                  onChange={(e) => setValue("color", e.target.value)}
                  className="font-mono"
                />
              </div>
            </Field>
          </FieldRow>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando…" : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
