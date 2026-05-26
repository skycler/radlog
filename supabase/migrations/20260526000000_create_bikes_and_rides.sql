-- Bikes table
create table public.bikes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Rides table
create table public.rides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  bike_id uuid not null references public.bikes(id) on delete restrict,
  date date not null,
  distance_km numeric not null,
  elevation_gain_m numeric not null,
  personal_note text,
  material_comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index bikes_user_id_idx on public.bikes(user_id);
create index rides_user_id_idx on public.rides(user_id);
create index rides_bike_id_idx on public.rides(bike_id);
create index rides_date_idx on public.rides(date desc);

-- Enable RLS
alter table public.bikes enable row level security;
alter table public.rides enable row level security;

-- RLS policies for bikes
create policy "Users can view their own bikes"
  on public.bikes for select
  using (auth.uid() = user_id);

create policy "Users can insert their own bikes"
  on public.bikes for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own bikes"
  on public.bikes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own bikes"
  on public.bikes for delete
  using (auth.uid() = user_id);

-- RLS policies for rides
create policy "Users can view their own rides"
  on public.rides for select
  using (auth.uid() = user_id);

create policy "Users can insert their own rides"
  on public.rides for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own rides"
  on public.rides for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own rides"
  on public.rides for delete
  using (auth.uid() = user_id);

-- Updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Attach triggers
create trigger set_bikes_updated_at
  before update on public.bikes
  for each row execute function public.handle_updated_at();

create trigger set_rides_updated_at
  before update on public.rides
  for each row execute function public.handle_updated_at();
