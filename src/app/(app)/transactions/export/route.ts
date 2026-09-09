import { requireUserId } from "@/lib/dal";
import { centsToCsvAmount, toCsv } from "@/lib/csv-export";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { clientIpFrom, rateLimit } from "@/lib/rate-limit";
import { transactionFilterSchema } from "@/lib/validation/transaction";
import { buildTransactionWhere } from "@/server/queries/transactions";

const KIND_LABEL: Record<string, string> = {
  INCOME: "Receita",
  EXPENSE: "Despesa",
};

export async function GET(request: Request) {
  const userId = await requireUserId();

  const gate = rateLimit(
    `export:${clientIpFrom(request.headers)}`,
    20,
    60 * 1000,
  );
  if (!gate.ok) {
    return new Response("Muitas exportações. Aguarde um instante.", {
      status: 429,
      headers: { "Retry-After": String(gate.retryAfterSeconds) },
    });
  }

  const url = new URL(request.url);
  const filters = transactionFilterSchema.parse(
    Object.fromEntries(url.searchParams),
  );
  const where = buildTransactionWhere(userId, filters);

  const rows = await prisma.transaction.findMany({
    where,
    include: {
      category: { select: { name: true } },
      financialAccount: { select: { name: true } },
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: 10000,
  });

  const csv = toCsv(
    rows.map((t) => ({
      data: formatDate(t.date),
      descricao: t.description,
      categoria: t.category?.name ?? "",
      conta: t.financialAccount.name,
      tipo: KIND_LABEL[t.kind] ?? t.kind,
      valor: centsToCsvAmount(
        t.kind === "INCOME" ? t.amountCents : -t.amountCents,
      ),
    })),
    [
      { key: "data", header: "Data" },
      { key: "descricao", header: "Descrição" },
      { key: "categoria", header: "Categoria" },
      { key: "conta", header: "Conta" },
      { key: "tipo", header: "Tipo" },
      { key: "valor", header: "Valor" },
    ],
  );

  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="fintrack-transacoes-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
