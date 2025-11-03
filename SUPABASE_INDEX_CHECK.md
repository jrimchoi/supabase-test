# 🔍 Supabase 테이블 인덱스 확인 방법

## 방법 1: SQL Editor 사용 (권장)

### 1. Supabase Dashboard 접속
```
https://supabase.com/dashboard
→ 프로젝트 선택
→ SQL Editor
```

### 2. 인덱스 조회 SQL 실행

**모든 인덱스 확인:**
```sql
SELECT 
  tablename AS "테이블",
  indexname AS "인덱스명",
  indexdef AS "정의"
FROM pg_indexes 
WHERE schemaname = 'public'
  AND tablename = 'BusinessObject'
ORDER BY indexname;
```

**결과 예시:**
```
테이블            | 인덱스명                                      | 정의
-----------------|----------------------------------------------|------------------
BusinessObject   | BusinessObject_pkey                          | PRIMARY KEY (id)
BusinessObject   | BusinessObject_typeId_idx                    | (typeId)
BusinessObject   | BusinessObject_policyId_idx                  | (policyId)
BusinessObject   | BusinessObject_createdAt_idx                 | (createdAt DESC)  ← 확인!
BusinessObject   | BusinessObject_typeId_policyId_name_...      | (typeId, policyId, ...)
```

---

## 방법 2: Table Editor에서 확인

### 1. Table Editor 열기
```
Supabase Dashboard
→ Table Editor
→ BusinessObject 테이블 선택
```

### 2. "Indexes" 탭 클릭
- 우측 상단에 "Indexes" 탭 있음
- 모든 인덱스 목록 표시
- 각 인덱스의 컬럼 정보 확인

---

## 방법 3: 특정 테이블의 모든 인덱스 확인

```sql
-- 더 상세한 정보
SELECT
  i.relname AS index_name,
  a.attname AS column_name,
  am.amname AS index_type,
  idx.indisprimary AS is_primary,
  idx.indisunique AS is_unique,
  pg_get_indexdef(idx.indexrelid) AS index_definition
FROM
  pg_index idx
  JOIN pg_class i ON i.oid = idx.indexrelid
  JOIN pg_class t ON t.oid = idx.indrelid
  JOIN pg_namespace n ON n.oid = t.relnamespace
  JOIN pg_am am ON am.oid = i.relam
  JOIN pg_attribute a ON a.attrelid = t.oid 
    AND a.attnum = ANY(idx.indkey)
WHERE
  n.nspname = 'public'
  AND t.relname = 'BusinessObject'
ORDER BY i.relname, a.attnum;
```

---

## 방법 4: 인덱스 사용 확인 (EXPLAIN)

### 쿼리 실행 계획 확인:

```sql
-- 인덱스가 사용되는지 확인
EXPLAIN ANALYZE
SELECT * FROM "BusinessObject"
ORDER BY "createdAt" DESC
LIMIT 50;
```

**결과 확인:**
```
✅ Index Scan using BusinessObject_createdAt_idx
   → 인덱스 사용 중! (빠름)

❌ Seq Scan on "BusinessObject"
   → Full Table Scan (느림!)
```

---

## 🎯 BusinessObject 테이블 인덱스 확인

### 빠른 확인 (복사해서 실행):

```sql
-- BusinessObject 테이블의 모든 인덱스
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'BusinessObject'
ORDER BY indexname;
```

**확인할 인덱스:**
- ✅ `BusinessObject_createdAt_idx` ← **이거 확인!**
- ✅ `BusinessObject_typeId_idx`
- ✅ `BusinessObject_policyId_idx`
- ✅ `BusinessObject_currentState_idx`
- ✅ `BusinessObject_owner_idx`
- ✅ `BusinessObject_createdBy_idx`
- ✅ `BusinessObject_typeId_policyId_name_revision_idx`

---

## 🚨 인덱스가 없다면?

### createdAt 인덱스 생성:

```sql
CREATE INDEX IF NOT EXISTS "BusinessObject_createdAt_idx" 
  ON "BusinessObject"("createdAt" DESC);
```

### 생성 확인:

```sql
-- 방금 생성한 인덱스 확인
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'BusinessObject'
  AND indexname = 'BusinessObject_createdAt_idx';
```

**결과:**
```
indexname                      | indexdef
-------------------------------|------------------------------------------
BusinessObject_createdAt_idx   | CREATE INDEX ... ON ... (createdAt DESC)
```

---

## 📊 인덱스 크기 확인

```sql
-- 인덱스가 차지하는 디스크 공간
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE tablename = 'BusinessObject'
ORDER BY pg_relation_size(indexrelid) DESC;
```

---

## 🎯 성능 비교

### 인덱스 적용 전/후:

```sql
-- Before (인덱스 없음)
EXPLAIN ANALYZE
SELECT * FROM "BusinessObject"
ORDER BY "createdAt" DESC
LIMIT 50;

-- 결과:
-- Seq Scan ... (cost=0.00..XXX rows=XXX width=XXX)
-- Planning Time: 0.5ms
-- Execution Time: 700ms  ← 느림!

-- After (인덱스 있음)
-- 결과:
-- Index Scan using BusinessObject_createdAt_idx ... 
-- Planning Time: 0.3ms
-- Execution Time: 50ms  ← 빠름!
```

---

## ✅ 빠른 체크

**1줄 명령어:**
```sql
SELECT COUNT(*) FROM pg_indexes 
WHERE tablename = 'BusinessObject' AND indexname LIKE '%createdAt%';
```

**결과:**
- `1` → 인덱스 있음 ✅
- `0` → 인덱스 없음 ❌ (추가 필요!)

---

완벽합니다! 이제 Supabase SQL Editor에서 확인해보세요! 🚀

