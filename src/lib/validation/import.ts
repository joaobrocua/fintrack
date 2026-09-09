import { z } from "zod";

export const MAX_IMPORT_ROWS = 5000;

export const importRowSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z.string().trim().min(1).max(200),
  amountCents: z.number().int().positive(),
  kind: z.enum(["INCOME", "EXPENSE"]),
});

export const commitImportSchema = z.object({
  financialAccountId: z.string().min(1),
  filename: z.string().trim().min(1).max(200),
  columnMapping: z.record(z.string(), z.unknown()).default({}),
  rows: z.array(importRowSchema).min(1).max(MAX_IMPORT_ROWS),
});

export type ImportRow = z.infer<typeof importRowSchema>;
export type CommitImportInput = z.infer<typeof commitImportSchema>;
