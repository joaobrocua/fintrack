import {
  ArrowRight,
  FileSpreadsheet,
  PieChart,
  ShieldCheck,
  Sparkles,
  Target,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: FileSpreadsheet,
    title: "Importação de CSV",
    description:
      "Suba o extrato do banco. O mapeamento de colunas é flexível e transações duplicadas são ignoradas automaticamente.",
  },
  {
    icon: Sparkles,
    title: "Categorização automática",
    description:
      'Crie regras ("contém IFOOD → Alimentação") e cada importação já chega classificada.',
  },
  {
    icon: PieChart,
    title: "Dashboard de verdade",
    description:
      "Gastos por categoria, receita x despesa por mês e evolução do saldo — com filtro por período e conta.",
  },
  {
    icon: Target,
    title: "Orçamentos mensais",
    description:
      "Defina um limite por categoria e acompanhe o quanto já foi consumido, com alerta ao estourar.",
  },
  {
    icon: Wallet,
    title: "Múltiplas contas",
    description:
      "Conta corrente, poupança, cartão e dinheiro — cada uma com seu saldo e histórico.",
  },
  {
    icon: ShieldCheck,
    title: "Seus dados isolados",
    description:
      "Autenticação própria e cada registro amarrado ao seu usuário. Ninguém mais enxerga.",
  },
];

const steps = [
  {
    n: "01",
    title: "Conecte suas contas",
    description: "Cadastre as contas e carteiras que você quer acompanhar.",
  },
  {
    n: "02",
    title: "Importe o extrato",
    description:
      "Exporte o CSV do seu banco e suba aqui — o resto é automático.",
  },
  {
    n: "03",
    title: "Entenda seus gastos",
    description: "Abra o dashboard e veja para onde o dinheiro está indo.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <Logo />
          <nav className="flex items-center gap-2">
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
        <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" />
              Feito para quem quer parar de adivinhar
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Saiba para onde vai o seu dinheiro
            </h1>
            <p className="mt-4 text-lg text-pretty text-muted-foreground">
              O FinTrack importa o extrato do seu banco, categoriza os gastos
              sozinho e transforma tudo em gráficos que você entende em 10
              segundos.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/register">
                  Começar agora <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">Já tenho conta</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-muted/30">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20">
            <h2 className="text-2xl font-semibold tracking-tight">
              Tudo que um controle financeiro precisa ter
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, description }) => (
                <Card key={title}>
                  <CardContent className="p-6">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="mt-4 font-medium">{title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20">
          <h2 className="text-2xl font-semibold tracking-tight">
            Como funciona
          </h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            {steps.map((step) => (
              <div key={step.n}>
                <span className="font-mono text-sm text-primary">{step.n}</span>
                <h3 className="mt-2 font-medium">{step.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 text-center sm:py-20">
            <h2 className="text-2xl font-semibold tracking-tight">
              Pronto para ver seus números com clareza?
            </h2>
            <Button asChild size="lg" className="mt-6">
              <Link href="/register">
                Criar conta gratuita <ArrowRight />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row">
          <Logo className="text-muted-foreground" />
          <p>Projeto de portfólio · {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
