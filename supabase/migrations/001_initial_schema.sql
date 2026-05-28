-- =============================================================================
-- 001_initial_schema.sql
-- Initial schema migration for Ngati Pakahi O Manga Iti
-- Idempotent: safe to re-run (all objects dropped before recreation)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Drop existing objects (reverse dependency order)
-- ---------------------------------------------------------------------------

drop trigger if exists after_whakapapa_insert on public.whakapapa;
drop trigger if exists on_auth_user_created on auth.users;

drop function if exists public.link_orphan_children();
drop function if exists public.handle_new_user();

drop table if exists public.whakapapa cascade;
drop table if exists public.bookings cascade;
drop table if exists public.announcements cascade;
drop table if exists public.profiles cascade;

-- ---------------------------------------------------------------------------
-- 2. Create tables
-- ---------------------------------------------------------------------------

-- profiles (must exist before whakapapa references auth.users indirectly)
create table public.profiles (
  id          uuid        primary key references auth.users(id) on delete cascade,
  is_trustee  boolean     not null default false,
  created_at  timestamptz not null default now()
);

-- whakapapa (self-referencing; parent_id added after table creation to allow
-- the self-reference without a forward-reference problem)
create table public.whakapapa (
  id           bigint      generated always as identity primary key,
  name         text        not null,
  email        text,
  birth_year   integer,
  death_year   integer,
  parent_id    bigint      references public.whakapapa(id) on delete set null,
  parent_name  text,
  auth_user_id uuid        references auth.users(id) on delete set null,
  created_at   timestamptz not null default now()
);

-- bookings
create table public.bookings (
  id          bigint      generated always as identity primary key,
  venue       text        not null check (venue in ('hall', 'meetinghouse')),
  start_date  date        not null,
  end_date    date        not null,
  event_name  text        not null,
  booked_by   text        not null,
  contact     text,
  created_at  timestamptz not null default now()
);

-- announcements
create table public.announcements (
  id          bigint      generated always as identity primary key,
  date        date        not null default current_date,
  title       text        not null,
  body        text        not null,
  tag         text        not null check (tag in ('info', 'event', 'urgent')),
  posted_by   text        not null,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3. Enable Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles      enable row level security;
alter table public.whakapapa     enable row level security;
alter table public.bookings      enable row level security;
alter table public.announcements enable row level security;

-- ---------------------------------------------------------------------------
-- 4. RLS Policies — profiles
-- ---------------------------------------------------------------------------

-- Authenticated users can read their own profile row
create policy "profiles: select own"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

-- Authenticated users can insert their own profile row
create policy "profiles: insert own"
  on public.profiles
  for insert
  to authenticated
  with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- 5. RLS Policies — whakapapa
-- ---------------------------------------------------------------------------

-- Any authenticated user can read all whakapapa rows
create policy "whakapapa: select all"
  on public.whakapapa
  for select
  to authenticated
  using (true);

-- Any authenticated user can insert (registration flow)
create policy "whakapapa: insert"
  on public.whakapapa
  for insert
  to authenticated
  with check (true);

-- Authenticated user can update:
--   • their own row (auth_user_id = auth.uid())
--   • their parent's row (this row's id = the caller's parent_id)
--   • their child's row (this row's parent_id = the caller's id)
--   • a sibling's row (same non-null parent_id as the caller)
create policy "whakapapa: update self/parent/child/sibling"
  on public.whakapapa
  for update
  to authenticated
  using (
    -- self
    auth_user_id = auth.uid()
    -- parent: this row is the parent of the authenticated user's row
    or id = (
      select parent_id
      from public.whakapapa
      where auth_user_id = auth.uid()
      limit 1
    )
    -- child: this row's parent_id points to the authenticated user's row
    or parent_id = (
      select id
      from public.whakapapa
      where auth_user_id = auth.uid()
      limit 1
    )
    -- sibling: same non-null parent_id as the authenticated user's row
    or (
      parent_id is not null
      and parent_id = (
        select parent_id
        from public.whakapapa
        where auth_user_id = auth.uid()
        limit 1
      )
    )
  );

-- ---------------------------------------------------------------------------
-- 6. RLS Policies — bookings
-- ---------------------------------------------------------------------------

-- Any authenticated user can read all bookings
create policy "bookings: select all"
  on public.bookings
  for select
  to authenticated
  using (true);

-- Any authenticated user can insert a booking
create policy "bookings: insert"
  on public.bookings
  for insert
  to authenticated
  with check (true);

-- Any authenticated user can delete a booking (POC simplification)
create policy "bookings: delete"
  on public.bookings
  for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- 7. RLS Policies — announcements
-- ---------------------------------------------------------------------------

-- Any authenticated user can read all announcements
create policy "announcements: select all"
  on public.announcements
  for select
  to authenticated
  using (true);

-- Only trustees can insert announcements
create policy "announcements: insert trustees only"
  on public.announcements
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and is_trustee = true
    )
  );

-- ---------------------------------------------------------------------------
-- 8. Trigger functions
-- ---------------------------------------------------------------------------

-- Auto-link orphan children: when a new whakapapa row is inserted, find any
-- existing rows that recorded this person's name as their parent_name but
-- have no parent_id yet, and link them.
create or replace function public.link_orphan_children()
returns trigger
language plpgsql
security definer
as $$
begin
  update public.whakapapa
  set parent_id = NEW.id
  where parent_id is null
    and lower(parent_name) = lower(NEW.name);
  return NEW;
end;
$$;

-- Auto-create profile: whenever a new auth user is created, insert a
-- corresponding profiles row with default (non-trustee) settings.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id)
  values (NEW.id);
  return NEW;
end;
$$;

-- ---------------------------------------------------------------------------
-- 9. Triggers
-- ---------------------------------------------------------------------------

create trigger after_whakapapa_insert
  after insert on public.whakapapa
  for each row
  execute function public.link_orphan_children();

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
