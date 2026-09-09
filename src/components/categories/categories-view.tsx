"use client";

import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell/page-header";
import {
  CategoryFormDialog,
  type EditableCategory,
} from "@/components/categories/category-form-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CategoryIcon } from "@/components/categories/category-icon";
import { CATEGORY_KIND_LABELS } from "@/lib/validation/category";
import { deleteCategory } from "@/server/actions/categories";
import type { CategoryWithUsage } from "@/server/queries/categories";

function CategoryRow({
  category,
  onEdit,
  onDelete,
  pending,
}: {
  category: CategoryWithUsage;
  onEdit: () => void;
  onDelete: () => void;
  pending: boolean;
}) {
  return (
    <div
      className={
        "flex items-center gap-3 rounded-lg border px-3 py-2.5 " +
        (pending ? "opacity-50" : "")
      }
    >
      <span
        className="flex size-8 items-center justify-center rounded-md"
        style={{
          backgroundColor: `${category.color}22`,
          color: category.color,
        }}
      >
        <CategoryIcon name={category.icon} className="size-4" />
      </span>
      <span className="flex-1 font-medium">{category.name}</span>
      <span className="text-xs text-muted-foreground">
        {category.transactionCount} lanç.
        {category.ruleCount > 0 && ` · ${category.ruleCount} regra(s)`}
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Ações"
          disabled={pending}
        >
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={onEdit}>
            <Pencil className="size-4" /> Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={onDelete}
          >
            <Trash2 className="size-4" /> Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function CategoriesView({
  categories,
}: {
  categories: CategoryWithUsage[];
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EditableCategory | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const income = categories.filter((c) => c.kind === "INCOME");
  const expense = categories.filter((c) => c.kind === "EXPENSE");

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(category: CategoryWithUsage) {
    setEditing({
      id: category.id,
      name: category.name,
      kind: category.kind,
      color: category.color,
      icon: category.icon,
    });
    setDialogOpen(true);
  }

  async function onDelete(category: CategoryWithUsage) {
    const warning =
      category.transactionCount > 0
        ? `\n\n${category.transactionCount} transação(ões) ficarão sem categoria.`
        : "";
    if (!confirm(`Excluir a categoria "${category.name}"?${warning}`)) return;
    setPendingId(category.id);
    const result = await deleteCategory(category.id);
    setPendingId(null);
    if (!result.ok) toast.error(result.error);
    else toast.success("Categoria excluída");
  }

  const section = (title: string, list: CategoryWithUsage[]) => (
    <Card>
      <CardContent className="p-4">
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          {title}
        </h2>
        {list.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Nenhuma categoria deste tipo.
          </p>
        ) : (
          <div className="space-y-2">
            {list.map((category) => (
              <CategoryRow
                key={category.id}
                category={category}
                pending={pendingId === category.id}
                onEdit={() => openEdit(category)}
                onDelete={() => void onDelete(category)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Categorias"
        description="Organize suas transações em grupos."
        action={
          <Button onClick={openCreate}>
            <Plus /> Nova categoria
          </Button>
        }
      />

      <div className="grid gap-4">
        {section(CATEGORY_KIND_LABELS.EXPENSE + "s", expense)}
        {section(CATEGORY_KIND_LABELS.INCOME + "s", income)}
      </div>

      <CategoryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editing}
      />
    </div>
  );
}
