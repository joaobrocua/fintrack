"use client";

import { Download } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ExportButton({ disabled }: { disabled?: boolean }) {
  const searchParams = useSearchParams();

  if (disabled) {
    return (
      <Button variant="outline" disabled>
        <Download /> Exportar CSV
      </Button>
    );
  }

  const params = new URLSearchParams(searchParams.toString());
  params.delete("page");
  const href = `/transactions/export?${params.toString()}`;

  return (
    <Button asChild variant="outline">
      <a href={href}>
        <Download /> Exportar CSV
      </a>
    </Button>
  );
}
