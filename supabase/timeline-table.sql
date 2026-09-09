-- Journey / timeline entries for the homepage.
-- Run once in the Supabase SQL editor, after rls-policies.sql.

create table if not exists public.timeline_entries (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  title        text        not null,
  organization text        not null,
  description  text,
  -- Stored as text (e.g. "2023", "Mar 2024") so entries can be as precise or
  -- vague as the real world allows. sort_order drives display order.
  period       text        not null,
  kind         text        not null default 'experience'
                 check (kind in ('education', 'experience', 'award')),
  sort_order   integer     not null default 0
);

-- Newest first by default.
create index if not exists timeline_entries_sort_idx
  on public.timeline_entries (sort_order desc, created_at desc);

alter table public.timeline_entries enable row level security;

drop policy if exists "public read" on public.timeline_entries;

create policy "public read"
  on public.timeline_entries
  for select
  to anon, authenticated
  using (true);

-- No write policies: inserts, updates and deletes go through the service-role
-- client in src/app/admin/actions.ts, which authenticates first.
