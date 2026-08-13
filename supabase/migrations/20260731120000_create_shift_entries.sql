-- Weekly shift entries: one row per user per day (Mon=0 … Sun=6).
-- Run in Supabase SQL Editor or via `supabase db push` when CLI is linked.

create table if not exists public.shift_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  week_start date not null,
  day_of_week smallint not null check (day_of_week >= 0 and day_of_week <= 6),
  start_time time,
  end_time time,
  break_minutes integer not null default 0 check (break_minutes >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, week_start, day_of_week)
);

create index if not exists shift_entries_user_week_idx
  on public.shift_entries (user_id, week_start);

alter table public.shift_entries enable row level security;

create policy "Users select own shift entries"
  on public.shift_entries
  for select
  using (auth.uid() = user_id);

create policy "Users insert own shift entries"
  on public.shift_entries
  for insert
  with check (auth.uid() = user_id);

create policy "Users update own shift entries"
  on public.shift_entries
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own shift entries"
  on public.shift_entries
  for delete
  using (auth.uid() = user_id);
