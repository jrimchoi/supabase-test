# 🧪 테스트 시스템 개요

## 📊 현재 상태

### ✅ 단위 테스트: 50개 (모두 통과)

```
PASS src/__tests__/api/policies.test.ts (8 tests)
PASS src/__tests__/api/states.test.ts (6 tests)
PASS src/__tests__/api/roles.test.ts (5 tests)
PASS src/__tests__/api/types.test.ts (8 tests)
PASS src/__tests__/api/attributes.test.ts (8 tests)
PASS src/__tests__/api/business-objects.test.ts (7 tests)
PASS src/__tests__/api/business-attributes.test.ts (10 tests)

Test Suites: 7 passed, 7 total
Tests:       50 passed, 50 total
Time:        0.356 s
```

### 📝 통합 테스트: 2개

```
✅ policy-workflow.test.ts - Policy 전체 워크플로우
✅ eav-workflow.test.ts - EAV 패턴 완전 테스트
```

---

## 🎯 테스트 커버리지

### API 리소스별 테스트

| 리소스 | 엔드포인트 | 단위 테스트 | 통합 테스트 |
|--------|-----------|-----------|------------|
| Policy | `/api/policies` | ✅ 8개 | ✅ 포함 |
| State | `/api/states` | ✅ 6개 | ✅ 포함 |
| Role | `/api/roles` | ✅ 5개 | ✅ 포함 |
| Type | `/api/types` | ✅ 8개 | ✅ 포함 |
| Attribute | `/api/attributes` | ✅ 8개 | ✅ 포함 |
| BusinessObject | `/api/business-objects` | ✅ 7개 | ✅ 포함 |
| BusinessAttribute | `/api/business-attributes` | ✅ 10개 | ✅ 포함 |
| StateTransition | `/api/state-transitions` | ⏳ 예정 | - |
| Permission | `/api/permissions` | ⏳ 예정 | - |
| Group | `/api/groups` | ⏳ 예정 | - |
| UserRole | `/api/user-roles` | ⏳ 예정 | - |
| UserGroup | `/api/user-groups` | ⏳ 예정 | - |
| UserPermission | `/api/user-permissions` | ⏳ 예정 | - |

---

## 🚀 빠른 시작

### 1. 의존성 설치 (이미 완료)

```bash
npm install
```

### 2. 단위 테스트 실행

```bash
npm test
```

### 3. 통합 테스트 실행

```bash
# .env.local에서 Direct Connection 설정 필요
npm run test:integration
```

---

## 📁 파일 구조

```
src/__tests__/
├── mocks/
│   └── prisma.ts                    # Prisma Client Mock
├── helpers/
│   └── api.ts                       # createMockRequest, parseResponse 등
├── api/                             # 단위 테스트 (Mock 기반)
│   ├── policies.test.ts
│   ├── states.test.ts
│   ├── roles.test.ts
│   ├── types.test.ts                # V2
│   ├── attributes.test.ts           # V2
│   ├── business-objects.test.ts     # V2
│   └── business-attributes.test.ts  # V2
└── integration/                     # 통합 테스트 (실제 DB)
    ├── policy-workflow.test.ts
    └── eav-workflow.test.ts         # V2

jest.config.js                       # 단위 테스트 설정
jest.setup.js                        # 단위 테스트 환경
jest.integration.config.js           # 통합 테스트 설정
jest.integration.setup.js            # 통합 테스트 환경
```

---

## 🎓 테스트 작성 패턴

### 단위 테스트 템플릿

```typescript
import { prismaMock } from '../mocks/prisma'

jest.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))

import { GET, POST } from '@/app/api/my-resource/route'
import { createMockRequest, parseResponse } from '../helpers/api'

describe('MyResource API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/my-resource', () => {
    it('목록을 반환해야 함', async () => {
      // Given
      prismaMock.myModel.findMany.mockResolvedValue([...])
      const request = createMockRequest({ method: 'GET', url: '/api/my-resource' })

      // When
      const response = await GET(request)
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })
})
```

### 통합 테스트 템플릿

```typescript
import { prisma } from '@/lib/prisma'

describe('My Workflow 통합 테스트', () => {
  let createdData: any[] = []

  afterAll(async () => {
    // 정리
    await prisma.myModel.deleteMany({
      where: { id: { in: createdData.map(d => d.id) } }
    })
    await prisma.$disconnect()
  })

  it('워크플로우 테스트', async () => {
    // 실제 DB 사용
    const data = await prisma.myModel.create({ data: { ... } })
    createdData.push(data)

    // 검증
    expect(data).toBeDefined()
  })
})
```

---

## 📚 테스트 문서

### 필독 문서

1. **`TESTING_GUIDE.md`** ⭐ - 완벽한 가이드 (이 문서)
2. **`QUICK_TEST_GUIDE.md`** ⚡ - 빠른 시작
3. **`TEST_GUIDE.md`** - 기본 가이드
4. **`INTEGRATION_TEST_GUIDE.md`** - 통합 테스트 상세
5. **`INTEGRATION_TEST_TROUBLESHOOTING.md`** - 문제 해결

### 추가 문서

- `QUICK_FIX.md` - 통합 테스트 빠른 수정
- `INSTALL_TESTS.md` - 테스트 환경 설치

---

## 🔧 설정 파일

### package.json

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testPathPattern=__tests__/api",
    "test:integration": "jest --config jest.integration.config.js",
    "test:all": "npm test && npm run test:integration",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### jest.config.js (단위)

```javascript
{
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-node',
  testPathIgnorePatterns: ['/__tests__/integration/'],
  // Mock 사용
}
```

### jest.integration.config.js (통합)

```javascript
{
  setupFilesAfterEnv: ['<rootDir>/jest.integration.setup.js'],
  testEnvironment: 'jest-environment-node',
  testMatch: ['**/__tests__/integration/**/*.test.ts'],
  testTimeout: 30000, // 30초
  // 실제 DB 사용
}
```

---

## ⚠️ 주의사항

### 단위 테스트

- ✅ Mock을 반드시 API import **전에** 설정
- ✅ `beforeEach()`로 Mock 초기화
- ✅ 독립적인 테스트 (서로 영향 없음)

### 통합 테스트

- ⚠️ 실제 DB 사용 (데이터 변경됨)
- ⚠️ `afterAll()`로 정리 필수
- ⚠️ 고유한 이름 사용 (타임스탬프 추가)
- ⚠️ Direct Connection 권장

---

## 🎯 다음 단계

### 추가 테스트 작성

```bash
# 아직 테스트가 없는 API
src/__tests__/api/
├── state-transitions.test.ts (⏳ 예정)
├── permissions.test.ts (⏳ 예정)
├── groups.test.ts (⏳ 예정)
├── user-roles.test.ts (⏳ 예정)
├── user-groups.test.ts (⏳ 예정)
└── user-permissions.test.ts (⏳ 예정)
```

동일한 패턴으로 작성하면 됩니다!

---

**테스트로 코드 품질을 보장하세요! 🚀**

