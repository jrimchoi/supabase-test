# 데이터베이스 마이그레이션 가이드

## 스키마 변경 내용

- **Type 테이블:** `type` → `name`, `name` → `description`, `description` 제거
- **Attribute 테이블:** `key` → `name`

## 🚀 마이그레이션 실행 (기존 데이터 보존)

### 1. Supabase SQL Editor에서 실행

```bash
# 1. Supabase Dashboard 접속
# https://supabase.com/dashboard

# 2. SQL Editor 열기
# 왼쪽 메뉴 → SQL Editor

# 3. 마이그레이션 SQL 복사 & 실행
# prisma/migrations/rename_type_and_attribute_columns.sql
```

### 2. 또는 psql 명령어 사용

```bash
# .env.local에서 DATABASE_URL 확인 후
psql $DATABASE_URL -f prisma/migrations/rename_type_and_attribute_columns.sql
```

### 3. Prisma Client 재생성

```bash
npx prisma generate
```

### 4. 개발 서버 재시작

```bash
# Ctrl+C로 서버 종료 후
npm run dev
```

## 🔄 또는 전체 재초기화 (개발 환경만!)

**⚠️ 주의: 모든 데이터가 삭제됩니다!**

```bash
# 1. 전체 스키마 재생성
psql $DATABASE_URL -f prisma/init-v2.sql

# 2. Prisma Client 재생성
npx prisma generate

# 3. 서버 재시작
npm run dev
```

## ✅ 마이그레이션 확인

마이그레이션 후 다음 쿼리로 확인:

```sql
-- Type 테이블 컬럼 확인
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Type';

-- 예상 결과:
-- name (text)
-- description (text)
-- prefix (text)

-- Attribute 테이블 컬럼 확인
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Attribute';

-- 예상 결과:
-- name (text)
-- label (text)
```

## 🐛 트러블슈팅

### 에러: "column does not exist"

**원인:** 마이그레이션이 아직 실행되지 않음

**해결:**
```bash
psql $DATABASE_URL -f prisma/migrations/rename_type_and_attribute_columns.sql
```

### 에러: "relation does not exist"

**원인:** 데이터베이스 연결 문제

**해결:**
```bash
# 1. .env.local 확인
cat .env.local | grep DATABASE_URL

# 2. Supabase 연결 확인
psql $DATABASE_URL -c "SELECT 1"
```

## 📝 롤백 (필요 시)

마이그레이션 파일 하단에 롤백 스크립트가 포함되어 있습니다.

```bash
# 롤백 스크립트 부분의 주석을 제거하고 실행
```

