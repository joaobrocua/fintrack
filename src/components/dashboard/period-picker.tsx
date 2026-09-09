"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PERIOD_LABELS, PERIOD_PRESETS, type PeriodPreset } from "@/lib/period";

export function PeriodPicker({ value }: { value: PeriodPreset }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function onChange(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", next);
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[11rem]" aria-busy={isPending}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PERIOD_PRESETS.map((preset) => (
          <SelectItem key={preset} value={preset}>
            {PERIOD_LABELS[preset]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
