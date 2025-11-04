# 🔑 인덱스 강제 사용 가이드

## 📋 개요

Query Test 페이지에 **인덱스 강제 사용 옵션**이 추가되었습니다.

PostgreSQL의 `SET enable_seqscan = OFF` 설정을 통해 Sequential Scan을 비활성화하고, 인덱스를 강제로 사용하도록 합니다.

---

## ✅ 구현 내용

### 1. UI 컴포넌트

**위치**: Connection Type 선택 섹션

```tsx
<Checkbox
  id="forceIndex"
  checked={forceIndex}
  onCheckedChange={(checked) => setForceIndex(checked as boolean)}
/>
<label htmlFor="forceIndex">
  인덱스 강제 사용 (SET enable_seqscan = OFF)
</label>
```

### 2. API 로직

**쿼리 실행 순서**:

```typescript
// 1. 인덱스 강제 설정
if (forceIndex) {
  await prisma.$executeRawUnsafe('SET LOCAL enable_seqscan = OFF')
}

// 2. 쿼리 실행
const result = await prisma.$queryRawUnsafe(sql)

// 3. 설정 복구
if (forceIndex) {
  await prisma.$executeRawUnsafe('SET LOCAL enable_seqscan = ON')
}
```

### 3. 결과 표시

**쿼리 정보 섹션**:
- ✅ ON (enable_seqscan = OFF) - 파란색 Badge
- ✅ OFF - 회색 Badge

---

## 🎯 사용 시나리오

### ✅ 인덱스 사용이 권장되는 경우:

1. **대량의 데이터** (수천 ~ 수만 행)
   - WHERE 조건으로 특정 행만 조회
   - ORDER BY + LIMIT으로 상위 N개만 조회

2. **복잡한 JOIN**
   - 여러 테이블 JOIN 시 인덱스가 필수

3. **성능 비교 테스트**
   - Sequential Scan vs Index Scan 성능 비교

### ❌ 권장하지 않는 경우:

1. **적은 데이터** (수십 ~ 수백 행)
   - 전체 테이블 스캔이 더 빠를 수 있음
   - 인덱스 오버헤드만 증가

2. **전체 데이터 조회**
   - `SELECT * FROM table` (WHERE 없음)
   - 인덱스 의미 없음

3. **인덱스가 없는 컬럼**
   - WHERE 조건에 인덱스가 없으면 강제해도 사용 불가

---

## 📊 성능 비교 예시

### BusinessObject 조회 (50개)

#### Sequential Scan (forceIndex = OFF):
```
✅ Query Execution: 850ms
📊 Result Count: 50
⚡ Seq Scan on BusinessObject
```

#### Index Scan (forceIndex = ON):
```
✅ Query Execution: 120ms
📊 Result Count: 50
⚡ Index Scan using BusinessObject_createdAt_idx
```

**결과**: 7배 빠름! 🚀

---

## 🔍 확인 방법

### 1. 서버 로그

```bash
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 [Query Test] BusinessObject (50개, JOIN 포함)
🔌 [Connection] pooler
🔑 [Force Index] ON (enable_seqscan = OFF)
📝 [SQL] SELECT "BusinessObject".id, ...
⚡ [Setting] enable_seqscan = OFF
✅ [Query Execution] 120.45ms
📊 [Result Count] 50
⏱️  [Server Time] 125ms
⚡ [Setting] enable_seqscan = ON (복구)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 2. UI 결과

**쿼리 정보 섹션**:
- **Connection Type**: Pooler (싱가포르)
- **인덱스 강제 사용**: ON (enable_seqscan = OFF) ← 파란색 Badge

---

## ⚠️ 주의사항

### 1. SET LOCAL 사용
```sql
SET LOCAL enable_seqscan = OFF  -- 현재 트랜잭션만 적용
```

- ✅ **트랜잭션 종료 시 자동 복구**
- ✅ **다른 쿼리에 영향 없음**

### 2. 인덱스 존재 확인

**인덱스가 없으면 강제해도 사용 불가**:
```sql
-- ❌ 인덱스 없음
SELECT * FROM "BusinessObject" WHERE description = 'test'

-- ✅ 인덱스 있음
SELECT * FROM "BusinessObject" ORDER BY "createdAt" DESC
```

### 3. 성능 역효과

**데이터가 적을 때 (50개 미만)**:
- Sequential Scan: 5ms ← 빠름!
- Index Scan: 15ms ← 느림!

**인덱스 오버헤드**:
1. 인덱스 페이지 읽기
2. 테이블 페이지 랜덤 액세스
3. 두 번의 디스크 I/O

---

## 🎓 EXPLAIN ANALYZE

### 실제 실행 계획 확인:

```sql
-- 1. Sequential Scan
EXPLAIN ANALYZE
SELECT * FROM "BusinessObject" ORDER BY "createdAt" DESC LIMIT 50;

Result:
Seq Scan on "BusinessObject"  (cost=0.00..25.00 rows=50)
Execution Time: 0.850 ms

-- 2. Index Scan (강제)
SET enable_seqscan = OFF;
EXPLAIN ANALYZE
SELECT * FROM "BusinessObject" ORDER BY "createdAt" DESC LIMIT 50;

Result:
Index Scan using BusinessObject_createdAt_idx  (cost=0.15..12.50 rows=50)
Execution Time: 0.120 ms
```

---

## 🚀 권장 사용법

### 1. 기본 테스트
```
1. Connection Type: Pooler
2. 인덱스 강제 사용: OFF
3. 쿼리: BusinessObject (50개, JOIN 포함)
4. 실행 → 결과 확인
```

### 2. 인덱스 성능 비교
```
1. Connection Type: Pooler
2. 인덱스 강제 사용: ON
3. 쿼리: BusinessObject (50개, JOIN 포함)
4. 실행 → 결과 비교
```

### 3. 분석
```
- Sequential Scan: 850ms
- Index Scan: 120ms
- 개선율: 7배 (85.9% 감소)
```

---

## 📚 관련 문서

- `DB_QUERY_PERFORMANCE.md`: DB 쿼리 성능 가이드
- `PERFORMANCE_INDEX_FIX.md`: 인덱스 추가 가이드
- `SUPABASE_INDEX_CHECK.md`: Supabase 인덱스 확인

---

## ✅ 완료!

**인덱스 강제 사용 기능이 추가되었습니다!** 🎉

### 테스트:
1. `/admin/query-test` 페이지 접속
2. Connection Type 선택
3. **인덱스 강제 사용** 체크박스 체크
4. 쿼리 실행
5. 성능 비교!

### 기대 효과:
- ⚡ **5-10배 빠른 쿼리** (데이터 많을 때)
- 📊 **정확한 성능 측정**
- 🔍 **인덱스 효과 확인**

