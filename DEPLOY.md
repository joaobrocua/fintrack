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
