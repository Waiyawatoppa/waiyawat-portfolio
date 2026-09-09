-- Row Level Security for waiyawat-portfolio.
-- Run this once in the Supabase SQL editor.
--
-- Context: the anon key ships inside the browser bundle by design, so it must
-- be treated as public. Before this change the admin UI wrote to these tables
-- directly from the client, which required granting the `anon` role write
-- access -- meaning anyone could insert, update or delete rows with a plain
-- HTTP request.
--
-- All writes now go through Server Actions in src/app/admin/actions.ts, which
-- authenticate with NextAuth and then use the service-role key. service_role
-- bypasses RLS, so the policies below only need to describe public READ access.

-- ---------------------------------------------------------------- projects --

alter table public.projects enable row level security;

-- Drop any pre-existing permissive policies before recreating.
drop policy if exists "public read" on public.projects;
drop policy if exists "anon insert" on public.projects;
drop policy if exists "anon update" on public.projects;
drop policy if exists "anon delete" on public.projects;
drop policy if exists "Enable insert for all users" on public.projects;
drop policy if exists "Enable update for all users" on public.projects;
drop policy if exists "Enable delete for all users" on public.projects;
drop policy if exists "Enable read access for all users" on public.projects;

create policy "public read"
  on public.projects
  for select
  to anon, authenticated
  using (true);

-- Deliberately no insert/update/delete policies: with RLS enabled and no
-- matching policy, those operations are denied for anon and authenticated.

-- ----------------------------------------------------------- about_slides --

alter table public.about_slides enable row level security;

drop policy if exists "public read" on public.about_slides;
drop policy if exists "anon insert" on public.about_slides;
drop policy if exists "anon update" on public.about_slides;
drop policy if exists "anon delete" on public.about_slides;
drop policy if exists "Enable insert for all users" on public.about_slides;
drop policy if exists "Enable update for all users" on public.about_slides;
drop policy if exists "Enable delete for all users" on public.about_slides;
drop policy if exists "Enable read access for all users" on public.about_slides;

create policy "public read"
  on public.about_slides
  for select
  to anon, authenticated
  using (true);

-- ------------------------------------------------------------- uniqueness --

-- The project slug is the public URL segment, so duplicates would make one of
-- the two projects unreachable. The create/update actions surface violations
-- of this constraint (SQLSTATE 23505) as a readable message.
create unique index if not exists projects_slug_key
  on public.projects (slug);

-- ---------------------------------------------------------------- storage --

-- Storage objects are governed by policies on storage.objects. Public read is
-- kept so next/image can fetch covers; uploads and deletes go through the
-- service-role client only.

drop policy if exists "public read project images" on storage.objects;
drop policy if exists "public read about images" on storage.objects;
drop policy if exists "anon upload project images" on storage.objects;
drop policy if exists "anon upload about images" on storage.objects;
drop policy if exists "anon delete project images" on storage.objects;
drop policy if exists "anon delete about images" on storage.objects;

create policy "public read project images"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'project-images');

create policy "public read about images"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'about-images');

-- ---------------------------------------------------------------- verify ---

-- After running the above, confirm no write policies remain:
--
--   select schemaname, tablename, policyname, roles, cmd
--   from pg_policies
--   where tablename in ('projects', 'about_slides')
--      or (schemaname = 'storage' and tablename = 'objects')
--   order by tablename, cmd;
--
-- Every returned row should have cmd = 'SELECT'.
