# FinTrack

SaaS de finanças pessoais: importe o extrato do banco em CSV, categorize os
gastos automaticamente por regras e acompanhe tudo num dashboard com
orçamentos mensais.

> Projeto de portfólio full-stack. Foco em modelagem de dados, processamento de
> arquivo, regra de negócio e visualização.

## Stack

| Camada        | Tecnologia                                             |
| ------------- | ------------------------------------------------------ |
| Framework     | Next.js 16 (App Router, Server Actions) + TypeScript   |
| UI            | Tailwind CSS v4, componentes próprios sobre Radix UI   |
| Gráficos      | Recharts                                               |
| Autenticação  | Auth.js (NextAuth v5) — credenciais, OAuth depois      |
| Banco         | PostgreSQL (Neon) + Prisma ORM                         |
| Validação     | Zod (compartilhada client/server)                      |
| CSV           | Papa Parse                                             |
| Testes        | Vitest + Testing Library                               |
| Deploy / CI   | Vercel + Neon · GitHub Actions                         |

## Rodando localmente

```bash
# 1. Dependências
npm install

# 2. Variáveis de ambiente
cp .env.example .env   # e preencha DATABASE_URL, DIRECT_URL, AUTH_SECRET

# 3. Banco
npm run db:migrate     # aplica as migrations
npm run db:seed        # (opcional) dados de demonstração

# 4. Dev
npm run dev            # http://localhost:3000
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
| `npm run db:seed`   | Popula dados de demonstração          |

## Modelo de dados

`User` · `FinancialAccount` · `Category` · `Transaction` · `CategoryRule` ·
`Budget` · `ImportBatch` — mais os modelos do Auth.js (`Account`, `Session`,
`VerificationToken`). Valores monetários são sempre inteiros em centavos.
Ver [`prisma/schema.prisma`](prisma/schema.prisma).

## Status

Em construção — ver os milestones no histórico do projeto.

- [x] M0 — Scaffold (Next.js, Tailwind, Prisma, Neon, landing page)
- [x] M1 — Autenticação
- [x] M2 — Contas + Transações (CRUD, saldo calculado, filtros, paginação)
- [x] M3 — Categorias + Regras (motor de auto-categorização)
- [x] M4 — Importação CSV (mapeamento de colunas, dedup, auto-categoria, desfazer)
- [x] M5 — Dashboard (KPIs, fluxo mensal, evolução de saldo, gastos por categoria)
- [x] M6 — Orçamentos (limite mensal por categoria, progresso, alerta, copiar mês)
- [x] M7 — Exportação CSV + relatório mensal imprimível (PDF via print)
- [ ] M8 — Testes, CI, deploy
- [ ] M9 — Polish
