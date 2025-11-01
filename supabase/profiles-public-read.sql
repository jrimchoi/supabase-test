-- ============================================
-- profiles 테이블 RLS 정책 수정
-- 인증된 사용자는 모든 프로필을 조회 가능하도록 변경
-- ============================================

-- 기존 SELECT 정책 삭제
DROP POLICY IF EXISTS "사용자는 본인 프로필만 조회 가능" ON public.profiles;

-- 새로운 SELECT 정책: 인증된 사용자는 모든 프로필 조회 가능
CREATE POLICY "인증된 사용자는 모든 프로필 조회 가능"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- UPDATE 정책은 본인 것만 (기존 유지)
-- INSERT, DELETE 정책도 기존 유지

-- 확인
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

