-- Draft / Published state for projects.
-- Run once in the Supabase SQL editor, after rls-policies.sql.

alter table public.projects
  add column if not exists published boolean not null default true;

-- Existing rows default to published so nothing disappears from the live site
-- the moment this runs.

create index if not exists projects_published_idx
  on public.projects (published, created_at desc);

-- RLS note: the "public read" policy already allows anon SELECT on this table.
-- Drafts are filtered in the application layer (src/lib/projects.ts), which is
-- enough here because a draft case study is unfinished writing, not a secret.
--
-- If you would rather have the database enforce it, replace the policy with:
--
--   drop policy if exists "public read" on public.projects;
--   create policy "public read published"
--     on public.projects for select to anon
--     using (published = true);
--
-- The admin dashboard reads with the anon key too, so doing that also requires
-- switching src/app/admin/page.tsx to the service-role client.
