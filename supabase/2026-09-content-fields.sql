-- Content fields for portfolio v2: real project dates, modification tracking,
-- per-post language and free-form tags.
-- Run once in the Supabase SQL editor, after add-published-column.sql.

alter table public.projects
  add column if not exists project_date date,
  add column if not exists updated_at  timestamptz not null default now(),
  add column if not exists lang        text        not null default 'en'
                                       check (lang in ('en', 'th')),
  add column if not exists tags        text[]      not null default '{}';

-- Backfill so nothing changes visibly the moment this runs: every existing
-- project keeps showing the date it was entered until you edit it.
update public.projects
   set project_date = created_at::date
 where project_date is null;

-- Keep updated_at honest at the database layer rather than trusting every
-- code path to set it.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end
$$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- Public listing order and tag filtering.
create index if not exists projects_date_idx
  on public.projects (published, project_date desc, created_at desc);

create index if not exists projects_tags_idx
  on public.projects using gin (tags);

-- Verify:
--   select title, project_date, updated_at, lang, tags from public.projects;
