"use client";

import { Field, FieldRow } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ColumnMapping } from "@/lib/csv";

function ColumnSelect({
  value,
  onChange,
  headers,
  placeholder = "Selecione a coluna",
  allowNone = false,
}: {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  headers: string[];
  placeholder?: string;
  allowNone?: boolean;
}) {
  return (
    <Select
      value={value ?? (allowNone ? "__none" : undefined)}
      onValueChange={(v) => onChange(v === "__none" ? undefined : v)}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {allowNone && <SelectItem value="__none">—</SelectItem>}
        {headers.map((h) => (
          <SelectItem key={h} value={h}>
            {h}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function ColumnMapper({
  headers,
  mapping,
  onChange,
}: {
  headers: string[];
  mapping: ColumnMapping;
  onChange: (mapping: ColumnMapping) => void;
}) {
  const patch = (partial: Partial<ColumnMapping>) =>
    onChange({ ...mapping, ...partial });

  return (
    <div className="space-y-4">
      <FieldRow>
        <Field label="Coluna de data">
          <ColumnSelect
            headers={headers}
            value={mapping.date}
            onChange={(v) => patch({ date: v ?? "" })}
          />
        </Field>
        <Field label="Coluna de descrição">
          <ColumnSelect
            headers={headers}
            value={mapping.description}
            onChange={(v) => patch({ description: v ?? "" })}
          />
        </Field>
      </FieldRow>

      <div className="space-y-1.5">
        <Label>Como está o valor?</Label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => patch({ amountMode: "single" })}
            className={
              "rounded-md border px-3 py-1.5 text-sm " +
              (mapping.amountMode === "single"
                ? "border-primary bg-accent"
                : "text-muted-foreground")
            }
          >
            Uma coluna (com sinal)
          </button>
          <button
            type="button"
            onClick={() => patch({ amountMode: "split" })}
            className={
              "rounded-md border px-3 py-1.5 text-sm " +
              (mapping.amountMode === "split"
                ? "border-primary bg-accent"
                : "text-muted-foreground")
            }
          >
            Entrada e saída separadas
          </button>
        </div>
      </div>

      {mapping.amountMode === "single" ? (
        <FieldRow>
          <Field label="Coluna de valor">
            <ColumnSelect
              headers={headers}
              value={mapping.amount}
              onChange={(v) => patch({ amount: v })}
            />
          </Field>
          <Field
            label="Sinal invertido?"
            hint="Marque se despesas aparecem como positivas"
          >
            <label className="flex h-9 items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={mapping.invertSign ?? false}
                onChange={(e) => patch({ invertSign: e.target.checked })}
                className="size-4"
              />
              Inverter
            </label>
          </Field>
        </FieldRow>
      ) : (
        <FieldRow>
          <Field label="Coluna de entrada (crédito)">
            <ColumnSelect
              headers={headers}
              value={mapping.inflow}
              onChange={(v) => patch({ inflow: v })}
              allowNone
            />
          </Field>
          <Field label="Coluna de saída (débito)">
            <ColumnSelect
              headers={headers}
              value={mapping.outflow}
              onChange={(v) => patch({ outflow: v })}
              allowNone
            />
          </Field>
        </FieldRow>
      )}
    </div>
  );
}
