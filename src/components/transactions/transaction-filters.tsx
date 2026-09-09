"use client";

import { X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TRANSACTION_KIND_LABELS,
  TRANSACTION_KINDS,
} from "@/lib/validation/transaction";

type Option = { id: string; name: string };

const ALL = "all";

export function TransactionFilters({
  accounts,
  categories,
}: {
  accounts: Option[];
  categories: Option[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [q, setQ] = useState(searchParams.get("q") ?? "");

  const commit = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      params.delete("page");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams],
  );

  // Debounced text search.
  useEffect(() => {
    const current = searchParams.get("q") ?? "";
    if (q === current) return;
    const timer = setTimeout(() => {
      commit((params) => {
        if (q) params.set("q", q);
        else params.delete("q");
      });
    }, 350);
    return () => clearTimeout(timer);
  }, [q, searchParams, commit]);

  const setParam = (key: string, value: string | null) =>
    commit((params) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });

  const hasFilters =
    ["from", "to", "accountId", "categoryId", "kind", "q"].some((k) =>
      searchParams.has(k),
    ) || q.length > 0;

  return (
    <div className="mb-4 flex flex-wrap items-end gap-3">
      <div className="min-w-[12rem] flex-1">
        <Input
          placeholder="Buscar descrição…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <Input
        type="date"
        aria-label="De"
        className="w-auto"
        defaultValue={searchParams.get("from") ?? ""}
        onChange={(e) => setParam("from", e.target.value || null)}
      />
      <Input
        type="date"
        aria-label="Até"
        className="w-auto"
        defaultValue={searchParams.get("to") ?? ""}
        onChange={(e) => setParam("to", e.target.value || null)}
      />

      <Select
        value={searchParams.get("kind") ?? ALL}
        onValueChange={(v) => setParam("kind", v === ALL ? null : v)}
      >
        <SelectTrigger className="w-[9rem]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todos os tipos</SelectItem>
          {TRANSACTION_KINDS.map((k) => (
            <SelectItem key={k} value={k}>
              {TRANSACTION_KIND_LABELS[k]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("accountId") ?? ALL}
        onValueChange={(v) => setParam("accountId", v === ALL ? null : v)}
      >
        <SelectTrigger className="w-[11rem]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todas as contas</SelectItem>
          {accounts.map((a) => (
            <SelectItem key={a.id} value={a.id}>
              {a.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("categoryId") ?? ALL}
        onValueChange={(v) => setParam("categoryId", v === ALL ? null : v)}
      >
        <SelectTrigger className="w-[11rem]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todas as categorias</SelectItem>
          <SelectItem value="none">Sem categoria</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          onClick={() => {
            setQ("");
            startTransition(() => router.push(pathname));
          }}
        >
          <X /> Limpar
        </Button>
      )}
    </div>
  );
}
