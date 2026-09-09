import { CountUp } from "@/components/ui/count-up";
import { formatCurrency } from "@/lib/money";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  tone = "neutral",
  hint,
}: {
  label: string;
  value: number;
  tone?: "neutral" | "income" | "expense";
  hint?: string;
}) {
  return (
    <div className="p-5">
      <p className="text-[0.72rem] tracking-[0.14em] text-muted-foreground uppercase">
        {label}
      </p>
      <CountUp
        value={value}
        format={(n) => formatCurrency(Math.round(n))}
        className={cn(
          "mt-2 block font-serif text-[1.6rem] leading-none tracking-tight tabular-nums",
          tone === "income" && "text-success",
          tone === "expense" && "text-destructive",
        )}
      />
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
