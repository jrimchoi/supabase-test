-- 관리자용 RLS 정책 예제
-- 실행 전: 관리자 권한이 있는 사용자 이메일이나 역할을 설정해야 함

-- 예시 1: 특정 이메일을 관리자로 설정
-- 아래 이메일을 실제 관리자 이메일로 변경하세요
create or replace function public.is_admin()
returns boolean as $$
begin
  return (
    select email in ('i01020615591@gmail.com','jrimchoi@naver.com') -- 여기를 관리자 이메일로 변경
    from auth.users
    where id = auth.uid()
  );
end;
$$ language plpgsql security definer;

-- 관리자는 모든 프로필 조회 가능
drop policy if exists "Profiles read admin" on public.profiles;
create policy "Profiles read admin" on public.profiles
  for select using ( public.is_admin() );

-- 예시 2: user_metadata에 is_admin 플래그 사용
-- create or replace function public.is_admin()
-- returns boolean as $$
-- begin
--   return (
--     select (raw_user_meta_data->>'is_admin')::boolean = true
--     from auth.users
--     where id = auth.uid()
--   );
-- end;
-- $$ language plpgsql security definer;

