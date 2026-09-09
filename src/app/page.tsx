import type { CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

const capabilities = [
  {
    kicker: "Importação",
    title: "O extrato entra em segundos",
    body: "Suba o CSV do banco, confira o mapeamento das colunas e pronto. Transações repetidas são descartadas sozinhas.",
  },
  {
    kicker: "Classificação",
    title: "Regras que trabalham por você",
    body: "Defina uma vez — “contém IFOOD → Alimentação” — e toda importação já chega organizada.",
  },
  {
    kicker: "Leitura",
    title: "Gráficos que você entende de relance",
    body: "Receita contra despesa mês a mês, evolução do saldo e para onde o dinheiro está indo, com filtro por período.",
  },
  {
    kicker: "Disciplina",
    title: "Orçamento por categoria",
    body: "Um limite mensal, uma barra de progresso e um aviso claro quando você passa dele.",
  },
  {
    kicker: "Contas",
    title: "Tudo num lugar só",
    body: "Corrente, poupança, cartão e dinheiro — cada conta com seu saldo e seu histórico.",
  },
  {
    kicker: "Privacidade",
    title: "Seus números são só seus",
    body: "Login próprio e cada registro amarrado à sua conta. Ninguém mais enxerga.",
  },
];

const steps = [
  {
    n: "01",
    title: "Conecte suas contas",
    body: "Cadastre o que você quer acompanhar.",
  },
  {
    n: "02",
    title: "Importe o extrato",
    body: "Exporte o CSV do banco e suba aqui.",
  },
  {
    n: "03",
    title: "Leia seus gastos",
    body: "Abra o painel e veja o quadro completo.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-5">
          <Logo />
          <nav className="flex items-center gap-1">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">Criar conta</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto w-full max-w-5xl px-5 pt-20 pb-16 sm:pt-28">
          <p
            className="reveal text-[0.72rem] font-medium tracking-[0.2em] text-muted-foreground uppercase"
            style={d(0)}
          >
            Controle financeiro pessoal
          </p>
          <h1
            className="reveal mt-5 max-w-3xl font-serif text-[2.75rem] leading-[1.05] tracking-[-0.02em] text-balance sm:text-6xl"
            style={d(70)}
          >
            Saiba, sem adivinhar, para onde{" "}
            <span className="italic">vai o seu dinheiro</span>.
          </h1>
          <p
            className="reveal mt-6 max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground"
            style={d(150)}
          >
            O FinTrack importa o extrato do seu banco, classifica os gastos
            sozinho e transforma tudo num painel que se lê em dez segundos.
          </p>
          <div
            className="reveal mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center"
            style={d(230)}
          >
            <Button asChild size="lg">
              <Link href="/register">
                Começar agora <ArrowRight />
              </Link>
            </Button>
            <Link
              href="/login"
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Já tenho conta
            </Link>
          </div>

          {/* Editorial figure strip */}
          <dl
            className="reveal mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-3"
            style={d(320)}
          >
            {[
              ["10s", "para entender o mês"],
              ["1 clique", "para importar o extrato"],
              ["0", "planilha para manter"],
            ].map(([figure, caption]) => (
              <div key={caption} className="bg-card p-5">
                <dt className="font-serif text-2xl tracking-tight">{figure}</dt>
                <dd className="mt-1 text-sm text-muted-foreground">
                  {caption}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Capabilities */}
        <section className="border-t bg-secondary/40">
          <div className="mx-auto w-full max-w-5xl px-5 py-16 sm:py-20">
            <h2 className="font-serif text-2xl tracking-tight">
              O que um controle financeiro precisa ter
            </h2>
            <div className="mt-10 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {capabilities.map((c) => (
                <div
                  key={c.title}
                  className="border-t border-foreground/15 pt-4"
                >
                  <p className="text-[0.7rem] tracking-[0.16em] text-primary uppercase">
                    {c.kicker}
                  </p>
                  <h3 className="mt-2 font-serif text-lg leading-snug tracking-tight">
                    {c.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {c.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto w-full max-w-5xl px-5 py-16 sm:py-20">
          <h2 className="font-serif text-2xl tracking-tight">Como funciona</h2>
          <ol className="mt-10 grid gap-10 sm:grid-cols-3">
            {steps.map((step) => (
              <li key={step.n} className="border-t border-foreground/15 pt-4">
                <span className="font-serif text-3xl text-primary tabular-nums">
                  {step.n}
                </span>
                <h3 className="mt-2 font-serif text-lg tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* CTA */}
        <section className="border-t">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-start gap-5 px-5 py-16 sm:flex-row sm:items-center sm:justify-between sm:py-20">
            <h2 className="max-w-md font-serif text-2xl leading-snug tracking-tight">
              Pronto para ver seus números com clareza?
            </h2>
            <Button asChild size="lg">
              <Link href="/register">
                Criar conta gratuita <ArrowRight />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-2 px-5 py-6 text-sm text-muted-foreground sm:flex-row">
          <Logo className="text-muted-foreground" />
          <p>Projeto de portfólio · {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
