# 마이그레이션 에러 해결

## 🐛 발생한 에러

```
ERROR: 42703: column "type" does not exist
LINE 16: UPDATE "Type" SET "name_new" = "type";
```

## 🔍 원인 분석

2가지 가능성:

### 1. 이미 마이그레이션 실행됨
- 이전에 마이그레이션을 실행했음
- `type` 컬럼이 이미 `name`으로 변경됨
- 다시 실행하려니 `type` 컬럼을 찾을 수 없음

### 2. init-v2.sql로 초기화됨
- 새 스키마(`init-v2.sql`)로 데이터베이스를 초기화함
- 처음부터 `name` 컬럼을 사용
- `type` 컬럼이 존재한 적이 없음

## ✅ 현재 스키마 확인

### Supabase SQL Editor에서 실행:

```sql
-- Type 테이블 컬럼 확인
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'Type'
ORDER BY ordinal_position;
```

**기대 결과:**
```
column_name
-----------
id
name          ← type이 아니라 name이면 이미 마이그레이션 완료!
description
prefix
policyId
parentId
createdAt
updatedAt
```

---

## ✅ 해결 방법

### 케이스 1: 이미 name 컬럼이 있는 경우

**→ 마이그레이션 불필요!** 이미 완료된 상태입니다.

**다음 단계:**
1. ✅ 코드 최신 버전으로 푸시
2. ✅ Vercel 재배포
3. ✅ 정상 작동 확인

### 케이스 2: type 컬럼이 여전히 있는 경우

**→ 마이그레이션 재실행 필요**

하지만 현재 에러가 났으므로, **전체 재초기화 권장:**

```sql
-- Supabase SQL Editor에서 실행
-- 파일: prisma/init-v2.sql
```

⚠️ **주의: 모든 데이터가 삭제되고 샘플 데이터로 초기화됩니다!**

---

## 🔧 데이터베이스 상태 확인 스크립트

### Supabase SQL Editor에서 실행:

```sql
-- 1. Type 테이블 존재 여부
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'Type'
);

-- 2. Type 테이블 컬럼 목록
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'Type'
ORDER BY ordinal_position;

-- 3. 샘플 데이터 확인
SELECT id, 
  CASE 
    WHEN EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'Type' AND column_name = 'type') 
    THEN 'OLD SCHEMA (type 컬럼 존재)'
    ELSE 'NEW SCHEMA (name 컬럼 사용)'
  END as schema_status
FROM "Type" 
LIMIT 1;
```

---

## 🎯 권장 조치

### 개발 환경이라면:

**방법 1: 전체 재초기화 (가장 간단)**

```sql
-- Supabase SQL Editor에서 실행
-- 파일 내용: prisma/init-v2.sql
```

**장점:**
- 깔끔한 시작
- 샘플 데이터 포함
- 모든 테이블 최신 스키마

**단점:**
- 기존 데이터 삭제

---

### 프로덕션 데이터가 있다면:

**방법 2: 현재 스키마 확인 후 조치**

1. 위의 확인 스크립트 실행
2. `type` 컬럼이 있으면 → 수동 마이그레이션
3. `name` 컬럼이 있으면 → 이미 완료, 아무것도 안 함

---

## 💡 빠른 해결 (권장)

**개발 환경이고 데이터가 중요하지 않다면:**

### Supabase SQL Editor:
```sql
-- prisma/init-v2.sql 전체 내용 복사 & 실행
```

### Vercel:
```bash
git push
# 자동 재배포
```

### 완료!
- ✅ 에러 해결
- ✅ 정상 작동

---

## 🔍 에러 로그 상세

```
ERROR: 42703: column "type" does not exist
LINE 16: UPDATE "Type" SET "name_new" = "type";
```

**해석:**
- PostgreSQL 에러 코드 `42703` = Undefined Column
- `UPDATE "Type" SET "name_new" = "type"` 실행 중 에러
- `type` 컬럼을 찾을 수 없음

**결론:**
- 데이터베이스에 이미 `name` 컬럼이 있고
- `type` 컬럼은 없음
- → 마이그레이션 이미 완료됨 또는 새 스키마 사용 중

---

## 🎊 다음 단계

1. **Supabase SQL Editor에서 확인:**
```sql
SELECT column_name FROM information_schema.columns WHERE table_name = 'Type';
```

2. **`name` 컬럼이 보이면:**
   - ✅ 마이그레이션 완료!
   - 코드만 푸시하면 됨

3. **`type` 컬럼이 보이면:**
   - 🔄 `init-v2.sql` 재실행

어떤 컬럼이 보이나요? 😊

