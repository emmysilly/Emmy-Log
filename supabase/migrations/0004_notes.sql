-- ============================================================
-- Emmy Log — per-user freeform notes
-- ============================================================
create table if not exists notes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text,
  body        text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
create index if not exists notes_user_created_idx on notes (user_id, created_at desc);

alter table notes enable row level security;
drop policy if exists "own notes - all" on notes;
create policy "own notes - all" on notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
