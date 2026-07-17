-- ============================================================
-- Emmy Log — per-user personalized content store
-- ============================================================
-- Holds all personalized analysis content (env risks, cycle-window
-- advice, brain-region cards, risk descriptions, spread pathway,
-- protective measures, research) as a single JSONB document per user,
-- so none of it needs to ship in the public client source. The client
-- loads app_content.doc after auth and renders every section from it.
-- ============================================================

create table if not exists app_content (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  doc         jsonb not null default '{}'::jsonb,
  updated_at  timestamptz default now()
);

alter table app_content enable row level security;

drop policy if exists "own content - all" on app_content;
create policy "own content - all" on app_content
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
