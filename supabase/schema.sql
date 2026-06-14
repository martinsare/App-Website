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
  apk_path text not null,
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

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'versions'
      and column_name = 'apk_url'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'versions'
      and column_name = 'apk_path'
  ) then
    alter table public.versions rename column apk_url to apk_path;
  end if;
end $$;

insert into storage.buckets (id, name, public)
values ('apks', 'apks', false)
on conflict (id) do update
set name = excluded.name,
    public = excluded.public;

update storage.buckets
set public = false
where id = 'apks';

alter table public.apps enable row level security;
alter table public.versions enable row level security;
alter table public.screenshots enable row level security;
alter table public.downloads enable row level security;
do $$
begin
  begin
    execute 'alter table storage.objects enable row level security';
  exception
    when insufficient_privilege then
      raise notice 'Skipping RLS enable on storage.objects because the current role does not own the table.';
  end;
end $$;

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

drop policy if exists "Authenticated can record downloads" on public.downloads;
create policy "Authenticated can record downloads"
on public.downloads
for insert
to authenticated
with check (auth.role() = 'authenticated');

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

drop policy if exists "Authenticated can upload apk objects" on storage.objects;
create policy "Authenticated can upload apk objects"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'apks');

drop policy if exists "Authenticated can read apk objects" on storage.objects;
create policy "Authenticated can read apk objects"
on storage.objects
for select
to authenticated
using (bucket_id = 'apks');

drop policy if exists "Authenticated can update apk objects" on storage.objects;
create policy "Authenticated can update apk objects"
on storage.objects
for update
to authenticated
using (bucket_id = 'apks')
with check (bucket_id = 'apks');

drop policy if exists "Authenticated can delete apk objects" on storage.objects;
create policy "Authenticated can delete apk objects"
on storage.objects
for delete
to authenticated
using (bucket_id = 'apks');
