"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
      <h1 className="text-lg font-semibold">Algo deu errado</h1>
      <p className="text-sm text-muted-foreground">
        Não foi possível carregar esta página. Tente de novo — se persistir, o
        problema é do nosso lado.
      </p>
      <Button onClick={reset}>Tentar de novo</Button>
    </div>
  );
}
