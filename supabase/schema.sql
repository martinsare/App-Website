create extension if not exists "pgcrypto";

create table if not exists public.apps (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  short_description text not null,
  full_description text not null,
  icon_url text,
  featured boolean not null default false,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.versions (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.apps(id) on delete cascade,
  version_number text not null,
  apk_url text not null,
  file_size text,
  changelog text,
  release_date timestamptz not null default now(),
  is_latest boolean not null default false,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.screenshots (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.apps(id) on delete cascade,
  image_url text not null,
  sort_order integer not null default 0
);

create table if not exists public.downloads (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.apps(id) on delete cascade,
  version_id uuid not null references public.versions(id) on delete cascade,
  downloaded_at timestamptz not null default now(),
  user_agent text,
  user_ip text
);

alter table public.apps enable row level security;
alter table public.versions enable row level security;
alter table public.screenshots enable row level security;
alter table public.downloads enable row level security;

drop policy if exists "Public can read published apps" on public.apps;
create policy "Public can read published apps"
on public.apps
for select
using (is_published or auth.role() = 'authenticated');

drop policy if exists "Authenticated can manage apps" on public.apps;
create policy "Authenticated can manage apps"
on public.apps
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

drop policy if exists "Public can read versions" on public.versions;
create policy "Public can read versions"
on public.versions
for select
using (is_published or auth.role() = 'authenticated');

drop policy if exists "Authenticated can manage versions" on public.versions;
create policy "Authenticated can manage versions"
on public.versions
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

drop policy if exists "Public can read screenshots" on public.screenshots;
create policy "Public can read screenshots"
on public.screenshots
for select
using (auth.role() = 'anon' or auth.role() = 'authenticated');

drop policy if exists "Authenticated can manage screenshots" on public.screenshots;
create policy "Authenticated can manage screenshots"
on public.screenshots
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

drop policy if exists "Anyone can record downloads" on public.downloads;
create policy "Anyone can record downloads"
on public.downloads
for insert
with check (true);

drop policy if exists "Authenticated can read downloads" on public.downloads;
create policy "Authenticated can read downloads"
on public.downloads
for select
using (auth.role() = 'authenticated');

drop policy if exists "Authenticated can manage downloads" on public.downloads;
create policy "Authenticated can manage downloads"
on public.downloads
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');
