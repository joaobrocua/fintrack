"use client";

import { CategoryIcon } from "@/components/categories/category-icon";
import { ICON_NAMES } from "@/lib/icons";
import { cn } from "@/lib/utils";

export function IconPicker({
  value,
  onChange,
  color,
}: {
  value: string;
  onChange: (name: string) => void;
  color?: string;
}) {
  return (
    <div className="grid max-h-40 grid-cols-8 gap-1 overflow-y-auto rounded-md border p-2">
      {ICON_NAMES.map((name) => {
        const active = name === value;
        return (
          <button
            key={name}
            type="button"
            aria-label={name}
            aria-pressed={active}
            onClick={() => onChange(name)}
            className={cn(
              "flex aspect-square items-center justify-center rounded-md border text-muted-foreground transition-colors hover:bg-accent",
              active
                ? "border-primary bg-accent text-foreground"
                : "border-transparent",
            )}
          >
            <CategoryIcon
              name={name}
              className="size-4"
              style={active && color ? { color } : undefined}
            />
          </button>
        );
      })}
    </div>
  );
}
