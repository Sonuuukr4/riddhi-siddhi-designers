-- ════════════════════════════════════════════════════════════════════════
-- Riddhi Siddhi Designers — CMS schema
--
-- Creates the portfolio tables, admin allow-list, row-level security,
-- the media storage bucket and two transactional admin functions.
-- Safe to run on a fresh Supabase project; it does not touch other tables.
-- ════════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ─── Admin allow-list ───────────────────────────────────────────────────
-- Only users listed here can manage content. Add the owner after creating
-- their account in Authentication → Users (see supabase/README.md).
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ─── Shared trigger: keep updated_at current ────────────────────────────
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ─── Categories ─────────────────────────────────────────────────────────
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 2 and 60),
  slug        text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text check (description is null or char_length(description) <= 300),
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists categories_touch on public.categories;
create trigger categories_touch before update on public.categories
  for each row execute function public.touch_updated_at();

-- ─── Projects ───────────────────────────────────────────────────────────
create table if not exists public.projects (
  id                uuid primary key default gen_random_uuid(),
  title             text not null check (char_length(title) between 2 and 140),
  slug              text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  -- A category cannot be deleted while projects use it (see admin_delete_category).
  category_id       uuid not null references public.categories (id) on delete restrict,
  location          text check (location is null or char_length(location) <= 140),
  year              text check (year is null or char_length(year) <= 20),
  client_name       text check (client_name is null or char_length(client_name) <= 140),
  project_status    text check (project_status is null or char_length(project_status) <= 60),
  summary           text check (summary is null or char_length(summary) <= 240),
  description       text check (description is null or char_length(description) <= 8000),
  design_approach   text check (design_approach is null or char_length(design_approach) <= 8000),
  cover_url         text,
  cover_path        text,
  cover_alt         text,
  video_url         text,
  video_path        text,
  video_poster_url  text,
  video_poster_path text,
  visibility        text not null default 'draft' check (visibility in ('draft', 'published')),
  featured          boolean not null default false,
  sort_order        integer not null default 0,
  is_placeholder    boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  published_at      timestamptz,
  -- Published projects must be presentable.
  constraint published_requires_cover check (visibility = 'draft' or cover_url is not null)
);

create index if not exists projects_category_idx on public.projects (category_id);
create index if not exists projects_public_idx on public.projects (visibility, sort_order, created_at desc);

drop trigger if exists projects_touch on public.projects;
create trigger projects_touch before update on public.projects
  for each row execute function public.touch_updated_at();

-- ─── Project media (gallery images, drawings, visualizations) ───────────
create table if not exists public.project_media (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects (id) on delete cascade,
  kind         text not null default 'image' check (kind in ('image', 'drawing', 'visualization')),
  url          text not null,
  storage_path text,
  alt          text,
  caption      text,
  width        integer,
  height       integer,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now()
);

create index if not exists project_media_project_idx on public.project_media (project_id, sort_order);

-- ─── Row-level security ─────────────────────────────────────────────────
alter table public.admins        enable row level security;
alter table public.categories    enable row level security;
alter table public.projects      enable row level security;
alter table public.project_media enable row level security;

-- admins: a signed-in user may only see their own row (used to check access).
drop policy if exists "admins read own row" on public.admins;
create policy "admins read own row" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- categories: public read, admin write.
drop policy if exists "categories public read" on public.categories;
create policy "categories public read" on public.categories
  for select to anon, authenticated using (true);
drop policy if exists "categories admin write" on public.categories;
create policy "categories admin write" on public.categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- projects: the public sees published projects only; admins see and edit everything.
drop policy if exists "projects public read" on public.projects;
create policy "projects public read" on public.projects
  for select to anon, authenticated using (visibility = 'published' or public.is_admin());
drop policy if exists "projects admin write" on public.projects;
create policy "projects admin write" on public.projects
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- media: readable when its project is readable; admin write.
drop policy if exists "media public read" on public.project_media;
create policy "media public read" on public.project_media
  for select to anon, authenticated using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and (p.visibility = 'published' or public.is_admin())
    )
  );
drop policy if exists "media admin write" on public.project_media;
create policy "media admin write" on public.project_media
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ─── Transactional admin functions ──────────────────────────────────────
-- Saves a project and replaces its media list in one transaction.
-- SECURITY INVOKER: row-level security still applies to every statement.
create or replace function public.admin_save_project(payload jsonb)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_id uuid := nullif(payload ->> 'id', '')::uuid;
  v_visibility text := coalesce(payload ->> 'visibility', 'draft');
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  if v_id is null then
    insert into public.projects (
      title, slug, category_id, location, year, client_name, project_status, summary,
      description, design_approach, cover_url, cover_path, cover_alt, video_url, video_path,
      video_poster_url, video_poster_path, visibility, featured, sort_order, is_placeholder, published_at
    ) values (
      payload ->> 'title', payload ->> 'slug', (payload ->> 'category_id')::uuid,
      payload ->> 'location', payload ->> 'year', payload ->> 'client_name', payload ->> 'project_status',
      payload ->> 'summary', payload ->> 'description', payload ->> 'design_approach',
      payload ->> 'cover_url', payload ->> 'cover_path', payload ->> 'cover_alt',
      payload ->> 'video_url', payload ->> 'video_path', payload ->> 'video_poster_url', payload ->> 'video_poster_path',
      v_visibility, coalesce((payload ->> 'featured')::boolean, false),
      coalesce((payload ->> 'sort_order')::integer, 0), coalesce((payload ->> 'is_placeholder')::boolean, false),
      case when v_visibility = 'published' then now() end
    )
    returning id into v_id;
  else
    update public.projects set
      title             = payload ->> 'title',
      slug              = payload ->> 'slug',
      category_id       = (payload ->> 'category_id')::uuid,
      location          = payload ->> 'location',
      year              = payload ->> 'year',
      client_name       = payload ->> 'client_name',
      project_status    = payload ->> 'project_status',
      summary           = payload ->> 'summary',
      description       = payload ->> 'description',
      design_approach   = payload ->> 'design_approach',
      cover_url         = payload ->> 'cover_url',
      cover_path        = payload ->> 'cover_path',
      cover_alt         = payload ->> 'cover_alt',
      video_url         = payload ->> 'video_url',
      video_path        = payload ->> 'video_path',
      video_poster_url  = payload ->> 'video_poster_url',
      video_poster_path = payload ->> 'video_poster_path',
      visibility        = v_visibility,
      featured          = coalesce((payload ->> 'featured')::boolean, false),
      sort_order        = coalesce((payload ->> 'sort_order')::integer, 0),
      is_placeholder    = coalesce((payload ->> 'is_placeholder')::boolean, false),
      published_at      = case when v_visibility = 'published' then coalesce(published_at, now()) else published_at end
    where id = v_id;
    if not found then
      raise exception 'project not found' using errcode = 'P0002';
    end if;
  end if;

  delete from public.project_media where project_id = v_id;
  insert into public.project_media (project_id, kind, url, storage_path, alt, caption, width, height, sort_order)
  select v_id,
         coalesce(m ->> 'kind', 'image'),
         m ->> 'url',
         nullif(m ->> 'storage_path', ''),
         nullif(m ->> 'alt', ''),
         nullif(m ->> 'caption', ''),
         nullif(m ->> 'width', '')::integer,
         nullif(m ->> 'height', '')::integer,
         (ord - 1)::integer
  from jsonb_array_elements(coalesce(payload -> 'media', '[]'::jsonb)) with ordinality as t(m, ord);

  return v_id;
end;
$$;

-- Deletes a category, first moving its projects to another category when needed.
create or replace function public.admin_delete_category(target uuid, reassign_to uuid default null)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  if exists (select 1 from public.projects where category_id = target) then
    if reassign_to is null or reassign_to = target
       or not exists (select 1 from public.categories where id = reassign_to) then
      raise exception 'category_in_use';
    end if;
    update public.projects set category_id = reassign_to where category_id = target;
  end if;
  delete from public.categories where id = target;
end;
$$;

revoke all on function public.admin_save_project(jsonb) from public, anon;
revoke all on function public.admin_delete_category(uuid, uuid) from public, anon;
grant execute on function public.admin_save_project(jsonb) to authenticated;
grant execute on function public.admin_delete_category(uuid, uuid) to authenticated;

-- ─── Storage: one public bucket for project media ───────────────────────
-- Files are publicly readable (they appear on the website); only admins can
-- write. Type and size limits are enforced by Storage itself.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-media', 'project-media', true, 52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4', 'video/webm', 'video/quicktime']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "project media admin insert" on storage.objects;
create policy "project media admin insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'project-media' and public.is_admin());

drop policy if exists "project media admin update" on storage.objects;
create policy "project media admin update" on storage.objects
  for update to authenticated using (bucket_id = 'project-media' and public.is_admin())
  with check (bucket_id = 'project-media' and public.is_admin());

drop policy if exists "project media admin delete" on storage.objects;
create policy "project media admin delete" on storage.objects
  for delete to authenticated using (bucket_id = 'project-media' and public.is_admin());

-- Admins may list objects (used by copy); the public reads files via public URLs.
drop policy if exists "project media admin read" on storage.objects;
create policy "project media admin read" on storage.objects
  for select to authenticated using (bucket_id = 'project-media' and public.is_admin());
