# Vercel 배포 에러 해결 가이드

## 🐛 발생한 에러

```
Uncaught Error: An error occurred in the Server Components render.
The specific message is omitted in production builds...
```

**발생 위치:** `/admin/policies/policy2`

## 🔍 원인

**코드는 수정되었지만, 데이터베이스는 아직 이전 스키마를 사용 중**

- ✅ 코드: `Type.name` 컬럼 사용
- ❌ DB: `Type.type` 컬럼만 존재 (마이그레이션 미실행)

## ⚠️ Vercel 프로덕션 에러는 메시지가 숨겨짐

로컬에서는 상세한 에러 메시지를 볼 수 있지만, 
Vercel 프로덕션에서는 보안상 숨겨집니다.

**실제 에러:**
```
PrismaClientKnownRequestError
The column `Type.type` does not exist in the current database.
```

## ✅ 해결 방법: 데이터베이스 마이그레이션

### 🚀 Supabase SQL Editor에서 실행 (필수!)

#### 1. Supabase Dashboard 접속
```
https://supabase.com/dashboard
```

#### 2. SQL Editor 열기
- 왼쪽 메뉴 → **SQL Editor**
- **New Query** 클릭

#### 3. 마이그레이션 SQL 실행

**방법 A: 기존 데이터 보존 (권장)**

1. 로컬 파일 열기:
```bash
cat prisma/migrations/rename_type_and_attribute_columns.sql
```

2. 전체 내용을 복사
3. Supabase SQL Editor에 붙여넣기
4. **Run** 버튼 클릭

**방법 B: 전체 재초기화 (샘플 데이터)**

1. 로컬 파일 열기:
```bash
cat prisma/init-v2.sql
```

2. 전체 내용을 복사
3. Supabase SQL Editor에 붙여넣기
4. **Run** 버튼 클릭

#### 4. 성공 확인

쿼리 실행 후 다음 메시지 확인:
```
COMMIT
```

#### 5. Vercel 앱 새로고침

브라우저에서 Vercel 앱을 새로고침하면 정상 작동!

---

## 📋 마이그레이션 내용

### Type 테이블
```sql
-- type → name
-- name → description  
-- description 제거
```

### Attribute 테이블
```sql
-- key → name
```

---

## 🔍 마이그레이션 확인 방법

### Supabase SQL Editor에서 실행:

```sql
-- Type 테이블 컬럼 확인
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'Type';

-- 예상 결과:
-- id, name, description, prefix, policyId, parentId, createdAt, updatedAt
```

```sql
-- Attribute 테이블 컬럼 확인
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'Attribute';

-- 예상 결과:
-- id, name, label, description, attrType, isRequired, defaultValue, validation, createdAt
```

---

## 🎯 마이그레이션 후 체크리스트

- [ ] Supabase SQL Editor에서 마이그레이션 실행
- [ ] `COMMIT` 메시지 확인
- [ ] Vercel 앱 새로고침
- [ ] `/admin/policies/policy2` 접속 확인
- [ ] Type 관리 페이지 확인
- [ ] Attribute 관리 페이지 확인

---

## 💡 로컬 개발 환경

로컬에서도 동일한 마이그레이션 필요:

```bash
# 방법 1: psql 사용 (안 될 수 있음)
psql $DATABASE_URL -f prisma/migrations/rename_type_and_attribute_columns.sql

# 방법 2: Supabase SQL Editor 사용 (권장)
# 위와 동일하게 SQL Editor에서 실행
```

---

## 🚨 주의사항

### 마이그레이션 전 백업 (선택)

중요한 데이터가 있다면 백업:

```sql
-- Type 테이블 백업
CREATE TABLE "Type_backup" AS SELECT * FROM "Type";

-- Attribute 테이블 백업
CREATE TABLE "Attribute_backup" AS SELECT * FROM "Attribute";
```

### 롤백 방법

마이그레이션 파일 하단에 롤백 스크립트 포함:
```sql
-- prisma/migrations/rename_type_and_attribute_columns.sql
-- 하단의 주석 처리된 롤백 스크립트 사용
```

---

## 🎊 완료!

마이그레이션 실행 후:
- ✅ Vercel 에러 해결
- ✅ 모든 페이지 정상 작동
- ✅ Type/Attribute 관리 가능

마이그레이션을 실행하고 Vercel 앱을 새로고침하세요! 🚀

