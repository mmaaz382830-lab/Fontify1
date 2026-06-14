-- Saved font pairings for the Font Pairing Engine.
-- Run this in the Supabase SQL Editor (or via the CLI).

create table if not exists public.saved_pairings (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  tag          text not null,
  heading_font text not null,
  body_font    text not null,
  created_at   timestamptz not null default now()
);

-- Helpful index for "my pairings, newest first".
create index if not exists saved_pairings_user_created_idx
  on public.saved_pairings (user_id, created_at desc);

-- Row Level Security: users may only see/manage their own rows.
alter table public.saved_pairings enable row level security;

drop policy if exists "Users can view their own pairings" on public.saved_pairings;
create policy "Users can view their own pairings"
  on public.saved_pairings for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own pairings" on public.saved_pairings;
create policy "Users can insert their own pairings"
  on public.saved_pairings for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own pairings" on public.saved_pairings;
create policy "Users can delete their own pairings"
  on public.saved_pairings for delete
  using (auth.uid() = user_id);
