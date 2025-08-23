-- Enable extension for UUID generation
create extension if not exists pgcrypto;

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  member1 text not null default '',
  member2 text not null default '',
  sort_order integer not null,
  updated_at timestamptz not null default now()
);

-- Basic index to speed up ordering
create index if not exists teams_sort_order_idx on public.teams(sort_order);
