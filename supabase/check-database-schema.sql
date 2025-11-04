-- 데이터베이스 현재 스키마 확인

-- Type 테이블 컬럼 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'Type'
ORDER BY ordinal_position;

-- Attribute 테이블 컬럼 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'Attribute'
ORDER BY ordinal_position;

