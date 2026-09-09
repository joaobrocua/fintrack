import type { Metadata } from "next";
import { TransactionsView } from "@/components/transactions/transactions-view";
import { requireUser } from "@/lib/dal";
import { transactionFilterSchema } from "@/lib/validation/transaction";
import { getAccountOptions } from "@/server/queries/accounts";
import { getCategoryOptions } from "@/server/queries/categories";
import { getTransactions } from "@/server/queries/transactions";

export const metadata: Metadata = { title: "Transações" };

export default async function TransactionsPage({
  searchParams,
}: PageProps<"/transactions">) {
  const user = await requireUser();
  const filters = transactionFilterSchema.parse(await searchParams);

  const [data, accounts, categories] = await Promise.all([
    getTransactions(user.id, filters),
    getAccountOptions(user.id),
    getCategoryOptions(user.id),
  ]);

  return (
    <TransactionsView data={data} accounts={accounts} categories={categories} />
  );
}
