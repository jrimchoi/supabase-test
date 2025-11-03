# ⚡ 빠른 테스트 가이드

## 🚀 30초 안에 테스트 시작하기

### 단위 테스트 (Mock)

```bash
# 모든 테스트 실행
npm test

# 특정 테스트만
npm test types.test.ts

# Watch 모드
npm run test:watch
```

✅ **결과**: 0.3초 안에 50개 테스트 실행!

---

### 통합 테스트 (실제 DB)

#### 1단계: DB 연결 확인

`.env.local` 파일:

```bash
# ⚠️ Pooler는 타임아웃 가능
# DATABASE_URL="postgresql://...pooler.supabase.com:6543/..."

# ✅ Direct Connection 권장
DATABASE_URL="postgresql://postgres:pwd@db.xxx.supabase.co:5432/postgres?schema=public"
```

#### 2단계: 실행

```bash
npm run test:integration
```

---

## 📊 현재 테스트 현황

### ✅ 단위 테스트 (50개)

```
✅ policies.test.ts (8 tests)
✅ states.test.ts (6 tests)
✅ roles.test.ts (5 tests)
✅ types.test.ts (8 tests)
✅ attributes.test.ts (8 tests)
✅ business-objects.test.ts (7 tests)
✅ business-attributes.test.ts (10 tests)

Test Suites: 7 passed, 7 total
Tests:       50 passed, 50 total
Time:        0.356 s
```

### 📝 통합 테스트 (2개)

```
✅ policy-workflow.test.ts - Policy 전체 워크플로우
✅ eav-workflow.test.ts - EAV 패턴 워크플로우
```

---

## 🎯 테스트 종류

### 단위 테스트 예제

```typescript
// Mock 기반, 빠름
it('Type을 생성해야 함', async () => {
  // Given
  prismaMock.type.create.mockResolvedValue({
    id: 'type-1',
    name: 'Invoice',
    policyId: 'policy-1',
  })

  // When
  const response = await POST(request)

  // Then
  expect(response.status).toBe(201)
})
```

### 통합 테스트 예제

```typescript
// 실제 DB 사용, 느림
it('EAV 패턴 테스트', async () => {
  // 1. Type 생성 (실제 DB)
  const type = await prisma.type.create({
    data: { name: 'Invoice', policyId: policy.id }
  })

  // 2. Attribute 정의
  await prisma.attribute.create({
    data: {
      typeId: type.id,
      key: 'amount',
      label: '금액',
      attrType: 'INTEGER',
    }
  })

  // 3. 검증
  const result = await prisma.type.findUnique({
    where: { id: type.id },
    include: { attributes: true }
  })
  
  expect(result?.attributes).toHaveLength(1)
})
```

---

## 🔍 언제 무엇을 사용하나?

### 단위 테스트 사용

- ✅ API 로직 검증
- ✅ 에러 처리 테스트
- ✅ 필터링/옵션 테스트
- ✅ 빠른 피드백 필요
- ✅ 매번 실행 (개발 중)

### 통합 테스트 사용

- ✅ 전체 워크플로우 검증
- ✅ DB 관계 테스트
- ✅ 트랜잭션 테스트
- ✅ 실제 데이터 무결성
- ✅ 배포 전 최종 검증

---

## 🛠️ 빠른 문제 해결

### "Cannot find module '@/lib/prisma'"

```bash
# tsconfig.json 확인
# jest.config.js의 moduleNameMapper 확인
```

### "Mock이 작동하지 않음"

```typescript
// ✅ 순서 중요!
import { prismaMock } from '../mocks/prisma'  // 1번
jest.mock('@/lib/prisma', () => ({ prisma: prismaMock }))  // 2번
import { GET, POST } from '@/app/api/types/route'  // 3번
```

### "통합 테스트 타임아웃"

```bash
# .env.local에서 Direct Connection 사용
DATABASE_URL="postgresql://...@db.xxx.supabase.co:5432/..."
```

**자세한 내용**: `INTEGRATION_TEST_TROUBLESHOOTING.md`

---

## 📚 상세 문서

| 문서 | 내용 |
|------|------|
| **`TESTING_GUIDE.md`** | ⭐ 완벽한 테스트 가이드 |
| **`TEST_GUIDE.md`** | 기본 테스트 가이드 |
| **`INTEGRATION_TEST_GUIDE.md`** | 통합 테스트 상세 |
| **`QUICK_FIX.md`** | 빠른 문제 해결 |

---

## ⚡ 치트시트

```bash
# 단위 테스트
npm test                        # 전체
npm test types.test.ts          # 특정 파일
npm test -- -t "Type API"       # 특정 describe
npm run test:watch              # Watch 모드
npm run test:coverage           # 커버리지

# 통합 테스트
npm run test:integration        # 전체
npm run test:integration -- eav-workflow.test.ts  # 특정 파일

# 모두 실행
npm run test:all
```

---

**Happy Testing! 🎉**

