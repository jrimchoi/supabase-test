-- 빠른 수정: BusinessObject 유니크 제약 삭제
-- Supabase SQL Editor에서 실행하세요

ALTER TABLE "BusinessObject"
DROP CONSTRAINT IF EXISTS "BusinessObject_typeId_policyId_name_key";

SELECT 'Constraint 삭제 완료! 테스트를 다시 실행하세요.' AS result;

