-- BusinessObject 테이블의 모든 인덱스 확인
SELECT 
  indexname AS "인덱스명",
  indexdef AS "정의"
FROM pg_indexes 
WHERE tablename = 'BusinessObject'
ORDER BY indexname;

-- createdAt 인덱스 확인
SELECT 
  COUNT(*) as "인덱스_존재"
FROM pg_indexes 
WHERE tablename = 'BusinessObject' 
  AND indexname = 'BusinessObject_createdAt_idx';

-- 쿼리 실행 계획 확인 (인덱스 사용 여부)
EXPLAIN ANALYZE
SELECT * FROM "BusinessObject"
ORDER BY "createdAt" DESC
LIMIT 50;

