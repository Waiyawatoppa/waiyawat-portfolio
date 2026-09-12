# Waiyawat Portfolio

Personal portfolio and case-study site for Waiyawat Aphiraktanon. Public pages are
statically generated; content is managed through a small admin dashboard backed
by Supabase.

## Stack

- **Next.js 16** (App Router, Server Actions, ISR) on Vercel
- **Supabase** — Postgres for content, Storage for images
- **NextAuth v5** — Google sign-in, restricted to one admin account
- **Tailwind CSS v4** · **react-markdown** for case-study bodies
- **Vitest** for tests · GitHub Actions for CI

## Local setup

```bash
npm ci
cp .env.example .env.local   # then fill in the values below
npm run dev
```

## Environment variables

| Variable | Where it is used | Public? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | All reads; image allowlist; CSP | yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Read-only client | yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin writes in Server Actions only | **no** — never prefix with `NEXT_PUBLIC_` |
| `AUTH_SECRET` | NextAuth session signing (`npx auth secret`) | no |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth | no |
| `ADMIN_EMAIL` | The one Google account allowed into `/admin` | no |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for metadata, sitemap, OG, RSS | yes |

Set every variable in Vercel for **both** Production and Preview so preview
deployments are testable.

## Database setup — run these in order

Open Supabase → SQL Editor and run each file once:

1. [`supabase/rls-policies.sql`](supabase/rls-policies.sql) — enables RLS, allows anonymous **read** only, adds the slug unique index
2. [`supabase/timeline-table.sql`](supabase/timeline-table.sql) — `timeline_entries` for the Journey section
3. [`supabase/add-published-column.sql`](supabase/add-published-column.sql) — draft/published state
4. [`supabase/2026-09-content-fields.sql`](supabase/2026-09-content-fields.sql) — project date, `updated_at`, language, tags

Each script is idempotent and backfills existing rows, so nothing visible
changes when it runs.

## Security model

- The anon key ships in the browser and is treated as public. RLS grants it
  `SELECT` only.
- Every write goes through a Server Action in
  [`src/app/admin/actions.ts`](src/app/admin/actions.ts). Each action calls
  `requireAdmin()` first (Server Actions are reachable by direct POST, not only
  from the UI), then uses the service-role client, which never leaves the
  server (`import "server-only"`).
- Inputs are validated with zod. Outbound links are restricted to `http(s)`.
  Uploads are checked for MIME type and size on the server; SVG is refused.
- Markdown is rendered to a React tree — raw HTML in a post is shown as text,
  never executed.
- Security headers (CSP, `frame-ancestors 'none'`, HSTS, etc.) are set in
  [`next.config.ts`](next.config.ts).

## Writing a post

1. Sign in at `/admin/login` with the admin Google account.
2. **Add New Project** — the slug follows the title until you edit it. Set the
   **Project Date** to when the work happened; it drives ordering and the date
   readers see.
3. The editor is Markdown with a toolbar (bold, headings, lists, quote, code,
   link, image, divider). `Ctrl/⌘+B`, `+I`, `+K` work. **Preview** shows the
   exact public rendering. Drafts autosave to the browser; a restore banner
   appears if you come back to unsaved work.
4. Untick **Published** to keep a draft. Drafts are hidden from the site,
   sitemap and search engines, and their URLs return 404.
5. **Manage Journey** — timeline entries; higher *sort order* appears first.
6. **Manage About Slider** — photos beside the About section.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest — includes a Reader Mode test that runs Mozilla's Readability over a rendered project page |

CI runs all four on every push and pull request.

## Deploying

Pushing to `main` deploys to production on Vercel; other branches get a preview
URL. Make sure any new SQL migration has been run **before** merging code that
depends on it.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Homepage shows "No projects published yet." | A migration was not run — the query references a column that does not exist. Check Vercel function logs for `42703`. |
| Admin says "Missing … SUPABASE_SERVICE_ROLE_KEY" | The service-role key is not set in the deploy environment. |
| Sign-in fails in production but works locally | `AUTH_SECRET` is unset (dev generates one; production does not). |
| Shared links show a plain card, no image | `NEXT_PUBLIC_SITE_URL` is unset, so OG URLs point at localhost. |
| Cover images do not load | `NEXT_PUBLIC_SUPABASE_URL` differs from the project the images live on; the host allowlist is derived from it. |

## Project layout

```
src/
  app/
    page.tsx                  homepage (static, revalidates hourly)
    project/[slug]/           full project page + per-project OG image
    @modal/(.)project/[slug]/ same content as an in-place dialog
    admin/                    dashboard, editor, Server Actions
    _components/              shared UI (nav, footer, markdown, reading pane)
  lib/                        data access, validation helpers, site config
supabase/                     SQL to run in the Supabase SQL editor
```

Site identity (name, email, social links, CV path) lives in
[`src/lib/site.ts`](src/lib/site.ts).
