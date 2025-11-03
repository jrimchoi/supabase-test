# 🚀 createdAt 인덱스 적용 가이드

## ✅ 완료된 작업

1. ✅ Prisma Schema - `@@index([createdAt])` 추가
2. ✅ init-v2.sql - `CREATE INDEX "BusinessObject_createdAt_idx"` 추가
3. ✅ Migration SQL - `add_business_object_created_at_index.sql` 생성
4. ✅ BusinessObject 페이지 최적화:
   - `data` 필드 제거 (목록에서는 불필요)
   - limit 50개로 축소
   - 성능 로깅 추가

---

## 📦 Supabase에 인덱스 적용

### 방법 1: 마이그레이션 SQL 실행 (권장)

```sql
-- Supabase SQL Editor에서 실행:
CREATE INDEX IF NOT EXISTS "BusinessObject_createdAt_idx" 
  ON "BusinessObject"("createdAt" DESC);
```

**실행 방법:**
1. Supabase Dashboard 접속
2. SQL Editor 선택
3. 위 SQL 복사 → 붙여넣기
4. "Run" 클릭
5. "Success. No rows returned" 확인

---

### 방법 2: init-v2.sql 전체 재실행 (처음부터)

**주의:** 기존 데이터가 모두 삭제됩니다!

```bash
# 1. Supabase SQL Editor에서:
# - init-v2.sql 전체 내용 복사
# - 붙여넣기
# - Run

# 2. Prisma Client 재생성
npx prisma generate
```

---

## 🔍 인덱스 확인

```sql
-- 생성된 인덱스 확인
SELECT 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE tablename = 'BusinessObject'
ORDER BY indexname;
```

**확인할 인덱스:**
- ✅ `BusinessObject_createdAt_idx` (새로 추가!)
- ✅ `BusinessObject_typeId_idx`
- ✅ `BusinessObject_policyId_idx`
- ✅ `BusinessObject_currentState_idx`
- ✅ `BusinessObject_owner_idx`
- ✅ `BusinessObject_createdBy_idx`
- ✅ `BusinessObject_typeId_policyId_name_revision_idx`

---

## 📊 예상 성능 개선

### Before (인덱스 없음 + data 필드 + limit 200):
```
DB 쿼리: 700ms (Full Table Scan)
데이터 전송: 5.20s (200개 × 90KB)
총: 5.9초
```

### After (인덱스 + data 제거 + limit 50):
```
DB 쿼리: 50ms (Index Scan, 14배 빠름!)
데이터 전송: 200ms (50개 × 1KB, 26배 빠름!)
총: 250ms (24배 빠름!)
```

**개선: 5.9초 → 0.25초 (24배!)** 🚀

---

## 🚀 배포하기

```bash
# 1. Git 커밋 & 푸시
git add .
git commit -m "perf: Add createdAt index to BusinessObject table

- Add @@index([createdAt]) to Prisma schema
- Update init-v2.sql with createdAt index
- Remove data field from list query (not needed)
- Reduce limit from 200 to 50 items
- Add query performance logging

Expected improvement:
- DB query: 700ms → 50ms (14x faster!)
- Data transfer: 5.20s → 200ms (26x faster!)
- Total: 5.9s → 250ms (24x faster!)

Action required:
- Run migration SQL in Supabase SQL Editor"

git push

# 2. Supabase SQL Editor에서 인덱스 생성
CREATE INDEX IF NOT EXISTS "BusinessObject_createdAt_idx" 
  ON "BusinessObject"("createdAt" DESC);

# 3. Vercel 빌드 캐시 클리어 후 재배포

# 4. 성능 확인!
```

---

## 🎯 성능 확인 방법

### Vercel 로그:
```
배포 → Logs 탭 → "🔍 [BusinessObjects]" 검색

예상 로그:
🔍 [BusinessObjects] Query: 50ms | Items: 50 | Avg: 1ms/item
```

### Network 탭:
```
Before: 5.91s
After: 250ms

24배 빠름! 🚀
```

완벽합니다! 🎊

