"use client";

import { useRef, useState } from "react";
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
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { centsToDecimalString } from "@/lib/money";
import { setBudget } from "@/server/actions/budgets";

export function BudgetLimitDialog({
  open,
  onOpenChange,
  month,
  category,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  month: string;
  category: { id: string; name: string; limitCents: number } | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);

  const initial =
    category && category.limitCents > 0
      ? centsToDecimalString(category.limitCents)
      : "";

  async function onSave() {
    if (!category) return;
    setSaving(true);
    const result = await setBudget({
      categoryId: category.id,
      month,
      limit: inputRef.current?.value ?? "",
    });
    setSaving(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Orçamento salvo");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Orçamento · {category?.name}</DialogTitle>
          <DialogDescription>
            Limite de gasto para este mês. Deixe vazio para remover.
          </DialogDescription>
        </DialogHeader>

        <Field label="Limite mensal" htmlFor="limit" hint="Ex.: 800,00">
          <Input
            key={category?.id ?? "none"}
            id="limit"
            ref={inputRef}
            inputMode="decimal"
            placeholder="0,00"
            defaultValue={initial}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") void onSave();
            }}
          />
        </Field>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={onSave} disabled={saving}>
            {saving ? "Salvando…" : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
