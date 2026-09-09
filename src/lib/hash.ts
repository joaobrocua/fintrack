import { createHash } from "node:crypto";

/**
 * Deterministic fingerprint of an imported row, used to skip re-importing the
 * same transaction. Scoped to the account so two accounts can hold identical
 * movements.
 */
export function transactionHash(input: {
  financialAccountId: string;
  date: string; // yyyy-mm-dd
  amountCents: number;
  kind: "INCOME" | "EXPENSE";
  description: string;
}): string {
  const normalized = [
    input.financialAccountId,
    input.date,
    String(input.amountCents),
    input.kind,
    input.description.trim().toLowerCase().replace(/\s+/g, " "),
  ].join("|");
  return createHash("sha256").update(normalized).digest("hex");
}
