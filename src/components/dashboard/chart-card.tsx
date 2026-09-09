import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

export function ChartCard({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <Card className="lift h-full">
      <CardContent className="p-5">
        <div className="mb-4 flex items-start justify-between gap-2 border-b pb-3">
          <div>
            <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
            {subtitle && (
              <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {action}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

export function ChartEmpty({ message }: { message: string }) {
  return (
    <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
