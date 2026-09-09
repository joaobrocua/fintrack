"use client";

import { MoreHorizontal, Pencil, Plus, Trash2, Wand2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell/page-header";
import {
  RuleFormDialog,
  type EditableRule,
} from "@/components/rules/rule-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Switch } from "@/components/ui/switch";
import { RULE_MATCH_TYPE_LABELS } from "@/lib/validation/rule";
import {
  applyRulesToUncategorized,
  deleteRule,
  setRuleEnabled,
} from "@/server/actions/rules";
import type { CategoryOption } from "@/server/queries/categories";
import type { RuleWithCategory } from "@/server/queries/rules";

export function RulesView({
  rules,
  categories,
}: {
  rules: RuleWithCategory[];
  categories: CategoryOption[];
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EditableRule | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [applying, startApply] = useTransition();

  const noCategories = categories.length === 0;

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(rule: RuleWithCategory) {
    setEditing({
      id: rule.id,
      matchType: rule.matchType,
      pattern: rule.pattern,
      categoryId: rule.categoryId,
      priority: rule.priority,
      enabled: rule.enabled,
    });
    setDialogOpen(true);
  }

  async function onToggle(rule: RuleWithCategory) {
    setPendingId(rule.id);
    const result = await setRuleEnabled(rule.id, !rule.enabled);
    setPendingId(null);
    if (!result.ok) toast.error(result.error);
  }

  async function onDelete(rule: RuleWithCategory) {
    if (!confirm("Excluir esta regra?")) return;
    setPendingId(rule.id);
    const result = await deleteRule(rule.id);
    setPendingId(null);
    if (!result.ok) toast.error(result.error);
    else toast.success("Regra excluída");
  }

  function onApply() {
    startApply(async () => {
      const result = await applyRulesToUncategorized();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      const { updated, scanned } = result.data;
      toast.success(
        updated > 0
          ? `${updated} de ${scanned} transações categorizadas`
          : `Nenhuma das ${scanned} transações sem categoria combinou`,
      );
    });
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Regras de categorização"
        description="Aplicadas automaticamente na importação de CSV — e sob demanda aqui."
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onApply}
              disabled={applying || rules.length === 0}
            >
              <Wand2 /> {applying ? "Aplicando…" : "Aplicar agora"}
            </Button>
            <Button onClick={openCreate} disabled={noCategories}>
              <Plus /> Nova regra
            </Button>
          </div>
        }
      />

      {noCategories ? (
        <Card>
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            Crie categorias antes de definir regras.{" "}
            <Link href="/categories" className="text-primary hover:underline">
              Ir para Categorias
            </Link>
          </CardContent>
        </Card>
      ) : rules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhuma regra ainda. Exemplo:{" "}
              <em>contém “IFOOD” → Alimentação</em>.
            </p>
            <Button onClick={openCreate}>
              <Plus /> Nova regra
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Ativa</TableHead>
                <TableHead>Condição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="w-20 text-right">Prior.</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow
                  key={rule.id}
                  className={pendingId === rule.id ? "opacity-50" : undefined}
                >
                  <TableCell>
                    <Switch
                      checked={rule.enabled}
                      disabled={pendingId === rule.id}
                      onCheckedChange={() => void onToggle(rule)}
                      aria-label="Ativar regra"
                    />
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">
                      {RULE_MATCH_TYPE_LABELS[rule.matchType]}
                    </span>{" "}
                    <span className="font-medium">
                      &ldquo;{rule.pattern}&rdquo;
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      style={{
                        borderColor: `${rule.category.color}55`,
                        color: rule.category.color,
                      }}
                    >
                      {rule.category.name}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground tabular-nums">
                    {rule.priority}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                        aria-label="Ações"
                        disabled={pendingId === rule.id}
                      >
                        <MoreHorizontal className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => openEdit(rule)}>
                          <Pencil className="size-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={() => void onDelete(rule)}
                        >
                          <Trash2 className="size-4" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <RuleFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        rule={editing}
        categories={categories}
      />
    </div>
  );
}
