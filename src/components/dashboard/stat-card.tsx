import { Card, CardContent } from "@/components/ui/card";
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
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p
          className={cn(
            "mt-1 text-2xl font-semibold tabular-nums",
            tone === "income" && "text-success",
            tone === "expense" && "text-destructive",
          )}
        >
          {formatCurrency(value)}
        </p>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}
