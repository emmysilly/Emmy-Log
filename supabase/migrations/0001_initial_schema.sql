-- ============================================================
-- Emmy Log — auth + per-user schema
-- Focal epilepsy documentation app
-- ============================================================
-- Reconciles with the EXISTING `episodes` table (already live,
-- anon-readable, no user_id). This migration:
--   * adds user_id + RLS to `episodes` so rows are private
--   * adds two missing episode columns (cycle_phase, first_episode)
--   * creates profiles / cycle_logs / risk_assessments / share_links
--   * auto-creates a profile row on signup
--
-- IMPORTANT: enabling RLS on `episodes` makes it invisible to the
-- plain anon key. The front-end MUST ship auth in the same change,
-- or the app can't read/write episodes anymore.
-- ============================================================

-- ---------- enums ----------
do $$ begin
  create type cycle_phase as enum ('C1', 'C2', 'C3', 'MENS');
exception when duplicate_object then null; end $$;

do $$ begin
  create type flow_level as enum ('light', 'normal', 'heavy');
exception when duplicate_object then null; end $$;

-- ============================================================
-- profiles : one row per user (cycle config + UI prefs)
-- ============================================================
create table if not exists profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  display_name      text,
  last_period_date  date,
  cycle_length      integer default 33,
  theme_mode        text    default 'dark',
  accent            text    default 'violet',
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- ============================================================
-- episodes : ALTER the existing table (keep current column names)
-- Existing cols: date,time,env,symptoms,severity,cycleday,
--                emt,witnessed,duration,postictal,notes
-- ============================================================
alter table episodes add column if not exists user_id       uuid references auth.users(id) on delete cascade;
alter table episodes add column if not exists cycle_phase   cycle_phase;
alter table episodes add column if not exists first_episode boolean default false;
alter table episodes add column if not exists created_at    timestamptz default now();

create index if not exists episodes_user_date_idx on episodes (user_id, date desc);

-- ============================================================
-- cycle_logs : period-start events
-- ============================================================
create table if not exists cycle_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  start_date  date not null,
  flow        flow_level default 'normal',
  symptoms    text,
  created_at  timestamptz default now()
);
create index if not exists cycle_logs_user_date_idx on cycle_logs (user_id, start_date desc);

-- ============================================================
-- risk_assessments : saved runs of the risk questionnaire
-- ============================================================
create table if not exists risk_assessments (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  event_description  text,
  answers            jsonb,
  total_score        integer,
  risk_level         text,
  planned_date       date,
  created_at         timestamptz default now()
);
create index if not exists risk_user_created_idx on risk_assessments (user_id, created_at desc);

-- ============================================================
-- share_links : read-only sharing (phase 2)
-- ============================================================
create table if not exists share_links (
  token       uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users(id) on delete cascade,
  label       text,
  expires_at  timestamptz,
  revoked     boolean default false,
  created_at  timestamptz default now()
);
create index if not exists share_links_owner_idx on share_links (owner_id);

-- ============================================================
-- Auto-create a profile row when a new auth user signs up
-- ============================================================
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- Row-Level Security
-- ============================================================
alter table profiles         enable row level security;
alter table episodes         enable row level security;
alter table cycle_logs       enable row level security;
alter table risk_assessments enable row level security;
alter table share_links      enable row level security;

drop policy if exists "own profile - select" on profiles;
drop policy if exists "own profile - update" on profiles;
create policy "own profile - select" on profiles for select using (auth.uid() = id);
create policy "own profile - update" on profiles for update using (auth.uid() = id);

-- Remove the legacy anon-open policies so the anon key can no longer
-- read/insert episodes once per-user isolation is in force.
drop policy if exists "Allow public read"   on episodes;
drop policy if exists "Allow public insert" on episodes;

drop policy if exists "own episodes - all" on episodes;
create policy "own episodes - all" on episodes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own cycle_logs - all" on cycle_logs;
create policy "own cycle_logs - all" on cycle_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own risk - all" on risk_assessments;
create policy "own risk - all" on risk_assessments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own share_links - all" on share_links;
create policy "own share_links - all" on share_links
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- NOTE: the single pre-existing test row in `episodes` has no user_id
-- and will be invisible under RLS. Delete it after migrating (it is empty):
--   delete from episodes where user_id is null;
