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
import { Switch } from "@/components/ui/switch";
import {
  RULE_MATCH_TYPE_LABELS,
  RULE_MATCH_TYPES,
  ruleFormSchema,
  type RuleFormInput,
  type RuleFormValues,
} from "@/lib/validation/rule";
import { saveRule } from "@/server/actions/rules";
import type { CategoryOption } from "@/server/queries/categories";

export type EditableRule = {
  id: string;
  matchType: RuleFormInput["matchType"];
  pattern: string;
  categoryId: string;
  priority: number;
  enabled: boolean;
};

const EMPTY: RuleFormInput = {
  matchType: "CONTAINS",
  pattern: "",
  categoryId: "",
  priority: 0,
  enabled: true,
};

export function RuleFormDialog({
  open,
  onOpenChange,
  rule,
  categories,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule?: EditableRule | null;
  categories: CategoryOption[];
}) {
  const form = useForm<RuleFormInput, unknown, RuleFormValues>({
    resolver: zodResolver(ruleFormSchema),
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
      rule
        ? {
            matchType: rule.matchType,
            pattern: rule.pattern,
            categoryId: rule.categoryId,
            priority: rule.priority,
            enabled: rule.enabled,
          }
        : EMPTY,
    );
  }, [open, rule, reset]);

  const matchType = watch("matchType");
  const categoryId = watch("categoryId");
  const enabled = watch("enabled") ?? true;

  async function onSubmit() {
    const result = await saveRule({ ...form.getValues(), id: rule?.id });
    if (!result.ok) {
      if (result.fieldErrors?.pattern) {
        form.setError("pattern", { message: result.fieldErrors.pattern[0] });
      } else {
        toast.error(result.error);
      }
      return;
    }
    toast.success(rule ? "Regra atualizada" : "Regra criada");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{rule ? "Editar regra" : "Nova regra"}</DialogTitle>
          <DialogDescription>
            Quando a descrição de uma transação combinar, ela recebe a categoria
            escolhida.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FieldRow>
            <Field label="Condição" error={errors.matchType?.message}>
              <Select
                value={matchType}
                onValueChange={(v) =>
                  setValue("matchType", v as RuleFormInput["matchType"], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RULE_MATCH_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {RULE_MATCH_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field
              label="Prioridade"
              htmlFor="priority"
              error={errors.priority?.message}
              hint="Maior = avaliada antes"
            >
              <Input
                id="priority"
                type="number"
                min={0}
                max={999}
                {...register("priority")}
              />
            </Field>
          </FieldRow>

          <Field
            label="Padrão"
            htmlFor="pattern"
            error={errors.pattern?.message}
            hint={
              matchType === "REGEX"
                ? "Expressão regular (case-insensitive)"
                : "Texto a procurar na descrição"
            }
          >
            <Input
              id="pattern"
              placeholder={matchType === "REGEX" ? "amzn|amazon" : "IFOOD"}
              {...register("pattern")}
            />
          </Field>

          <Field label="Categoria" error={errors.categoryId?.message}>
            <Select
              value={categoryId}
              onValueChange={(v) =>
                setValue("categoryId", v, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="flex items-center justify-between rounded-md border px-3 py-2.5">
            <div>
              <p className="text-sm font-medium">Ativa</p>
              <p className="text-xs text-muted-foreground">
                Regras inativas são ignoradas na importação.
              </p>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={(v) => setValue("enabled", v)}
            />
          </div>

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
