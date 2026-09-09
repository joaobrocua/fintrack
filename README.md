# FinTrack

[![CI](https://github.com/joaobrocua/fintrack/actions/workflows/ci.yml/badge.svg)](https://github.com/joaobrocua/fintrack/actions/workflows/ci.yml)

SaaS de finanças pessoais: importe o extrato do banco em CSV, deixe as regras
categorizarem os gastos e acompanhe tudo num dashboard com orçamentos mensais.

**Demo:** <https://fintrack-ashen-two.vercel.app> · login `demo@fintrack.app` / `demo12345`

> Projeto de portfólio full-stack. Foco em modelagem de dados, processamento de
> arquivo, regra de negócio e visualização.

## Funcionalidades

- **Autenticação** própria (Auth.js) — cada registro isolado por usuário; toda
  Server Action e Route Handler revalida a sessão e o dono do recurso.
- **Contas** (corrente, poupança, cartão, dinheiro) com saldo calculado.
- **Transações** com lista filtrável e paginada 100% via URL (período, conta,
  categoria, tipo, busca) e resumo do filtro.
- **Categorias** com ícone e cor + **motor de regras** de auto-categorização
  (`contém`, `regex`, prioridade) — puro e testado.
- **Importação de CSV**: mapeamento de colunas, detecção de duplicatas por hash,
  aplicação das regras e desfazer por lote.
- **Dashboard**: receita × despesa por mês, evolução do saldo, gastos por
  categoria, maiores despesas, patrimônio.
- **Orçamentos** mensais por categoria com barra de progresso e alerta ao
  estourar; "copiar do mês anterior".
- **Exportação**: CSV das transações (respeitando os filtros) e relatório mensal
  imprimível em PDF.

## Stack

| Camada        | Tecnologia                                             |
| ------------- | ------------------------------------------------------ |
| Framework     | Next.js 16 (App Router, Server Actions) + TypeScript   |
| UI            | Tailwind CSS v4, componentes próprios sobre Radix UI   |
| Gráficos      | Recharts (paleta validada para daltonismo/contraste)   |
| Autenticação  | Auth.js (NextAuth v5) — credenciais + bcrypt           |
| Banco         | PostgreSQL (Neon) + Prisma ORM                         |
| Validação     | Zod (compartilhada client/server)                     |
| CSV           | Papa Parse                                             |
| Testes        | Vitest + Testing Library                               |
| Deploy / CI   | Vercel + Neon · GitHub Actions                         |

## Rodando localmente

```bash
npm install
cp .env.example .env          # preencha DATABASE_URL, DIRECT_URL, AUTH_SECRET
npm run db:migrate            # aplica as migrations
npm run db:seed               # dados de demonstração (demo@fintrack.app / demo12345)
npm run dev                   # http://localhost:3000
```

## Scripts

| Script              | O que faz                              |
| ------------------- | -------------------------------------- |
| `npm run dev`       | Servidor de desenvolvimento           |
| `npm run build`     | `prisma generate` + build de produção |
| `npm run test`      | Testes unitários (Vitest)             |
| `npm run typecheck` | `tsc --noEmit`                        |
| `npm run lint`      | ESLint                                |
| `npm run format`    | Prettier                             |
| `npm run db:migrate`| Cria/aplica migration de dev          |
| `npm run db:studio` | Prisma Studio                         |
| `npm run db:seed`   | Popula a conta de demonstração        |

## Arquitetura

- **Dados sempre em centavos** (inteiro); a ponte cents ↔ decimal ↔ string vive
  só em `src/lib/money.ts`.
- **Data Access Layer** (`src/lib/dal.ts`): `requireUser()` é a checagem real de
  autenticação/dono, usada em toda página e action protegida. `src/proxy.ts` faz
  só o redirect otimista.
- **Queries** em `src/server/queries/`, **mutations** em `src/server/actions/`,
  cada uma com escopo por `userId`.
- **Lógica pura testável** isolada: `rule-engine.ts`, `csv.ts`, `money.ts`,
  `month.ts`, `csv-export.ts`.

Modelo: `User` · `FinancialAccount` · `Category` · `Transaction` ·
`CategoryRule` · `Budget` · `ImportBatch` + modelos do Auth.js.
Ver [`prisma/schema.prisma`](prisma/schema.prisma).

## Deploy

Ver [`DEPLOY.md`](DEPLOY.md) — Vercel + branch de produção no Neon; migrations
aplicadas automaticamente no build (`vercel-build`).

## Milestones

- [x] M0 — Scaffold (Next.js, Tailwind, Prisma, Neon, landing page)
- [x] M1 — Autenticação
- [x] M2 — Contas + Transações (CRUD, saldo calculado, filtros, paginação)
- [x] M3 — Categorias + Regras (motor de auto-categorização)
- [x] M4 — Importação CSV (mapeamento de colunas, dedup, auto-categoria, desfazer)
- [x] M5 — Dashboard (KPIs, fluxo mensal, evolução de saldo, gastos por categoria)
- [x] M6 — Orçamentos (limite mensal por categoria, progresso, alerta, copiar mês)
- [x] M7 — Exportação CSV + relatório mensal imprimível (PDF via print)
- [x] M8 — Seed + CI (GitHub Actions) + deploy na Vercel + Neon
- [x] M9 — Polish (loading/error boundaries, prefers-reduced-motion, skip link, OG metadata, mobile)
