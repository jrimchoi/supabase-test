-- 1. 테이블 통계 업데이트 (인덱스 사용 최적화)
VACUUM ANALYZE "BusinessObject";

-- 2. 인덱스 사용 강제 (테스트용)
SET enable_seqscan = OFF;

-- 3. 쿼리 실행 계획 다시 확인
EXPLAIN ANALYZE
SELECT * FROM "BusinessObject"
ORDER BY "createdAt" DESC
LIMIT 50;

-- 4. 설정 원복
SET enable_seqscan = ON;

-- 5. 데이터 개수 확인
SELECT COUNT(*) as "총_개수" FROM "BusinessObject";

-- 6. 인덱스 크기 및 사용 통계
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as "사용_횟수",
  idx_tup_read as "읽은_행",
  idx_tup_fetch as "반환_행",
  pg_size_pretty(pg_relation_size(indexrelid)) AS "인덱스_크기"
FROM pg_stat_user_indexes
WHERE tablename = 'BusinessObject'
ORDER BY indexname;

