"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CategoryIcon } from "@/components/categories/category-icon";
import { IconPicker } from "@/components/categories/icon-picker";
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
import {
  CATEGORY_KIND_LABELS,
  CATEGORY_KINDS,
  categoryFormSchema,
  type CategoryFormInput,
  type CategoryFormValues,
} from "@/lib/validation/category";
import { saveCategory } from "@/server/actions/categories";

export type EditableCategory = {
  id: string;
  name: string;
  kind: "INCOME" | "EXPENSE";
  color: string;
  icon: string;
};

const EMPTY: CategoryFormInput = {
  name: "",
  kind: "EXPENSE",
  color: "#64748b",
  icon: "tag",
};

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: EditableCategory | null;
}) {
  const form = useForm<CategoryFormInput, unknown, CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
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
    reset(category ?? EMPTY);
  }, [open, category, reset]);

  const color = watch("color") ?? "#64748b";
  const icon = watch("icon") ?? "tag";
  const kind = watch("kind") ?? "EXPENSE";

  async function onSubmit() {
    const result = await saveCategory({
      ...form.getValues(),
      id: category?.id,
    });
    if (!result.ok) {
      if (result.fieldErrors?.name) {
        form.setError("name", { message: result.fieldErrors.name[0] });
      } else {
        toast.error(result.error);
      }
      return;
    }
    toast.success(category ? "Categoria atualizada" : "Categoria criada");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {category ? "Editar categoria" : "Nova categoria"}
          </DialogTitle>
          <DialogDescription>
            Categorias classificam suas transações e alimentam os gráficos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center gap-3">
            <span
              className="flex size-11 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${color}22`, color }}
            >
              <CategoryIcon name={icon} className="size-5" />
            </span>
            <div className="flex-1">
              <Field label="Nome" htmlFor="name" error={errors.name?.message}>
                <Input
                  id="name"
                  placeholder="Alimentação, Salário…"
                  {...register("name")}
                />
              </Field>
            </div>
          </div>

          <FieldRow>
            <Field label="Tipo" error={errors.kind?.message}>
              <Select
                value={kind}
                onValueChange={(v) =>
                  setValue("kind", v as CategoryFormInput["kind"], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_KINDS.map((k) => (
                    <SelectItem key={k} value={k}>
                      {CATEGORY_KIND_LABELS[k]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  aria-label="Cor da categoria"
                />
                <Input
                  value={color}
                  onChange={(e) => setValue("color", e.target.value)}
                  className="font-mono"
                />
              </div>
            </Field>
          </FieldRow>

          <Field label="Ícone" error={errors.icon?.message}>
            <IconPicker
              value={icon}
              color={color}
              onChange={(name) => setValue("icon", name)}
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando…" : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
