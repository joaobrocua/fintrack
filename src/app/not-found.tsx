import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo className="text-lg" />
      <div>
        <p className="text-5xl font-semibold tracking-tight">404</p>
        <p className="mt-2 text-muted-foreground">
          Esta página não existe ou foi movida.
        </p>
      </div>
      <Button asChild>
        <Link href="/dashboard">Voltar ao painel</Link>
      </Button>
    </div>
  );
}
