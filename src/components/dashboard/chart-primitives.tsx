"use client";

import type { ReactNode } from "react";
import { formatCurrency } from "@/lib/money";

/** Shared Recharts tooltip styled with our tokens. */
export function MoneyTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  label?: ReactNode;
  payload?: Array<{
    name?: string;
    value?: number;
    color?: string;
    payload?: Record<string, unknown>;
  }>;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      {label != null && (
        <p className="mb-1 font-medium text-popover-foreground">{label}</p>
      )}
      <ul className="space-y-0.5">
        {payload.map((entry, i) => (
          <li key={i} className="flex items-center gap-2">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="ml-auto font-medium text-popover-foreground tabular-nums">
              {formatCurrency(Number(entry.value ?? 0))}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Compact currency for axis ticks: R$ 1,2 mil / R$ 980. */
export function compactCurrency(cents: number): string {
  const value = cents / 100;
  const abs = Math.abs(value);
  if (abs >= 1_000_000)
    return `R$ ${(value / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}mi`;
  if (abs >= 1_000)
    return `R$ ${(value / 1_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}mil`;
  return `R$ ${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;
}

export const AXIS_PROPS = {
  stroke: "var(--color-muted-foreground)",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
} as const;
