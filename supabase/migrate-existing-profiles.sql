-- auth.users에 있는 모든 사용자에 대해 profiles 레코드 생성
-- profiles.sql 실행 후 이 스크립트를 실행하세요

-- auth.users에 있지만 profiles에 없는 모든 사용자에 대해 프로필 생성
insert into public.profiles (
  id,
  email,
  full_name,
  name,
  avatar_url,
  provider,
  bio,
  website,
  gender,
  phone_number,
  created_at
)
select
  au.id,
  coalesce(au.email, au.raw_user_meta_data->>'email'),
  coalesce(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name'),
  au.raw_user_meta_data->>'name',
  coalesce(au.raw_user_meta_data->>'avatar_url', au.raw_user_meta_data->>'picture'),
  case
    when au.raw_app_meta_data->>'provider' is not null then au.raw_app_meta_data->>'provider'
    when au.email is not null then 'email'
    else 'unknown'
  end,
  null, -- bio는 raw_user_meta_data에 없음
  null, -- website는 raw_user_meta_data에 없음
  null, -- gender는 raw_user_meta_data에 없음
  null, -- phone_number는 raw_user_meta_data에 없음
  au.created_at
from auth.users au
where not exists (
  select 1 from public.profiles p where p.id = au.id
);

-- 결과 확인
select 
  p.id,
  p.email,
  p.full_name,
  p.name,
  p.bio,
  p.website,
  p.gender,
  p.phone_number,
  p.provider,
  p.created_at,
  au.email as auth_email,
  au.created_at as auth_created_at
from public.profiles p
join auth.users au on p.id = au.id
order by p.created_at desc;

