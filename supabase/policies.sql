-- Enable Row Level Security
alter table public.teams enable row level security;

-- Public can read
create policy "Public read" on public.teams
  for select
  using ( true );

-- Public can insert
create policy "Public insert" on public.teams
  for insert
  with check ( true );

-- Public can update
create policy "Public update" on public.teams
  for update
  using ( true );

-- Public can delete
create policy "Public delete" on public.teams
  for delete
  using ( true );
