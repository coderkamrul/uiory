-- =====================================================================
-- uiory — Supabase schema v2
-- Run this ONCE in your Supabase project: SQL Editor -> New query ->
-- paste everything -> Run.
--
-- It creates:
--   1. public.components  — the gallery (public read, ADMIN-only write)
--   2. public.profiles    — one row per signed-up user (role admin/user)
--      The FIRST user who signs up automatically becomes the admin;
--      everyone after that is a normal user. A trigger on auth.users
--      creates the profile, so there is nothing else to configure.
--   3. Storage bucket "component-media" (public) for preview uploads
--      (images / GIFs / videos). Only admins can upload or delete.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Components
-- ---------------------------------------------------------------------
create table if not exists public.components (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  title      text not null,
  category   text not null default 'Hero',
  type       text not null default 'single' check (type in ('single', 'compare')),
  description text not null default '',
  tags       text[] not null default '{}',
  tech       text[] not null default '{}',
  prompt     text not null,
  code       text,
  author     text not null default 'Studio',
  hue        int  not null default 222,
  pattern    text not null default 'card',
  image_url  text,
  media_url  text,
  media_type text check (media_type in ('image', 'video')),
  variants   jsonb,
  copies     int  not null default 0,
  featured   boolean not null default false,
  created_at timestamptz not null default now()
);
-- safe upgrades if the table already existed from schema v1
alter table public.components add column if not exists code text;
alter table public.components add column if not exists image_url text;
alter table public.components add column if not exists media_url text;
alter table public.components add column if not exists media_type text;

alter table public.components enable row level security;

-- ---------------------------------------------------------------------
-- 2. Profiles + roles
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  name       text not null default '',
  role       text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- helper: is the current signed-in user an admin?
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- profiles: you can read your own profile; admins can read all
drop policy if exists "profiles: read own, admins read all" on public.profiles;
create policy "profiles: read own, admins read all"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

-- profiles: you can update your own row (role is protected below)
drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- nobody can promote themselves: role only changes by an existing admin
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role <> old.role and not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end;
$$;
drop trigger if exists profiles_protect_role on public.profiles;
create trigger profiles_protect_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();

-- FIRST signup becomes admin; every later signup is a normal user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  make_admin boolean;
begin
  select not exists (
    select 1 from public.profiles where role = 'admin'
  ) into make_admin;

  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'name', ''),
      split_part(new.email, '@', 1)
    ),
    case when make_admin then 'admin' else 'user' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- 3. Component write policies (admins only; reads are public)
-- ---------------------------------------------------------------------
drop policy if exists "components are public to read" on public.components;
create policy "components are public to read"
  on public.components for select
  using (true);

drop policy if exists "components: admins insert" on public.components;
create policy "components: admins insert"
  on public.components for insert
  with check (public.is_admin());

drop policy if exists "components: admins update" on public.components;
create policy "components: admins update"
  on public.components for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "components: admins delete" on public.components;
create policy "components: admins delete"
  on public.components for delete
  using (public.is_admin());

-- ---------------------------------------------------------------------
-- 4. Storage: public bucket for preview media, admin-only uploads
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('component-media', 'component-media', true)
on conflict (id) do update set public = true;

drop policy if exists "media: public read" on storage.objects;
create policy "media: public read"
  on storage.objects for select
  using (bucket_id = 'component-media');

drop policy if exists "media: admins upload" on storage.objects;
create policy "media: admins upload"
  on storage.objects for insert
  with check (bucket_id = 'component-media' and public.is_admin());

drop policy if exists "media: admins update" on storage.objects;
create policy "media: admins update"
  on storage.objects for update
  using (bucket_id = 'component-media' and public.is_admin())
  with check (bucket_id = 'component-media' and public.is_admin());

drop policy if exists "media: admins delete" on storage.objects;
create policy "media: admins delete"
  on storage.objects for delete
  using (bucket_id = 'component-media' and public.is_admin());

-- ---------------------------------------------------------------------
-- 5. Categories — dynamic list for the form + homepage filter pills.
--    Public read; admins create/edit. Saving a component with a new
--    category name creates the category automatically (app-side).
-- ---------------------------------------------------------------------
create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  created_at timestamptz not null default now()
);
alter table public.categories enable row level security;

drop policy if exists "categories: public read" on public.categories;
create policy "categories: public read"
  on public.categories for select
  using (true);

drop policy if exists "categories: admins insert" on public.categories;
create policy "categories: admins insert"
  on public.categories for insert
  with check (public.is_admin());

drop policy if exists "categories: admins update" on public.categories;
create policy "categories: admins update"
  on public.categories for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "categories: admins delete" on public.categories;
create policy "categories: admins delete"
  on public.categories for delete
  using (public.is_admin());

insert into public.categories (name) values
  ('Hero'), ('Button'), ('Card'), ('Pricing'), ('Navbar'),
  ('Form'), ('Footer'), ('Dashboard'), ('Animation')
on conflict (name) do nothing;

-- ---------------------------------------------------------------------
-- 6. Likes — one like per signed-in user per component
-- ---------------------------------------------------------------------
create table if not exists public.component_likes (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  component_slug text not null,
  created_at     timestamptz not null default now(),
  constraint unique_user_component_like unique (user_id, component_slug)
);
alter table public.component_likes enable row level security;

drop policy if exists "likes: read own" on public.component_likes;
create policy "likes: read own" on public.component_likes
  for select using (auth.uid() = user_id);

drop policy if exists "likes: insert own" on public.component_likes;
create policy "likes: insert own" on public.component_likes
  for insert with check (auth.uid() = user_id);

drop policy if exists "likes: delete own" on public.component_likes;
create policy "likes: delete own" on public.component_likes
  for delete using (auth.uid() = user_id);

create or replace function public.toggle_component_like(target_slug text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  curr_uid uuid := auth.uid();
  already_liked boolean;
  new_count int;
begin
  if curr_uid is null then
    raise exception 'Not authenticated';
  end if;

  select exists(
    select 1 from public.component_likes
    where user_id = curr_uid and component_slug = target_slug
  ) into already_liked;

  if already_liked then
    delete from public.component_likes
    where user_id = curr_uid and component_slug = target_slug;

    update public.components
    set copies = greatest(0, copies - 1)
    where slug = target_slug
    returning copies into new_count;

    return jsonb_build_object('liked', false, 'likes', coalesce(new_count, 0));
  else
    insert into public.component_likes (user_id, component_slug)
    values (curr_uid, target_slug)
    on conflict (user_id, component_slug) do nothing;

    update public.components
    set copies = copies + 1
    where slug = target_slug
    returning copies into new_count;

    return jsonb_build_object('liked', true, 'likes', coalesce(new_count, 1));
  end if;
end;
$$;

grant execute on function public.toggle_component_like(text) to authenticated;

-- Done. Now sign up in the app — the first account becomes the admin.
