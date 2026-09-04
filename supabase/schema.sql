-- Run this in the Supabase SQL Editor (Project > SQL Editor > New query) once
-- per project. Field values live in a flexible `data` JSONB column so adding
-- or renaming fields in src/config/fields.ts never requires a migration.

create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists stores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists visits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  raw_note text not null default '',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contacts_user_id_idx on contacts (user_id);
create index if not exists stores_user_id_idx on stores (user_id);
create index if not exists visits_user_id_idx on visits (user_id);

alter table contacts enable row level security;
alter table stores enable row level security;
alter table visits enable row level security;

drop policy if exists "Users manage own contacts" on contacts;
create policy "Users manage own contacts" on contacts
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage own stores" on stores;
create policy "Users manage own stores" on stores
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage own visits" on visits;
create policy "Users manage own visits" on visits
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
