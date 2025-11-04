# 🧪 완벽한 테스트 가이드

## 📋 목차

1. [단위 테스트 (Unit Tests)](#단위-테스트)
2. [통합 테스트 (Integration Tests)](#통합-테스트)
3. [테스트 실행](#테스트-실행)
4. [테스트 작성](#테스트-작성)
5. [문제 해결](#문제-해결)

---

## 🎯 테스트 전략

### 단위 테스트 vs 통합 테스트

| 구분 | 단위 테스트 | 통합 테스트 |
|------|------------|-------------|
| **대상** | API Route Handler | 전체 워크플로우 |
| **DB 연결** | ❌ Mock 사용 | ✅ 실제 DB |
| **속도** | ⚡ 매우 빠름 (0.3초) | 🐌 느림 (수 초) |
| **격리** | ✅ 완전 격리 | ⚠️ DB 의존 |
| **실행 빈도** | 매번 (개발 중) | 배포 전, 주요 변경 후 |
| **목적** | 로직 검증 | 전체 플로우 검증 |
| **실행 명령** | `npm test` | `npm run test:integration` |

---

## 🔬 단위 테스트

### 📂 구조

```
src/__tests__/
├── mocks/
│   └── prisma.ts           # Prisma Client Mock
├── helpers/
│   └── api.ts              # 테스트 헬퍼 함수
└── api/
    ├── policies.test.ts        # 8 tests
    ├── states.test.ts          # 6 tests
    ├── roles.test.ts           # 5 tests
    ├── types.test.ts           # 8 tests (V2)
    ├── attributes.test.ts      # 8 tests (V2)
    ├── business-objects.test.ts    # 7 tests (V2)
    └── business-attributes.test.ts # 10 tests (V2)
```

### 🎯 현재 상태

```
Test Suites: 7 passed, 7 total
Tests:       50 passed, 50 total
Time:        0.356 s
```

### 🚀 실행 방법

```bash
# 모든 단위 테스트 실행
npm test

# 특정 파일만 실행
npm test policies.test.ts
npm test types.test.ts

# Watch 모드 (개발 중)
npm run test:watch

# 커버리지 확인
npm run test:coverage

# 특정 테스트만
npm test -- -t "모든 Type 목록"
```

### 📝 테스트 패턴

#### Given-When-Then 패턴

```typescript
it('새로운 Type을 생성해야 함', async () => {
  // Given: 테스트 데이터 준비
  const newType = {
    name: 'Invoice',
    policyId: 'policy-123',
  }
  prismaMock.type.create.mockResolvedValue(...)
  const request = createMockRequest({ method: 'POST', url: '/api/types', body: newType })

  // When: API 호출
  const response = await POST(request)
  const data = await parseResponse(response)

  // Then: 결과 검증
  expect(response.status).toBe(201)
  expect(data.success).toBe(true)
  expect(data.data.name).toBe('Invoice')
})
```

### 🛠️ Mock 사용법

```typescript
import { prismaMock } from '../mocks/prisma'

// Prisma Mock 설정 (import 전에!)
jest.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))

// API import (Mock 설정 후)
import { GET, POST } from '@/app/api/types/route'

describe('Type API', () => {
  beforeEach(() => {
    jest.clearAllMocks() // 각 테스트 전 Mock 초기화
  })

  it('테스트', async () => {
    // Mock 데이터 설정
    prismaMock.type.findMany.mockResolvedValue([...])
    
    // API 호출
    const response = await GET(request)
    
    // 검증
    expect(response.status).toBe(200)
  })
})
```

### 📊 테스트 커버리지

#### 현재 커버리지 (50개 테스트)

```
┌─────────────────────┬────────┬──────────┬─────────┬─────────┐
│ File                │ % Stmts│ % Branch │ % Funcs │ % Lines │
├─────────────────────┼────────┼──────────┼─────────┼─────────┤
│ All files           │  85.71 │   80.00  │  88.88  │  85.71  │
│ api/policies        │  92.30 │   85.71  │  100.0  │  92.30  │
│ api/states          │  88.88 │   83.33  │  100.0  │  88.88  │
│ api/types           │  90.00 │   85.00  │  100.0  │  90.00  │
│ api/attributes      │  87.50 │   80.00  │  100.0  │  87.50  │
└─────────────────────┴────────┴──────────┴─────────┴─────────┘

목표: 각 항목 70% 이상
```

---

## 🌐 통합 테스트

### 📂 구조

```
src/__tests__/integration/
└── policy-workflow.test.ts  # 전체 워크플로우 테스트
```

### 🎯 테스트 시나리오

**`policy-workflow.test.ts`**: 전체 시스템 통합 테스트

1. ✅ Role 3개 생성 (Admin, Manager, Developer)
2. ✅ Group 3개 생성 (Engineering, Design, QA)
3. ✅ User 3명 생성 (테스트용 ID)
4. ✅ User에게 Role/Group 할당
5. ✅ Policy 생성
6. ✅ State 5개 생성 (Create → Assign → In Work → Review → Complete)
7. ✅ Permission 할당
8. ✅ Policy 상태별 권한 출력

### 🚀 실행 방법

```bash
# 통합 테스트 실행
npm run test:integration
```

### ⚙️ 사전 준비

#### 1. DATABASE_URL 확인

통합 테스트는 **실제 Supabase DB**를 사용합니다.

`.env.local` 파일:

```bash
# Pooler 연결 (타임아웃 가능)
DATABASE_URL="postgresql://postgres.xxx:pwd@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?schema=public"

# Direct Connection 권장 (통합 테스트용)
DATABASE_URL="postgresql://postgres:pwd@db.xxx.supabase.co:5432/postgres?schema=public"
```

**권장**: 통합 테스트용으로 **Direct Connection** 사용

#### 2. 환경 파일 설정

`jest.integration.setup.js`가 `.env.local`을 자동으로 로드합니다.

### 📝 통합 테스트 예제

```typescript
describe('Policy Workflow 통합 테스트', () => {
  let testPolicy: any
  let testTypes: any[] = []

  // 테스트 후 정리
  afterAll(async () => {
    // 생성된 데이터 삭제
    await prisma.policy.deleteMany({ where: { name: testPolicy.name } })
    await prisma.$disconnect()
  })

  it('전체 워크플로우 테스트', async () => {
    // 1. Policy 생성
    testPolicy = await prisma.policy.create({
      data: { name: 'Test Policy', version: 1 }
    })

    // 2. Type 생성
    const type = await prisma.type.create({
      data: { name: 'Invoice', policyId: testPolicy.id }
    })
    testTypes.push(type)

    // 3. Attribute 정의
    await prisma.attribute.create({
      data: {
        typeId: type.id,
        key: 'amount',
        label: '금액',
        attrType: 'INTEGER',
        isRequired: true,
      }
    })

    // 4. BusinessObject 생성
    const obj = await prisma.businessObject.create({
      data: {
        typeId: type.id,
        policyId: testPolicy.id,
        currentState: 'Draft',
      }
    })

    // 5. BusinessAttribute 값 설정 (EAV)
    await prisma.businessAttribute.create({
      data: {
        objectId: obj.id,
        attributeKey: 'amount',
        valueInteger: 1000000,
      }
    })

    // 6. 검증
    const result = await prisma.businessObject.findUnique({
      where: { id: obj.id },
      include: { attributes: true }
    })

    expect(result?.attributes).toHaveLength(1)
    expect(result?.attributes[0].valueInteger).toBe(1000000)
  })
})
```

---

## 📖 테스트 작성 가이드

### 1️⃣ 단위 테스트 작성

#### Step 1: Mock 설정

```typescript
// src/__tests__/api/my-resource.test.ts
import { prismaMock } from '../mocks/prisma'

jest.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))

import { GET, POST } from '@/app/api/my-resource/route'
import { createMockRequest, parseResponse } from '../helpers/api'
```

#### Step 2: describe 블록 구성

```typescript
describe('MyResource API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/my-resource', () => {
    it('목록을 반환해야 함', async () => {
      // 테스트 작성
    })
  })

  describe('POST /api/my-resource', () => {
    it('생성해야 함', async () => {
      // 테스트 작성
    })
    
    it('에러 케이스', async () => {
      // 에러 테스트
    })
  })
})
```

#### Step 3: Mock 데이터 준비

```typescript
const mockData = {
  id: 'test-1',
  name: 'Test Name',
  createdAt: new Date(),
}

prismaMock.myModel.findMany.mockResolvedValue([mockData])
```

#### Step 4: Request 생성

```typescript
// GET 요청
const request = createMockRequest({
  method: 'GET',
  url: '/api/my-resource',
})

// POST 요청 (Body 포함)
const request = createMockRequest({
  method: 'POST',
  url: '/api/my-resource',
  body: {
    name: 'New Resource',
    value: 123,
  },
})
```

#### Step 5: 검증

```typescript
const response = await GET(request)
const data = await parseResponse(response)

expect(response.status).toBe(200)
expect(data.success).toBe(true)
expect(data.data).toHaveLength(1)
expect(data.data[0].name).toBe('Test Name')
```

---

### 2️⃣ 통합 테스트 작성

#### Step 1: 테스트 파일 생성

```typescript
// src/__tests__/integration/my-workflow.test.ts
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

  it('전체 워크플로우', async () => {
    // 실제 DB를 사용한 테스트
  })
})
```

#### Step 2: 실제 데이터 생성

```typescript
const policy = await prisma.policy.create({
  data: {
    name: `Test_${Date.now()}`, // 고유한 이름
    version: 1,
  }
})
createdData.push(policy)
```

#### Step 3: 관계 테스트

```typescript
// Type 생성
const type = await prisma.type.create({
  data: {
    name: `TestType_${Date.now()}`,
    policyId: policy.id,
  }
})

// Attribute 생성
const attr = await prisma.attribute.create({
  data: {
    typeId: type.id,
    key: 'amount',
    label: '금액',
    attrType: 'INTEGER',
  }
})

// 검증
const typeWithAttrs = await prisma.type.findUnique({
  where: { id: type.id },
  include: { attributes: true }
})

expect(typeWithAttrs?.attributes).toHaveLength(1)
```

---

## 🏃 테스트 실행

### 단위 테스트

```bash
# 모든 단위 테스트
npm test

# 특정 파일
npm test types.test.ts

# Watch 모드 (파일 변경 시 자동 실행)
npm run test:watch

# 커버리지 리포트
npm run test:coverage
# → coverage/ 디렉토리에 HTML 리포트 생성

# 특정 테스트만 (describe 또는 it 이름)
npm test -- -t "Type API"
npm test -- -t "새로운 Type을 생성"

# Verbose 모드
npm test -- --verbose

# 실패한 테스트만 재실행
npm test -- --onlyFailures
```

### 통합 테스트

```bash
# 통합 테스트 실행
npm run test:integration

# 특정 파일만
npm run test:integration -- policy-workflow.test.ts

# Verbose 모드
npm run test:integration -- --verbose
```

### 모든 테스트

```bash
# 단위 + 통합 모두
npm run test:all

# CI 환경용 (커버리지 포함)
npm run test:ci
```

---

## ✍️ 테스트 작성 예제

### 예제 1: Type API 테스트

```typescript
// src/__tests__/api/types.test.ts
import { prismaMock } from '../mocks/prisma'

jest.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))

import { GET, POST } from '@/app/api/types/route'
import { createMockRequest, parseResponse } from '../helpers/api'

describe('Type API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('Type 목록을 반환해야 함', async () => {
    // Given
    const mockTypes = [
      { id: 'type-1', name: 'Invoice', policyId: 'policy-1', createdAt: new Date() }
    ]
    prismaMock.type.findMany.mockResolvedValue(mockTypes as any)
    
    const request = createMockRequest({
      method: 'GET',
      url: '/api/types',
    })

    // When
    const response = await GET(request)
    const data = await parseResponse(response)

    // Then
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toHaveLength(1)
    expect(data.data[0].name).toBe('Invoice')
  })

  it('Type을 생성해야 함', async () => {
    // Given
    const newType = { name: 'Contract', policyId: 'policy-1' }
    const created = { id: 'type-123', ...newType, createdAt: new Date() }
    prismaMock.type.create.mockResolvedValue(created as any)
    
    const request = createMockRequest({
      method: 'POST',
      url: '/api/types',
      body: newType,
    })

    // When
    const response = await POST(request)
    const data = await parseResponse(response)

    // Then
    expect(response.status).toBe(201)
    expect(data.data.name).toBe('Contract')
  })

  it('필수 필드 누락 시 400 에러', async () => {
    // Given
    const request = createMockRequest({
      method: 'POST',
      url: '/api/types',
      body: { name: 'Invoice' }, // policyId 누락
    })

    // When
    const response = await POST(request)
    const data = await parseResponse(response)

    // Then
    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('필수')
  })
})
```

### 예제 2: EAV 패턴 테스트

```typescript
// BusinessAttribute (EAV) 테스트
describe('BusinessAttribute API', () => {
  it('STRING 값을 저장해야 함', async () => {
    // Given
    const newAttr = {
      objectId: 'obj-1',
      attributeKey: 'title',
      valueString: '공급 계약서',
    }
    prismaMock.businessAttribute.create.mockResolvedValue({
      id: 'ba-1',
      ...newAttr,
      valueInteger: null,
      valueReal: null,
      valueDate: null,
      valueBoolean: null,
      valueJson: null,
    } as any)

    const request = createMockRequest({
      method: 'POST',
      url: '/api/business-attributes',
      body: newAttr,
    })

    // When
    const response = await POST(request)
    const data = await parseResponse(response)

    // Then
    expect(response.status).toBe(201)
    expect(data.data.valueString).toBe('공급 계약서')
    expect(data.data.valueInteger).toBeNull()
  })

  it('INTEGER 값을 저장해야 함', async () => {
    // Given
    const newAttr = {
      objectId: 'obj-1',
      attributeKey: 'amount',
      valueInteger: 1000000,
    }
    prismaMock.businessAttribute.create.mockResolvedValue({
      id: 'ba-2',
      ...newAttr,
      valueString: null,
      valueReal: null,
      valueDate: null,
      valueBoolean: null,
      valueJson: null,
    } as any)

    // When & Then
    const response = await POST(request)
    expect(data.data.valueInteger).toBe(1000000)
  })

  it('JSON 값을 저장해야 함', async () => {
    // Given
    const metadata = { tags: ['urgent'], priority: 1 }
    const newAttr = {
      objectId: 'obj-1',
      attributeKey: 'metadata',
      valueJson: metadata,
    }
    // Mock & 검증
  })
})
```

### 예제 3: 통합 테스트 (실제 DB)

```typescript
// src/__tests__/integration/eav-workflow.test.ts
import { prisma } from '@/lib/prisma'

describe('EAV 패턴 통합 테스트', () => {
  let policy: any
  let type: any
  let object: any

  afterAll(async () => {
    // 데이터 정리
    if (policy) await prisma.policy.delete({ where: { id: policy.id } })
    await prisma.$disconnect()
  })

  it('Type → Attribute → BusinessObject → BusinessAttribute 생성', async () => {
    console.log('\n=== EAV 패턴 통합 테스트 ===\n')

    // 1. Policy 생성
    policy = await prisma.policy.create({
      data: { name: `Test_EAV_${Date.now()}`, version: 1 }
    })
    console.log('✅ Policy:', policy.id)

    // 2. Type 생성
    type = await prisma.type.create({
      data: { name: `Invoice_${Date.now()}`, policyId: policy.id }
    })
    console.log('✅ Type:', type.id)

    // 3. Attribute 정의
    const attr = await prisma.attribute.create({
      data: {
        typeId: type.id,
        key: 'totalAmount',
        label: '총 금액',
        attrType: 'INTEGER',
        isRequired: true,
      }
    })
    console.log('✅ Attribute:', attr.key)

    // 4. BusinessObject 생성
    object = await prisma.businessObject.create({
      data: {
        typeId: type.id,
        policyId: policy.id,
        currentState: 'Draft',
      }
    })
    console.log('✅ BusinessObject:', object.id)

    // 5. BusinessAttribute 값 설정
    const value = await prisma.businessAttribute.create({
      data: {
        objectId: object.id,
        attributeKey: 'totalAmount',
        valueInteger: 5000000,
      }
    })
    console.log('✅ Value:', value.valueInteger)

    // 6. 완전한 조회
    const full = await prisma.businessObject.findUnique({
      where: { id: object.id },
      include: {
        type: { include: { attributes: true } },
        policy: true,
        attributes: true,
      }
    })

    console.log('\n=== 조회 결과 ===')
    console.log('Type:', full?.type.name)
    console.log('Policy:', full?.policy.name)
    console.log('State:', full?.currentState)
    console.log('Attributes:', full?.attributes.length)
    
    full?.attributes.forEach(a => {
      const value = a.valueString || a.valueInteger || a.valueReal || 
                    a.valueDate || a.valueBoolean || JSON.stringify(a.valueJson)
      console.log(`  ${a.attributeKey}: ${value}`)
    })

    // 검증
    expect(full?.type.attributes).toHaveLength(1)
    expect(full?.attributes).toHaveLength(1)
    expect(full?.attributes[0].valueInteger).toBe(5000000)
  })
})
```

---

## 🔧 문제 해결

### 문제 1: "Cannot find module '@/lib/prisma'"

**원인**: 경로 매핑 설정 문제

**해결**:
```javascript
// jest.config.js
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
}

// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 문제 2: Mock이 작동하지 않음

**원인**: Mock을 import 전에 설정하지 않음

**해결**:
```typescript
// ✅ Good: Mock 먼저
import { prismaMock } from '../mocks/prisma'
jest.mock('@/lib/prisma', () => ({ prisma: prismaMock }))
import { GET, POST } from '@/app/api/types/route'

// ❌ Bad: import가 먼저
import { GET, POST } from '@/app/api/types/route'
jest.mock('@/lib/prisma', () => ({ prisma: prismaMock }))
```

### 문제 3: 통합 테스트 DB 연결 실패

**원인**: Pooler 연결 타임아웃

**해결**:
```bash
# .env.local에서 Direct Connection 사용
DATABASE_URL="postgresql://postgres:pwd@db.xxx.supabase.co:5432/postgres?schema=public"
```

**참고**: `QUICK_FIX.md`, `INTEGRATION_TEST_TROUBLESHOOTING.md`

### 문제 4: 테스트 타임아웃

**원인**: 통합 테스트 시간 초과

**해결**:
```javascript
// jest.integration.config.js
testTimeout: 60000, // 60초로 증가
```

---

## 📊 테스트 구조 Best Practices

### 1. 테스트 격리

```typescript
// ✅ Good: 각 테스트가 독립적
describe('API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks() // Mock 초기화
  })

  it('테스트 1', () => {
    const data = { id: '1' } // 테스트 내 데이터
    // ...
  })

  it('테스트 2', () => {
    const data = { id: '2' } // 독립적인 데이터
    // ...
  })
})

// ❌ Bad: 테스트 간 의존성
let sharedId: string

it('생성 테스트', () => {
  sharedId = 'created-id' // 공유 변수 사용
})

it('조회 테스트', () => {
  // sharedId 사용 - 이전 테스트에 의존!
})
```

### 2. 의미 있는 테스트 이름

```typescript
// ✅ Good
it('필수 필드가 없으면 400 에러를 반환해야 함', () => {})
it('Type 목록을 Policy별로 필터링해야 함', () => {})

// ❌ Bad
it('test1', () => {})
it('error case', () => {})
```

### 3. AAA 패턴 (Arrange-Act-Assert)

```typescript
it('테스트', async () => {
  // Arrange (Given): 준비
  const mockData = { ... }
  prismaMock.model.findMany.mockResolvedValue(mockData)
  const request = createMockRequest({ ... })

  // Act (When): 실행
  const response = await GET(request)
  const data = await parseResponse(response)

  // Assert (Then): 검증
  expect(response.status).toBe(200)
  expect(data.success).toBe(true)
})
```

---

## 🎓 고급 테스트 기법

### 1. Snapshot 테스트

```typescript
it('응답 구조가 일정해야 함', async () => {
  const response = await GET(request)
  const data = await parseResponse(response)
  
  expect(data).toMatchSnapshot()
})
```

### 2. Parameterized 테스트

```typescript
const attrTypes = [
  { type: 'STRING', valueField: 'valueString', value: 'test' },
  { type: 'INTEGER', valueField: 'valueInteger', value: 123 },
  { type: 'REAL', valueField: 'valueReal', value: 99.99 },
  { type: 'DATE', valueField: 'valueDate', value: '2024-12-31' },
  { type: 'BOOLEAN', valueField: 'valueBoolean', value: true },
]

attrTypes.forEach(({ type, valueField, value }) => {
  it(`${type} 타입 속성을 생성해야 함`, async () => {
    const body = {
      objectId: 'obj-1',
      attributeKey: 'test',
      [valueField]: value,
    }
    // 테스트 실행
  })
})
```

### 3. Mock 호출 검증

```typescript
it('Prisma가 올바르게 호출되어야 함', async () => {
  await GET(request)
  
  // Mock이 호출되었는지 확인
  expect(prismaMock.type.findMany).toHaveBeenCalled()
  
  // 호출 횟수 확인
  expect(prismaMock.type.findMany).toHaveBeenCalledTimes(1)
  
  // 호출 인자 확인
  expect(prismaMock.type.findMany).toHaveBeenCalledWith({
    where: { policyId: 'policy-123' },
    orderBy: { name: 'asc' },
  })
})
```

---

## 📋 체크리스트

### 단위 테스트 작성 시

- [ ] Mock 먼저 import
- [ ] `jest.mock()` 설정
- [ ] API Route Handler import
- [ ] `beforeEach()`로 Mock 초기화
- [ ] Given-When-Then 패턴 사용
- [ ] 성공 케이스 테스트
- [ ] 에러 케이스 테스트 (400, 404, 500)
- [ ] 필터링/옵션 테스트

### 통합 테스트 작성 시

- [ ] `.env.local` Direct Connection 설정
- [ ] 고유한 테스트 데이터 (타임스탬프 사용)
- [ ] `afterAll()`로 데이터 정리
- [ ] 트랜잭션 사용 고려
- [ ] 충분한 타임아웃 설정
- [ ] 콘솔 로그로 진행상황 출력
- [ ] 관계 테스트
- [ ] 실제 워크플로우 검증

---

## 📚 관련 파일

### 설정 파일
- `jest.config.js` - 단위 테스트 설정
- `jest.setup.js` - 단위 테스트 환경
- `jest.integration.config.js` - 통합 테스트 설정
- `jest.integration.setup.js` - 통합 테스트 환경

### 헬퍼 파일
- `src/__tests__/mocks/prisma.ts` - Prisma Mock
- `src/__tests__/helpers/api.ts` - 테스트 헬퍼

### 문서
- `TEST_GUIDE.md` - 기본 테스트 가이드
- `INTEGRATION_TEST_GUIDE.md` - 통합 테스트 상세
- `INTEGRATION_TEST_TROUBLESHOOTING.md` - 문제 해결

---

## 🎯 빠른 참조

### 단위 테스트 (Mock)

```bash
npm test                    # 모든 테스트
npm test types.test.ts      # 특정 파일
npm run test:watch          # Watch 모드
npm run test:coverage       # 커버리지
```

### 통합 테스트 (실제 DB)

```bash
# 1. .env.local 확인 (Direct Connection)
# 2. 테스트 실행
npm run test:integration

# 3. 특정 파일만
npm run test:integration -- policy-workflow.test.ts
```

### 테스트 작성

```typescript
// 1. Mock import
import { prismaMock } from '../mocks/prisma'

// 2. Mock 설정
jest.mock('@/lib/prisma', () => ({ prisma: prismaMock }))

// 3. API import
import { GET, POST } from '@/app/api/types/route'

// 4. 테스트 작성
describe('API', () => {
  beforeEach(() => jest.clearAllMocks())
  
  it('테스트', async () => {
    // Given-When-Then
  })
})
```

---

**Happy Testing! 🧪🚀**

