create table public.yearly_targets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  year integer not null,
  target_km numeric not null,
  tolerance numeric not null default 200,
  distribution_stdev numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, year)
);

alter table public.yearly_targets enable row level security;

create policy "Users can view own targets"
  on public.yearly_targets for select
  using (auth.uid() = user_id);

create policy "Users can insert own targets"
  on public.yearly_targets for insert
  with check (auth.uid() = user_id);

create policy "Users can update own targets"
  on public.yearly_targets for update
  using (auth.uid() = user_id);

create policy "Users can delete own targets"
  on public.yearly_targets for delete
  using (auth.uid() = user_id);

grant select, insert, update, delete on public.yearly_targets to authenticated;
