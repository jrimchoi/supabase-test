-- Run this SQL in your Supabase project
-- Schema: public

-- 프로필 테이블 생성
create table if not exists public.profiles (
	id uuid primary key references auth.users(id) on delete cascade,
	email text,
	full_name text,
	name text, -- raw_user_meta_data->>'name'
	avatar_url text,
	provider text, -- 'google', 'github', 'email'
	bio text,
	website text,
	gender text,
	phone_number text,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

-- 기존 테이블에 컬럼 추가 (이미 있는 컬럼은 에러 무시)
do $$
begin
	-- name 컬럼 추가
	if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'name') then
		alter table public.profiles add column name text;
	end if;
	-- bio 컬럼 추가
	if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'bio') then
		alter table public.profiles add column bio text;
	end if;
	-- website 컬럼 추가
	if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'website') then
		alter table public.profiles add column website text;
	end if;
	-- gender 컬럼 추가
	if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'gender') then
		alter table public.profiles add column gender text;
	end if;
	-- phone_number 컬럼 추가
	if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'phone_number') then
		alter table public.profiles add column phone_number text;
	end if;
end $$;

-- Enable RLS
alter table public.profiles enable row level security;

-- Policy: 본인 프로필만 조회
drop policy if exists "Profiles read own" on public.profiles;
create policy "Profiles read own" on public.profiles
	for select using ( auth.uid() = id );

-- Policy: 본인 프로필만 수정
drop policy if exists "Profiles update own" on public.profiles;
create policy "Profiles update own" on public.profiles
	for update using ( auth.uid() = id );

-- auth.users INSERT 시 자동으로 profiles에도 INSERT하는 트리거
create or replace function public.handle_new_user()
returns trigger as $$
begin
	insert into public.profiles (id, email, full_name, name, avatar_url, provider, bio, website, gender, phone_number)
	values (
		new.id,
		coalesce(new.email, new.raw_user_meta_data->>'email'),
		coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
		new.raw_user_meta_data->>'name',
		coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'),
		case
			when new.raw_app_meta_data->>'provider' is not null then new.raw_app_meta_data->>'provider'
			when new.email is not null then 'email'
			else 'unknown'
		end,
		null, -- bio는 raw_user_meta_data에 없음
		null, -- website는 raw_user_meta_data에 없음
		null, -- gender는 raw_user_meta_data에 없음
		null  -- phone_number는 raw_user_meta_data에 없음
	);
	return new;
end;
$$ language plpgsql security definer;

-- 트리거 등록 (이미 있으면 덮어쓰기)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
	after insert on auth.users
	for each row execute procedure public.handle_new_user();

