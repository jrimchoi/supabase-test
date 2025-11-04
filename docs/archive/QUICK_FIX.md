# 빠른 수정 가이드

## 문제
테스트 실패 원인: 데이터베이스에 잘못된 유니크 제약이 남아있음

```
❌ 현재 DB: UNIQUE (typeId, policyId, name)
✅ 올바름: UNIQUE (typeId, name, revision)
```

---

## 해결 방법

### Option 1: 빠른 수정 (30초)

**Supabase SQL Editor에서 다음 실행:**

```sql
ALTER TABLE "BusinessObject"
DROP CONSTRAINT IF EXISTS "BusinessObject_typeId_policyId_name_key";
```

### Option 2: 전체 초기화 (2분, 권장)

**Supabase SQL Editor에서 `init-v2.sql` 전체 실행:**

1. `prisma/init-v2.sql` 파일 열기
2. 전체 내용 복사
3. Supabase Dashboard → SQL Editor 붙여넣기
4. Run 클릭

---

## 실행 후

```bash
npm run test:integration
```

**예상 결과:**
```
Test Suites: 3 passed, 3 total
Tests:       7 passed, 7 total
✅ 모든 테스트 통과!
```

---

## 참고

- `fix-unique-constraint.sql`: 빠른 수정용
- `init-v2.sql`: 전체 초기화용 (샘플 데이터 포함)
