-- Saved type-scale presets for the Fluid Type Scale Calculator.
-- Run this in the Supabase SQL Editor (or via the CLI).

create table if not exists public.scale_presets (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null,
  base       numeric not null,
  ratio      numeric not null,
  min_vw     integer not null,
  max_vw     integer not null,
  created_at timestamptz not null default now()
);

create index if not exists scale_presets_user_created_idx
  on public.scale_presets (user_id, created_at desc);

alter table public.scale_presets enable row level security;

drop policy if exists "Users can view their own presets" on public.scale_presets;
create policy "Users can view their own presets"
  on public.scale_presets for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own presets" on public.scale_presets;
create policy "Users can insert their own presets"
  on public.scale_presets for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own presets" on public.scale_presets;
create policy "Users can delete their own presets"
  on public.scale_presets for delete
  using (auth.uid() = user_id);
