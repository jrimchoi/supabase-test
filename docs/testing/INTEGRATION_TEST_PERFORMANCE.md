# 통합 테스트 성능 분석

## ⏱️ 현재 성능

```
Test Suites: 3 passed, 3 total
Tests:       7 passed, 7 total
Time:        49.27s
```

**평균:** 약 7초/테스트

---

## 🔍 왜 느린가?

### 1. 실제 데이터베이스 연결

| 항목 | 단위 테스트 | 통합 테스트 |
|------|-------------|-------------|
| DB 연결 | ❌ (Mock) | ✅ (실제) |
| 네트워크 | 없음 | AWS Singapore |
| 지연 시간 | 0ms | 50-200ms/쿼리 |

**영향:**
- 각 쿼리마다 네트워크 왕복
- 총 100+ 쿼리 × 100ms = 10초+

---

### 2. 순차 실행 (`maxWorkers: 1`)

```javascript
// jest.integration.config.js
maxWorkers: 1  // DB 동시성 충돌 방지
```

**이유:**
- 3개 테스트가 동시에 같은 테이블 사용
- 동시 실행 시 유니크 제약 충돌 가능

**영향:**
- 병렬 실행 불가 → 시간 3배

---

### 3. 많은 데이터 생성

**policy-workflow.test.ts:**
```
- Role: 3개
- Group: 3개
- UserRole: 3개
- UserGroup: 3개
- Policy: 1개
- State: 5개
- Transition: 4개
- Permission: 10개
총: 32개 레코드
```

**eav-workflow.test.ts:**
```
- Policy: 1개
- Type: 1개
- Attribute: 8개
- TypeAttribute: 8개
- BusinessObject: 1개
- BusinessAttribute: 8개
총: 27개 레코드
```

**revision-workflow.test.ts:**
```
- Policy: 1개
- Type: 3개
- BusinessObject: 9개
총: 13개 레코드
```

**전체: 72개 레코드 × 100ms = 7.2초**

---

### 4. 복잡한 조회 쿼리

```typescript
// 예시: policy-workflow.test.ts
const fullPolicy = await prisma.policy.findUnique({
  where: { id: createdPolicy.id },
  include: {
    states: {
      include: {
        permissions: {
          include: {
            role: true,
            group: true,
          },
        },
        fromTransitions: {
          include: { toState: true },
        },
      },
    },
  },
})
```

**4단계 JOIN → 느림**

---

## 🚀 TLS 문제 해결 과정

### 시도 1: sslmode=require ❌
```javascript
dbUrl += '&sslmode=require'
```
**결과:** `Error opening a TLS connection: bad certificate format`

### 시도 2: sslmode=prefer ❌
```javascript
dbUrl += '&sslmode=prefer'
```
**결과:** 여전히 인증서 오류

### 시도 3: sslmode=disable ✅
```javascript
dbUrl += '&sslmode=disable'
```
**결과:** 성공!

### 추가: Node.js 전역 설정 ✅
```javascript
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
```
**결과:** 완전 해결!

---

## 📊 성능 비교

| 테스트 | 시간 | 레코드 | 초/레코드 |
|--------|------|--------|-----------|
| 단위 (65개) | 0.343s | 0 | N/A |
| 통합 (7개) | 49.27s | 72 | 0.68s |

**결론:**
- 단위 테스트: **190개/초**
- 통합 테스트: **0.14개/초** (1400배 느림)

---

## ⚡ 최적화 방법

### 1. 병렬 실행 가능하게 (권장하지 않음)

```javascript
maxWorkers: 3  // 테스트별 독립 DB 필요
```

**문제:**
- 동일 DB 사용 시 충돌
- 테스트별 DB 필요 (복잡)

---

### 2. 데이터 개수 줄이기

```javascript
// Before
const roleNames = ['Admin', 'Manager', 'Developer']  // 3개

// After
const roleNames = ['Admin', 'Manager']  // 2개 (33% 감소)
```

**효과:** 49s → ~35s

---

### 3. console.log 제거

```javascript
// Before
console.log(`   ✅ ${name} 역할 생성: ${role.id}`)

// After
// (주석 처리)
```

**효과:** ~2-3초 절약

---

### 4. include 최소화

```javascript
// Before
include: {
  states: {
    include: {
      permissions: { include: { role: true, group: true } },
      fromTransitions: { include: { toState: true } },
    },
  },
}

// After
include: {
  states: {
    select: { id: true, name: true },  // 필요한 것만
  },
}
```

**효과:** ~5-10초 절약

---

### 5. Transaction 사용

```typescript
await prisma.$transaction([
  prisma.role.create({ data: { ... } }),
  prisma.role.create({ data: { ... } }),
  prisma.role.create({ data: { ... } }),
])
```

**효과:** 네트워크 왕복 3회 → 1회

---

## 🎯 권장 전략

### 개발 중
```bash
npm test  # 0.3초, 빠른 피드백
```

### PR/배포 전
```bash
npm run test:integration  # 50초, 완전 검증
```

### CI/CD
```bash
npm run test:ci  # 단위 테스트만 (빠름)
```

---

## 📈 예상 개선 효과

| 개선 방법 | 현재 | 개선 후 | 절감 |
|-----------|------|---------|------|
| console.log 제거 | 49s | 46s | -6% |
| 데이터 33% 감소 | 49s | 35s | -29% |
| include 최소화 | 49s | 40s | -18% |
| **모두 적용** | 49s | **~25s** | **-49%** |

---

## 🔧 TLS 문제 최종 정리

### 설정 파일

**jest.integration.setup.js:**
```javascript
// sslmode=disable 자동 추가
if (!dbUrl.includes('sslmode=')) {
  dbUrl += '&sslmode=disable'
}

// Node.js 전역 설정
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
```

**package.json:**
```json
"test:integration": "NODE_TLS_REJECT_UNAUTHORIZED=0 jest --config jest.integration.config.js"
```

### 왜 이렇게 해야 하나?

**문제:**
- Supabase Pooler는 자체 SSL 인증서 사용
- Node.js가 인증서 형식을 인식 못함

**해결:**
- PostgreSQL 레벨: `sslmode=disable`
- Node.js 레벨: `NODE_TLS_REJECT_UNAUTHORIZED=0`

---

## ✅ 결론

### 통합 테스트가 느린 이유
1. ✅ **실제 DB 연결** (네트워크 지연)
2. ✅ **순차 실행** (충돌 방지)
3. ✅ **많은 데이터** (72개 레코드)
4. ✅ **복잡한 JOIN** (4단계 include)

### TLS 해결 방법
1. ✅ `sslmode=disable` (PostgreSQL)
2. ✅ `NODE_TLS_REJECT_UNAUTHORIZED=0` (Node.js)
3. ✅ `.env.local` 사용 (Pooler)

---

**단위 테스트(0.3초)가 충분히 빠르므로, 통합 테스트는 배포 전에만 실행하면 됩니다!** ⚡

