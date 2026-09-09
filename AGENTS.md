<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# FinTrack — project conventions

Personal-finance SaaS. See `README.md` for the milestone map.

## Rules

- **Money is integer cents.** Never store or compute money as a float. Bridge
  cents ↔ decimal ↔ string only through `src/lib/money.ts`.
- **Every Server Action and Route Handler re-checks auth.** Get the session,
  resolve `userId`, and scope every Prisma query by it. Never trust an id from
  the client without an ownership check.
- **Validation with Zod.** Define schemas in `src/lib/validation/` and reuse
  them on both client (react-hook-form resolver) and server (action input).
- **UI primitives** live in `src/components/ui/` (hand-rolled, shadcn-style).
  Feature components go next to their route or in `src/components/`.
- **Colors** come from the CSS variables in `src/app/globals.css` via Tailwind
  tokens (`bg-primary`, `text-muted-foreground`, `chart-1`…). No raw hex in JSX.
- Prisma client: import `prisma` from `src/lib/prisma.ts` (singleton).

## Commands

`npm run dev` · `npm run build` · `npm run test` · `npm run typecheck` ·
`npm run lint` · `npm run db:migrate` · `npm run db:seed`

Run `typecheck`, `lint` and `test` before considering a milestone done.
