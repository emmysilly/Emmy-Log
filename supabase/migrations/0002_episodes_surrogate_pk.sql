-- ============================================================
-- Emmy Log — episodes surrogate primary key
-- ============================================================
-- Replaces the `date` primary key with a surrogate `id` uuid.
-- `date` as PK wrongly forced one episode per calendar date;
-- multiple seizures can occur on the same day. After this, `date`
-- is a required-but-not-unique column and `id` identifies rows.
-- ============================================================

alter table episodes add column if not exists id uuid default gen_random_uuid();

-- ensure any existing rows get an id before making it the PK
update episodes set id = gen_random_uuid() where id is null;

-- drop old PK on date, promote id to PK
alter table episodes drop constraint episodes_pkey;
alter table episodes add primary key (id);

-- date still required on every episode, just no longer unique
alter table episodes alter column date set not null;
