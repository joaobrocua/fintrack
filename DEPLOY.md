# Deploy — Vercel + Neon

Frontend/API on Vercel, Postgres on Neon. The CI workflow
(`.github/workflows/ci.yml`) must be green first.

## 1. Neon — production branch

1. Open the `fintrack` project on [neon.tech](https://neon.tech).
2. **Branches → New branch** → name it `production` (branched from `main`).
3. Open that branch → **Connection Details** and copy **both** strings:
   - **Pooled** (host ends in `-pooler…`) → this is `DATABASE_URL`
   - **Direct** (no `-pooler`) → this is `DIRECT_URL`
   - Append `&pgbouncer=true` to the pooled one.

Keep the existing `main` branch as your local/dev database.

## 2. Vercel — import the repo

1. [vercel.com/new](https://vercel.com/new) → import `joaobrocua/fintrack`.
2. Framework preset: **Next.js** (auto-detected). Leave build settings default —
   `package.json` has a `vercel-build` script that runs
   `prisma migrate deploy && prisma generate && next build`, so migrations
   are applied on every deploy.
3. **Environment Variables** (Production, and Preview if you want previews to
   work against the same DB):

   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | Neon `production` **pooled** string + `&pgbouncer=true` |
   | `DIRECT_URL` | Neon `production` **direct** string |
   | `AUTH_SECRET` | output of `npx auth secret` (or `openssl rand -base64 32`) |
   | `AUTH_TRUST_HOST` | `true` |
   | `NEXT_PUBLIC_APP_URL` | your Vercel URL, e.g. `https://fintrack.vercel.app` |

4. **Deploy.**

## 3. Seed the demo account (optional)

From your machine, pointing at the production branch:

```bash
DATABASE_URL="<neon production pooled>" \
DIRECT_URL="<neon production direct>" \
npm run db:seed
```

Demo login: `demo@fintrack.app` / `demo12345`.

## 4. After it's live

- Put the URL in `README.md` (Live demo) and the GitHub repo's About.
- New migrations ship automatically: commit `prisma/migrations/**`, push, Vercel
  runs `prisma migrate deploy` before building.

## 5. Least-privilege database role (recommended)

Neon's default connection string uses the branch **owner** role. For the app's
runtime, create a role that can only read/write the app tables — migrations keep
running as the owner via `DIRECT_URL`.

Run once against the `production` branch (Neon SQL editor, connected as owner):

```sql
CREATE ROLE fintrack_app LOGIN PASSWORD 'a-strong-random-password';
GRANT CONNECT ON DATABASE neondb TO fintrack_app;
GRANT USAGE ON SCHEMA public TO fintrack_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO fintrack_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO fintrack_app;
-- so it also covers tables added by future migrations:
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO fintrack_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO fintrack_app;
```

Then in Vercel, point **`DATABASE_URL`** (the pooled, runtime one) at
`fintrack_app`, and keep **`DIRECT_URL`** (used only by `prisma migrate deploy`)
as the owner.
