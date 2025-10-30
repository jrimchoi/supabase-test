-- Run this SQL in your Supabase project
-- Schema: public

create table if not exists public.notes (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references auth.users(id) on delete cascade,
	content text not null,
	created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.notes enable row level security;

-- Policy: owners can read their notes
create policy if not exists "Notes read own" on public.notes
	for select using ( auth.uid() = user_id );

-- Policy: owners can insert
create policy if not exists "Notes insert own" on public.notes
	for insert with check ( auth.uid() = user_id );

-- Policy: owners can update
create policy if not exists "Notes update own" on public.notes
	for update using ( auth.uid() = user_id );

-- Policy: owners can delete
create policy if not exists "Notes delete own" on public.notes
	for delete using ( auth.uid() = user_id );
