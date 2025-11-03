# 🧪 API 테스트 가이드

## 📋 개요

이 프로젝트는 Jest를 사용한 Next.js API Route 테스트를 제공합니다.

## 🚀 빠른 시작

### 1. 테스트 의존성 설치

```bash
npm install
```

### 2. 테스트 실행

```bash
# 모든 테스트 실행
npm test

# Watch 모드 (개발 중)
npm run test:watch

# 커버리지 확인
npm run test:coverage

# CI 환경 (GitHub Actions 등)
npm run test:ci
```

---

## 📂 테스트 파일 구조

```
src/__tests__/
├── mocks/
│   └── prisma.ts               # Prisma Client Mock
├── helpers/
│   └── api.ts                  # API 테스트 헬퍼 함수
└── api/
    ├── policies.test.ts        # Policy API 테스트
    ├── states.test.ts          # State API 테스트
    ├── roles.test.ts           # Role API 테스트
    ├── groups.test.ts          # Group API 테스트
    ├── permissions.test.ts     # Permission API 테스트
    ├── user-roles.test.ts      # UserRole API 테스트
    ├── user-groups.test.ts     # UserGroup API 테스트
    └── user-permissions.test.ts # UserPermission API 테스트
```

---

## 🧩 테스트 구조

### Given-When-Then 패턴 사용

```typescript
describe('Policy API', () => {
  describe('GET /api/policies', () => {
    it('모든 Policy 목록을 반환해야 함', async () => {
      // Given: 테스트 데이터 준비
      const mockPolicies = [...]
      prismaMock.policy.findMany.mockResolvedValue(mockPolicies)
      const request = createMockRequest({ ... })

      // When: API 호출
      const response = await GET(request)
      const data = await parseResponse(response)

      // Then: 결과 검증
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })
})
```

---

## 🛠️ 테스트 작성 가이드

### 1. Mock 데이터 생성

```typescript
import { prismaMock } from '../mocks/prisma'

// Prisma 메서드 Mock
prismaMock.policy.findMany.mockResolvedValue([
  {
    id: 'policy-1',
    name: '정책 1',
    // ... 필드
  }
])
```

### 2. Request 생성

```typescript
import { createMockRequest } from '../helpers/api'

// GET 요청
const request = createMockRequest({
  method: 'GET',
  url: '/api/policies',
})

// POST 요청 (Body 포함)
const request = createMockRequest({
  method: 'POST',
  url: '/api/policies',
  body: {
    name: '새 정책',
    description: '설명',
  },
})
```

### 3. Params 생성 (Dynamic Route)

```typescript
import { createMockParams } from '../helpers/api'

const params = createMockParams({ id: 'policy-123' })
const response = await GET_BY_ID(request, { params })
```

### 4. 응답 검증

```typescript
import { parseResponse } from '../helpers/api'

const response = await GET(request)
const data = await parseResponse(response)

expect(response.status).toBe(200)
expect(data.success).toBe(true)
expect(data.data).toHaveLength(2)
```

---

## ✅ 테스트 커버리지

### 목표 커버리지

```javascript
// jest.config.js
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70,
  },
}
```

### 커버리지 확인

```bash
npm run test:coverage

# 출력:
File             | % Stmts | % Branch | % Funcs | % Lines
-----------------|---------|----------|---------|--------
All files        |   85.71 |    80.00 |   88.88 |   85.71
 api/policies    |   92.30 |    85.71 |   100.0 |   92.30
 api/states      |   88.88 |    83.33 |   100.0 |   88.88
 ...
```

---

## 🧪 테스트 시나리오

### Policy API 테스트

#### ✅ 성공 케이스
- [x] GET /api/policies - 목록 조회
- [x] GET /api/policies?include=states - States 포함 조회
- [x] POST /api/policies - Policy 생성
- [x] GET /api/policies/:id - 단일 조회
- [x] PATCH /api/policies/:id - Policy 수정
- [x] DELETE /api/policies/:id - Policy 삭제

#### ❌ 실패 케이스
- [x] POST - name 누락 시 400 에러
- [x] GET /:id - 존재하지 않는 Policy 404 에러

### State API 테스트

#### ✅ 성공 케이스
- [x] GET /api/states - 목록 조회
- [x] GET /api/states?policyId=xxx - 필터링
- [x] POST /api/states - State 생성
- [x] PATCH /api/states/:id - State 수정
- [x] DELETE /api/states/:id - State 삭제

#### ❌ 실패 케이스
- [x] POST - 필수 필드 누락 시 400 에러

### Role/Group/Permission API 테스트
- 동일한 패턴으로 CRUD 테스트 커버

---

## 🔍 디버깅 팁

### 1. 특정 테스트만 실행

```bash
# 파일 단위
npm test policies.test.ts

# describe 블록
npm test -- -t "Policy API"

# it 블록
npm test -- -t "모든 Policy 목록을 반환"
```

### 2. 콘솔 로그 확인

```typescript
it('테스트', async () => {
  console.log('Request:', request)
  const response = await GET(request)
  console.log('Response:', await parseResponse(response))
  
  expect(response.status).toBe(200)
})
```

### 3. Mock 호출 확인

```typescript
it('Prisma 호출 확인', async () => {
  await GET(request)
  
  // Mock이 호출되었는지 확인
  expect(prismaMock.policy.findMany).toHaveBeenCalled()
  
  // 호출 횟수 확인
  expect(prismaMock.policy.findMany).toHaveBeenCalledTimes(1)
  
  // 호출 인자 확인
  expect(prismaMock.policy.findMany).toHaveBeenCalledWith({
    include: { states: true },
    orderBy: { createdAt: 'desc' },
  })
})
```

---

## 🎯 Best Practices

### 1. 테스트는 독립적이어야 함

```typescript
// ❌ Bad: 이전 테스트에 의존
let policyId: string

it('Policy 생성', () => {
  policyId = 'policy-123'
})

it('Policy 조회', () => {
  // policyId 사용 - 의존성 발생!
})

// ✅ Good: 각 테스트가 독립적
it('Policy 조회', () => {
  const policyId = 'policy-123'
  // ...
})
```

### 2. describe로 논리적으로 그룹화

```typescript
describe('Policy API', () => {
  describe('GET /api/policies', () => {
    it('성공 케이스 1', () => {})
    it('성공 케이스 2', () => {})
  })
  
  describe('POST /api/policies', () => {
    it('성공 케이스', () => {})
    it('실패 케이스', () => {})
  })
})
```

### 3. 의미 있는 테스트 이름

```typescript
// ❌ Bad
it('test1', () => {})

// ✅ Good
it('name이 없으면 400 에러를 반환해야 함', () => {})
```

### 4. beforeEach로 공통 설정

```typescript
describe('Policy API', () => {
  beforeEach(() => {
    // 각 테스트 전에 Mock 초기화
    jest.clearAllMocks()
  })
  
  it('테스트 1', () => {})
  it('테스트 2', () => {})
})
```

---

## 🚨 일반적인 문제 해결

### 문제 1: "Cannot find module '@/lib/prisma'"

**해결**:
```bash
# tsconfig.json paths 설정 확인
# jest.config.js moduleNameMapper 확인
```

### 문제 2: Mock이 작동하지 않음

**해결**:
```typescript
// 테스트 파일 맨 위에서 Mock import
import { prismaMock } from '../mocks/prisma'

// beforeEach에서 Mock 초기화
beforeEach(() => {
  jest.clearAllMocks()
})
```

### 문제 3: "ReferenceError: Request is not defined"

**해결**:
```javascript
// jest.config.js
testEnvironment: 'node', // 'jsdom'이 아닌 'node' 사용
```

---

## 📚 참고 자료

- [Jest 공식 문서](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Next.js Testing](https://nextjs.org/docs/app/building-your-application/testing/jest)
- [jest-mock-extended](https://github.com/marchaos/jest-mock-extended)

---

## 🎓 추가 학습 자료

### 통합 테스트 (E2E)
- Playwright 또는 Cypress 사용
- 실제 데이터베이스와 연동

### 성능 테스트
- Jest Performance Testing
- Artillery, k6 등

### CI/CD 통합
- GitHub Actions
- GitLab CI
- Jenkins

---

**Happy Testing! 🧪**

