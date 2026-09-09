import type { Metadata } from "next";
import { requireUser } from "@/lib/dal";

export const metadata: Metadata = { title: "Painel" };

export default async function DashboardPage() {
  const user = await requireUser();
  const firstName = user.name?.split(" ")[0] ?? "por aqui";

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold tracking-tight">
        Olá, {firstName} 👋
      </h1>
      <p className="mt-1 text-muted-foreground">
        Seu painel financeiro aparece aqui assim que você tiver contas e
        transações. Por enquanto, comece cadastrando uma conta.
      </p>

      <div className="mt-8 rounded-xl border border-dashed p-10 text-center">
        <p className="text-sm text-muted-foreground">
          Nada para mostrar ainda — os gráficos chegam no próximo milestone.
        </p>
      </div>
    </div>
  );
}
