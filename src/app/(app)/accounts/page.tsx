import type { Metadata } from "next";
import { AccountsView } from "@/components/accounts/accounts-view";
import { requireUser } from "@/lib/dal";
import { getAccountsWithBalance } from "@/server/queries/accounts";

export const metadata: Metadata = { title: "Contas" };

export default async function AccountsPage() {
  const user = await requireUser();
  const accounts = await getAccountsWithBalance(user.id);

  return <AccountsView accounts={accounts} />;
}
