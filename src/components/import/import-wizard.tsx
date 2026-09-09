"use client";

import { CheckCircle2, FileUp, Upload } from "lucide-react";
import Link from "next/link";
import Papa from "papaparse";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ColumnMapper } from "@/components/import/column-mapper";
import { ImportPreview } from "@/components/import/import-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { normalizeRows, suggestMapping, type ColumnMapping } from "@/lib/csv";
import { MAX_IMPORT_ROWS } from "@/lib/validation/import";
import { commitImport, type CommitImportResult } from "@/server/actions/import";

type AccountOption = { id: string; name: string };
type Step = "upload" | "map" | "done";

export function ImportWizard({ accounts }: { accounts: AccountOption[] }) {
  const [step, setStep] = useState<Step>("upload");
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [filename, setFilename] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [records, setRecords] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<CommitImportResult | null>(null);

  const { rows, errors } = useMemo(() => {
    if (!mapping) return { rows: [], errors: [] };
    return normalizeRows(records, mapping);
  }, [records, mapping]);

  function reset() {
    setStep("upload");
    setFilename("");
    setHeaders([]);
    setRecords([]);
    setMapping(null);
    setResult(null);
  }

  function handleFile(file: File) {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: "greedy",
      complete: (parsed) => {
        const fields = parsed.meta.fields ?? [];
        if (fields.length === 0 || parsed.data.length === 0) {
          toast.error("Não consegui ler colunas nesse arquivo.");
          return;
        }
        if (parsed.data.length > MAX_IMPORT_ROWS) {
          toast.error(`O arquivo tem mais de ${MAX_IMPORT_ROWS} linhas.`);
          return;
        }
        setFilename(file.name);
        setHeaders(fields);
        setRecords(parsed.data);
        setMapping(suggestMapping(fields));
        setStep("map");
      },
      error: () => toast.error("Falha ao ler o arquivo."),
    });
  }

  async function onImport() {
    if (!mapping || rows.length === 0) return;
    setSubmitting(true);
    const res = await commitImport({
      financialAccountId: accountId,
      filename,
      columnMapping: mapping as unknown as Record<string, unknown>,
      rows: rows.map(({ date, description, amountCents, kind }) => ({
        date,
        description,
        amountCents,
        kind,
      })),
    });
    setSubmitting(false);

    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setResult(res.data);
    setStep("done");
  }

  if (accounts.length === 0) {
    return (
      <Card>
        <CardContent className="p-10 text-center text-sm text-muted-foreground">
          Crie uma conta antes de importar um extrato.{" "}
          <Link href="/accounts" className="text-primary hover:underline">
            Ir para Contas
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (step === "done" && result) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
          <CheckCircle2 className="size-10 text-success" />
          <div>
            <p className="text-lg font-semibold">Importação concluída</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {result.imported} transações adicionadas
              {result.categorized > 0 &&
                `, ${result.categorized} já categorizadas por regras`}
              {result.duplicates > 0 &&
                `. ${result.duplicates} duplicadas foram ignoradas`}
              .
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/transactions">Ver transações</Link>
            </Button>
            <Button variant="outline" onClick={reset}>
              Importar outro arquivo
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <Field label="Conta de destino">
          <Select value={accountId} onValueChange={setAccountId}>
            <SelectTrigger className="max-w-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {step === "upload" && (
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed p-10 text-center transition-colors hover:bg-muted/40">
            <Upload className="size-8 text-muted-foreground" />
            <span className="font-medium">Escolher arquivo CSV</span>
            <span className="text-xs text-muted-foreground">
              Exporte o extrato do seu banco em CSV e selecione aqui
            </span>
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                e.target.value = "";
              }}
            />
          </label>
        )}

        {step === "map" && mapping && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileUp className="size-4" />
              {filename} · {records.length} linhas
            </div>

            <ColumnMapper
              headers={headers}
              mapping={mapping}
              onChange={setMapping}
            />

            <ImportPreview rows={rows} errors={errors} />

            <div className="flex justify-between">
              <Button variant="outline" onClick={reset}>
                Trocar arquivo
              </Button>
              <Button
                onClick={onImport}
                disabled={submitting || rows.length === 0}
              >
                {submitting
                  ? "Importando…"
                  : `Importar ${rows.length} transações`}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
