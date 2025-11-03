# 🔍 DB 쿼리 성능 확인 가이드

## 📊 현재 BusinessObject 페이지에서 실행되는 쿼리

### SQL 쿼리 (Prisma가 생성)

```sql
SELECT 
  -- BusinessObject 필드
  bo."id", bo."typeId", bo."name", bo."revision", 
  bo."policyId", bo."currentState", bo."description",
  bo."owner", bo."createdBy", bo."updatedBy", 
  bo."data", bo."createdAt", bo."updatedAt",
  
  -- Type 필드 (LEFT JOIN)
  t."id" AS "type.id",
  t."name" AS "type.name",
  t."description" AS "type.description",
  t."prefix" AS "type.prefix",
  
  -- Policy 필드 (LEFT JOIN)
  p."id" AS "policy.id",
  p."name" AS "policy.name",
  p."revisionSequence" AS "policy.revisionSequence"

FROM "BusinessObject" AS bo
LEFT JOIN "Type" AS t ON t."id" = bo."typeId"
LEFT JOIN "Policy" AS p ON p."id" = bo."policyId"
ORDER BY bo."createdAt" DESC
LIMIT 200;
```

**쿼리 특징:**
- ✅ LIMIT 200 (제한됨)
- ✅ SELECT만 명시 (필요한 필드만)
- ⚠️ 2개의 LEFT JOIN (느릴 수 있음)
- ⚠️ ORDER BY createdAt (인덱스 필요)

---

## 🔍 성능 확인 방법

### 1. Prisma 쿼리 로깅 (개발 환경)

**이미 활성화됨:**
```typescript
// src/lib/prisma.ts
const basePrisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn']  // ← 이미 활성화!
    : ['error'],
})
```

**로컬에서 확인:**
```bash
npm run dev

# 터미널에 쿼리가 출력됨:
# prisma:query SELECT "BusinessObject"...
# Duration: 123ms
```

---

### 2. 코드에 성능 측정 추가

**현재 추가됨:**
```typescript
async function getAllBusinessObjects() {
  const startTime = performance.now()
  
  const objects = await prisma.businessObject.findMany({ ... })
  
  const duration = performance.now() - startTime
  console.log(`🔍 Query took ${duration.toFixed(2)}ms`)
  
  return objects
}
```

**Vercel 로그 확인:**
1. https://vercel.com/dashboard
2. 프로젝트 → Deployments → 최신 배포 선택
3. "Logs" 탭 → "🔍 [BusinessObjects]" 검색

---

### 3. Supabase Dashboard에서 직접 실행

**쿼리 복사 후 실행:**
1. Supabase Dashboard → SQL Editor
2. 위의 SQL 쿼리 붙여넣기
3. "Run" 클릭
4. **실행 시간 확인**

**예상 결과:**
- ✅ 빠름: 50-200ms
- ⚠️ 보통: 200-500ms
- ❌ 느림: 500ms+ (인덱스 필요!)

---

### 4. Vercel 배포 후 Server Timing 헤더 확인

**Network 탭:**
- Request 클릭
- "Timing" 탭 → **"Server Timing"** 섹션 확인
- DB 쿼리 시간이 표시됨

---

## 🚀 쿼리 최적화 방안

### 문제: 5.9초는 너무 느림!

**원인 분석:**
- Content Download: **5.20s** ← 데이터 전송 시간 (네트워크)
- Waiting for server: **700ms** ← DB 쿼리 + 렌더링

**700ms 중:**
- DB 쿼리: ~500ms (예상)
- Next.js 렌더링: ~200ms

---

### 해결 방법 1: 인덱스 추가 (필수!)

```sql
-- BusinessObject 테이블 인덱스 확인
SELECT 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE tablename = 'BusinessObject';

-- 필요한 인덱스:
CREATE INDEX IF NOT EXISTS "BusinessObject_createdAt_idx" 
  ON "BusinessObject"("createdAt" DESC);

CREATE INDEX IF NOT EXISTS "BusinessObject_typeId_idx" 
  ON "BusinessObject"("typeId");

CREATE INDEX IF NOT EXISTS "BusinessObject_policyId_idx" 
  ON "BusinessObject"("policyId");
```

**prisma/schema.prisma에 이미 있는지 확인:**
```prisma
model BusinessObject {
  // ...
  
  @@index([typeId])
  @@index([policyId])
  @@index([createdAt])  // ← 이거 확인!
}
```

---

### 해결 방법 2: JOIN 제거 (극단적)

```typescript
// Type, Policy ID만 가져오고 클라이언트에서 이름 표시 안 함
async function getAllBusinessObjects() {
  const objects = await prisma.businessObject.findMany({
    take: 200,
    select: {
      id: true,
      typeId: true,
      name: true,
      revision: true,
      policyId: true,
      currentState: true,
      description: true,
      data: true,
      createdAt: true,
      // type, policy 제거! (JOIN 없음)
    },
    orderBy: { createdAt: 'desc' },
  })

  return objects
}
```

**예상 성능:**
- Before (JOIN 2개): 700ms
- After (JOIN 없음): 100ms

---

### 해결 방법 3: 데이터 크기 줄이기

```typescript
// data 필드 제거 (JSON 필드가 클 수 있음)
select: {
  // ...
  data: false,  // ← 제거!
}
```

**`data` 필드가 큰 경우:**
- 45개 × 평균 2KB = **90KB**
- 전송 시간: 5초+ (느린 네트워크)

---

### 해결 방법 4: Limit 더 줄이기

```typescript
take: 50,  // 200 → 50
```

**예상 개선:**
- 200개: 5.9s
- 50개: 1.5s (4배 빠름!)

---

## 🎯 즉시 적용 가능한 최적화

제가 지금 바로 적용해드릴 수 있는 것:

1. **`data` 필드 제거** (목록에서는 불필요)
2. **limit 50으로 줄이기**
3. **인덱스 확인 및 추가**

어떤 것을 먼저 해드릴까요?

---

## 📋 빠른 진단

**로컬에서 확인:**
```bash
# 개발 서버 실행
npm run dev

# BusinessObjects 페이지 방문
# 터미널에 쿼리 시간이 출력됨:
# 🔍 [BusinessObjects] Query took XXXms
```

**Vercel에서 확인:**
1. 배포 → Logs 탭
2. "🔍 [BusinessObjects]" 검색
3. 쿼리 시간 확인

**빠르게 최적화해드릴까요?** 🚀
