# Team Workflow 데이터베이스 모델 가이드

> **버전**: 2.0  
> **작성일**: 2025-11-02  
> **데이터베이스**: PostgreSQL (Supabase)  
> **ORM**: Prisma Client

---

## 📋 목차

1. [개요](#개요)
2. [데이터 모델 구조](#데이터-모델-구조)
3. [Policy & State 관리](#policy--state-관리)
4. [Type 시스템 (계층 구조)](#type-시스템-계층-구조)
5. [Attribute 시스템](#attribute-시스템)
6. [BusinessObject (EAV 패턴)](#businessobject-eav-패턴)
7. [리비전 자동 할당](#리비전-자동-할당)
8. [권한 관리](#권한-관리)
9. [삭제 제약 (Restrict)](#삭제-제약-restrict)
10. [마이그레이션 가이드](#마이그레이션-가이드)

---

## 개요

### 시스템 아키텍처

**Team Workflow**는 Policy 기반 권한 관리 시스템으로, 다음 핵심 개념을 구현합니다:

1. **Policy 기반 워크플로우**
   - Policy: 비즈니스 정책 정의
   - State: Policy 내 상태 (Draft, Review, Approved 등)
   - StateTransition: State 간 전이 관계
   - Permission: State별 권한 (Role/Group/User)

2. **Type 시스템**
   - Type: 비즈니스 타입 정의 (계층 구조)
   - Attribute: 공통 속성 정의
   - TypeAttribute: Type-Attribute 매핑

3. **EAV 패턴 (JSON 방식)**
   - BusinessObject: 비즈니스 객체 인스턴스
   - data 필드: JSONB로 실제 속성 값 저장

4. **리비전 시스템**
   - Policy의 revisionSequence 기반
   - 자동 순환 할당 (A → B → C → A...)
   - 동일 Name, 다른 Revision

---

## 데이터 모델 구조

### ERD (Entity Relationship Diagram)

```
┌─────────────────────────────────────────────────────────────┐
│                    Policy 기반 시스템                         │
└─────────────────────────────────────────────────────────────┘

Policy (1) ────┬──── (N) State
               │         │
               │         ├──── (N) StateTransition
               │         └──── (N) Permission
               │
               ├──── (N) PolicyType ──── (N) Type
               │
               ├──── (1) Type (기본 Policy)
               │         │
               │         ├──── (N) TypeAttribute ──── (N) Attribute
               │         └──── (N) BusinessObject
               │
               └──── (N) BusinessObject


Permission ──── Role ──── (N) UserRole ──── User (auth.users)
            │
            └── Group ──── (N) UserGroup ──── User (auth.users)
```

### 테이블 개수
- **핵심 테이블**: 8개
  - Policy, State, Type, Attribute, BusinessObject, Role, Group, Permission
- **매핑 테이블**: 6개
  - StateTransition, PolicyType, TypeAttribute, UserRole, UserGroup
- **총**: 14개 테이블

---

## Policy & State 관리

### Policy 테이블

**목적**: 비즈니스 정책 정의 및 리비전 관리

```prisma
model Policy {
  id               String   @id @default(cuid())
  name             String   @unique              // 고유 이름
  description      String?
  revisionSequence String   @default("A,B,C")    // 리비전 순서
  isActive         Boolean  @default(true)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  createdBy        String?
  updatedBy        String?

  // 관계
  states          State[]
  policyTypes     PolicyType[]  // Type과 Many-to-Many
  types           Type[]        // Type의 기본 Policy
  businessObjects BusinessObject[]

  @@index([isActive])
  @@index([createdAt])
}
```

**주요 특징**:
- ✅ **name unique**: 각 Policy는 고유한 이름
- ✅ **revisionSequence**: BusinessObject 리비전 순서 (예: "A,B,C,D,E")
- ✅ **isActive**: 활성화 플래그

**사용 예시**:
```typescript
// Policy 생성
const policy = await prisma.policy.create({
  data: {
    name: '송장_관리_정책',
    description: '송장 문서 관리',
    revisionSequence: 'A,B,C',
    isActive: true,
  },
})

// Type 검색 및 연결 (Many-to-Many)
const types = await searchTypes('invoice')
await prisma.policyType.create({
  data: { policyId: policy.id, typeId: types[0].id },
})
```

---

### State 테이블

**목적**: Policy 내의 상태 정의

```prisma
model State {
  id          String   @id @default(cuid())
  policyId    String
  name        String
  description String?
  order       Int              // 상태 순서 (Diagram 표시용)
  isInitial   Boolean  @default(false)  // 초기 상태
  isFinal     Boolean  @default(false)  // 최종 상태
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // 관계
  policy          Policy            @relation(..., onDelete: Restrict)
  fromTransitions StateTransition[] @relation("FromState")
  toTransitions   StateTransition[] @relation("ToState")
  permissions     Permission[]

  @@unique([policyId, name])
  @@index([policyId])
  @@index([order])
}
```

**주요 특징**:
- ✅ **(policyId, name) unique**: 같은 Policy 내 State name 고유
- ✅ **order**: State Diagram 순서
- ✅ **isInitial/isFinal**: 워크플로우 시작/종료 상태

**사용 예시**:
```typescript
// State 생성 (워크플로우)
const states = await Promise.all([
  prisma.state.create({
    data: {
      policyId: policy.id,
      name: 'Draft',
      order: 1,
      isInitial: true,
    },
  }),
  prisma.state.create({
    data: {
      policyId: policy.id,
      name: 'Review',
      order: 2,
    },
  }),
  prisma.state.create({
    data: {
      policyId: policy.id,
      name: 'Approved',
      order: 3,
      isFinal: true,
    },
  }),
])
```

---

### StateTransition 테이블

**목적**: State 간 전이 관계 (다중 next state 지원)

```prisma
model StateTransition {
  id          String   @id @default(cuid())
  fromStateId String
  toStateId   String
  condition   String?  // Expression (전이 조건)
  order       Int?     // 전이 순서
  createdAt   DateTime @default(now())

  // 관계
  fromState State @relation("FromState", ...)
  toState   State @relation("ToState", ...)

  @@unique([fromStateId, toStateId])
  @@index([fromStateId])
  @@index([toStateId])
}
```

**주요 특징**:
- ✅ **다중 next state**: 한 State에서 여러 State로 전이 가능
- ✅ **condition**: Expression 평가 (예: `user.role === "Manager"`)

**사용 예시**:
```typescript
// Draft → Review → Approved
await prisma.stateTransition.createMany({
  data: [
    { fromStateId: draft.id, toStateId: review.id },
    { 
      fromStateId: review.id, 
      toStateId: approved.id,
      condition: 'user.role === "Manager"',
    },
  ],
})
```

---

## Type 시스템 (계층 구조)

### Type 테이블

**목적**: 비즈니스 타입 정의 (계층 구조, 속성 상속)

```prisma
model Type {
  id          String   @id @default(cuid())
  type        String   @unique           // 고유 타입 (예: "invoice")
  name        String?                    // 사용자 친화적 이름 (상속 가능)
  prefix      String?                    // 접두사 (예: "INV", 상속 가능)
  description String?
  
  // 기본 Policy (리비전용)
  policyId    String
  policy      Policy   @relation(..., onDelete: Restrict)
  
  // 계층 구조 (self-referencing)
  parentId    String?
  parent      Type?    @relation("TypeHierarchy", ...)
  children    Type[]   @relation("TypeHierarchy")
  
  // 관계
  typeAttributes TypeAttribute[]
  policyTypes    PolicyType[]
  objects        BusinessObject[]

  @@index([type])
  @@index([policyId])
  @@index([parentId])
}
```

**주요 특징**:
- ✅ **type unique**: 고유한 타입 식별자
- ✅ **계층 구조**: Parent-Child 관계
- ✅ **속성 상속**: prefix, name이 없으면 부모로부터 상속
- ✅ **policyId**: 기본 Policy (리비전 자동 할당용)

**사용 예시**:
```typescript
// 부모 Type
const document = await prisma.type.create({
  data: {
    type: 'document',
    name: '문서',
    prefix: 'DOC',
    policyId: policy.id,
  },
})

// 자식 Type (상속)
const invoice = await prisma.type.create({
  data: {
    type: 'invoice',
    name: '송장',
    prefix: 'INV',      // 자체 prefix
    policyId: policy.id,
    parentId: document.id,
  },
})

// 손자 Type (prefix 상속)
const taxInvoice = await prisma.type.create({
  data: {
    type: 'tax-invoice',
    name: '세금 계산서',
    prefix: null,       // → 부모(invoice)의 "INV" 상속
    policyId: policy.id,
    parentId: invoice.id,
  },
})
```

**상속 유틸리티** (`src/lib/business-type-utils.ts`):
```typescript
import { getInheritedTypeAttributes } from '@/lib/business-type-utils'

const attrs = await getInheritedTypeAttributes(typeId)
// { prefix: 'INV', name: '송장' }
```

---

### PolicyType 테이블 (Many-to-Many)

**목적**: Policy와 Type의 다대다 관계

```prisma
model PolicyType {
  id        String   @id @default(cuid())
  policyId  String
  typeId    String
  createdAt DateTime @default(now())

  // 관계
  policy Policy @relation(..., onDelete: Restrict)
  type   Type   @relation(..., onDelete: Restrict)

  @@unique([policyId, typeId])
  @@index([policyId])
  @@index([typeId])
}
```

**주요 특징**:
- ✅ **Many-to-Many**: 한 Policy에 여러 Type, 한 Type에 여러 Policy
- ✅ **unique 제약**: 중복 연결 방지

**사용 예시**:
```typescript
// Policy에서 Type 검색 및 추가
const types = await searchTypes('invoice')  // 2글자 이상
await prisma.policyType.create({
  data: {
    policyId: 'policy-123',
    typeId: types[0].id,
  },
})

// Policy의 모든 Type 조회
const policyWithTypes = await prisma.policy.findUnique({
  where: { id: 'policy-123' },
  include: {
    policyTypes: {
      include: { type: true },
    },
  },
})
```

---

## Attribute 시스템

### Attribute 테이블

**목적**: 공통 속성 정의 (재사용 가능)

```prisma
model Attribute {
  id          String   @id @default(cuid())
  key         String   @unique           // 고유 키 (camelCase)
  label       String                     // 사용자 친화적 라벨
  description String?
  attrType    AttrType                   // 속성 타입 (ENUM)
  isRequired  Boolean  @default(false)   // 필수 여부
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // 관계
  typeAttributes TypeAttribute[]

  @@index([key])
  @@index([attrType])
}

enum AttrType {
  STRING
  INTEGER
  REAL
  DATE
  BOOLEAN
  JSON
  ENUM
}
```

**주요 특징**:
- ✅ **key unique**: 전역 고유 키
- ✅ **7가지 AttrType**: STRING, INTEGER, REAL, DATE, BOOLEAN, JSON, ENUM
- ✅ **isRequired**: 필수 항목 플래그

**사용 예시**:
```typescript
// Attribute 생성
const invoiceNumber = await prisma.attribute.create({
  data: {
    key: 'invoiceNumber',
    label: '송장 번호',
    description: '고유 송장 식별 번호',
    attrType: 'STRING',
    isRequired: true,
  },
})

const amount = await prisma.attribute.create({
  data: {
    key: 'amount',
    label: '금액',
    description: '송장 총액 (원)',
    attrType: 'INTEGER',
    isRequired: true,
  },
})
```

---

### TypeAttribute 테이블

**목적**: Type과 Attribute 매핑 (Many-to-Many)

```prisma
model TypeAttribute {
  id          String   @id @default(cuid())
  typeId      String
  attributeId String
  createdAt   DateTime @default(now())

  // 관계
  type      Type      @relation(..., onDelete: Cascade)
  attribute Attribute @relation(..., onDelete: Cascade)

  @@unique([typeId, attributeId])
  @@index([typeId])
  @@index([attributeId])
}
```

**사용 예시**:
```typescript
// Type에 Attribute 추가
await prisma.typeAttribute.createMany({
  data: [
    { typeId: invoice.id, attributeId: invoiceNumber.id },
    { typeId: invoice.id, attributeId: amount.id },
    { typeId: invoice.id, attributeId: customerName.id },
  ],
})

// Type의 모든 Attribute 조회
const typeWithAttrs = await prisma.type.findUnique({
  where: { id: invoice.id },
  include: {
    typeAttributes: {
      include: { attribute: true },
    },
  },
})
```

---

## BusinessObject (EAV 패턴)

### BusinessObject 테이블

**목적**: 비즈니스 객체 인스턴스 (Type의 실제 데이터)

```prisma
model BusinessObject {
  id           String   @id @default(cuid())
  typeId       String?
  name         String?              // 예: INV-2025-001
  revision     String?              // 예: A, B, C
  policyId     String
  currentState String
  description  String?
  owner        String?              // auth.users.id
  createdBy    String?
  updatedBy    String?
  data         Json?                // 실제 데이터 (JSONB)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // 관계
  type   Type?   @relation(..., onDelete: Restrict)
  policy Policy  @relation(..., onDelete: Restrict)

  @@unique([typeId, name, revision])
  @@index([typeId])
  @@index([policyId])
  @@index([currentState])
}
```

**주요 특징**:
- ✅ **(typeId, name, revision) unique**: 동일 Name의 여러 Revision 가능
- ✅ **data (JSONB)**: 실제 속성 값 저장
- ✅ **자동 할당**: typeId → policyId, revision (Prisma Middleware)

---

### EAV 패턴 (JSON 방식)

#### 아키텍처

**메타데이터 계층 (스키마)**:
- Type: 비즈니스 타입 정의
- Attribute: 공통 속성 정의
- TypeAttribute: Type-Attribute 연결

**데이터 계층 (인스턴스)**:
- BusinessObject: 실제 객체
  - `typeId`: Type 참조 (스키마)
  - `data`: 속성 값 JSON 저장

#### JSON 방식의 장점

| 항목 | 전통적 EAV | JSON (data 필드) |
|------|------------|------------------|
| 구조 | 복잡 (N행) | ✅ 간단 (1행) |
| 성능 | 느림 (JOIN) | ✅ 빠름 |
| 쿼리 | 어려움 | ✅ JSONB 함수 |
| 유연성 | 높음 | ✅ 매우 높음 |

#### 사용 예시

```typescript
// 1. Type/Attribute 정의 (스키마)
const invoiceType = await prisma.type.create({
  data: { type: 'invoice', policyId: 'policy1' },
})

await prisma.typeAttribute.createMany({
  data: [
    { typeId: invoiceType.id, attributeId: invoiceNumber.id },
    { typeId: invoiceType.id, attributeId: amount.id },
  ],
})

// 2. BusinessObject 생성 (data 필드에 JSON)
const obj = await prisma.businessObject.create({
  data: {
    typeId: invoiceType.id,
    name: '송장-2025-001',
    currentState: 'Draft',
    data: {
      invoiceNumber: 'INV-2025-001',
      amount: 5000000,
      customerName: 'ABC 주식회사',
      isPaid: false,
      metadata: {
        department: 'Sales',
        priority: 'high',
      },
    },
  },
})

// 3. 조회 및 검증
const retrieved = await prisma.businessObject.findUnique({
  where: { id: obj.id },
  include: {
    type: {
      include: {
        typeAttributes: {
          include: { attribute: true },
        },
      },
    },
  },
})

// 스키마 확인
retrieved.type.typeAttributes.forEach((ta) => {
  console.log(`${ta.attribute.label}: ${ta.attribute.attrType}`)
})

// 데이터 사용
const data = retrieved.data as Record<string, any>
console.log(data.invoiceNumber)  // 'INV-2025-001'
console.log(data.amount)         // 5000000
```

#### PostgreSQL JSONB 쿼리

```sql
-- 특정 속성 값으로 검색
SELECT * FROM "BusinessObject" 
WHERE data->>'invoiceNumber' = 'INV-2025-001';

-- 숫자 범위 검색
SELECT * FROM "BusinessObject" 
WHERE (data->>'amount')::int > 1000000;

-- JSONB 인덱스 생성 (성능 최적화)
CREATE INDEX idx_business_object_data 
  ON "BusinessObject" USING GIN (data);

-- JSON 경로 검색 (중첩 객체)
SELECT * FROM "BusinessObject" 
WHERE data->'metadata'->>'department' = 'Sales';
```

---

## 리비전 자동 할당

### 개요

**BusinessObject의 리비전을 Policy 기반으로 자동 할당**

- Policy의 `revisionSequence` 기준
- 동일 Name의 최신 Revision 조회
- 순환 할당 (A → B → C → A...)

### Prisma Middleware

**위치**: `src/lib/prisma/middleware.ts`

```typescript
import { Prisma } from '@prisma/client'
import { getInheritedTypeAttributes } from '../business-type-utils'

export const businessObjectMiddleware: Prisma.Middleware = async (params, next) => {
  if (params.model === 'BusinessObject' && params.action === 'create') {
    const { typeId } = params.args.data

    // 1. Type의 Policy 가져오기
    if (typeId && !params.args.data.policyId) {
      const type = await prisma.type.findUnique({
        where: { id: typeId },
        select: { policyId: true },
      })
      params.args.data.policyId = type.policyId
    }

    // 2. Name 자동 생성 (prefix-timestamp-random)
    if (typeId && !params.args.data.name) {
      const attrs = await getInheritedTypeAttributes(typeId)
      const prefix = attrs.prefix || 'OBJ'
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0')
      params.args.data.name = `${prefix}-${timestamp}-${random}`
    }

    // 3. Revision 자동 할당 (순환)
    if (typeId && !params.args.data.revision) {
      const { typeId, name, policyId } = params.args.data

      // Policy의 revisionSequence 가져오기
      const policy = await prisma.policy.findUnique({
        where: { id: policyId },
        select: { revisionSequence: true },
      })
      const revisions = policy.revisionSequence.split(',').map(r => r.trim())

      // 동일 Name의 최신 Revision 찾기
      const latest = await prisma.businessObject.findFirst({
        where: { typeId, name },
        orderBy: { createdAt: 'desc' },
        select: { revision: true },
      })

      if (!latest) {
        // 첫 번째 객체 → 첫 번째 revision
        params.args.data.revision = revisions[0]
      } else {
        // 다음 revision 계산 (순환)
        const currentIndex = revisions.indexOf(latest.revision)
        const nextIndex = (currentIndex + 1) % revisions.length
        params.args.data.revision = revisions[nextIndex]
      }
    }
  }

  return next(params)
}
```

### 동작 예시

```typescript
// Policy 생성
const policy = await prisma.policy.create({
  data: {
    name: 'Invoice_Policy',
    revisionSequence: 'A,B,C,D,E',  // 5단계
  },
})

// Type 생성
const type = await prisma.type.create({
  data: {
    type: 'invoice',
    prefix: 'INV',
    policyId: policy.id,
  },
})

// BusinessObject 생성 (자동 할당)
const obj1 = await prisma.businessObject.create({
  data: {
    typeId: type.id,
    name: '송장-001',  // 동일 Name
    currentState: 'draft',
  },
})
// 자동: { policyId: policy.id, revision: 'A' }

const obj2 = await prisma.businessObject.create({
  data: {
    typeId: type.id,
    name: '송장-001',  // 동일 Name
    currentState: 'draft',
  },
})
// 자동: { policyId: policy.id, revision: 'B' } ← 순환!

const obj3 = await prisma.businessObject.create({
  data: {
    typeId: type.id,
    name: '송장-001',
    currentState: 'draft',
  },
})
// 자동: { revision: 'C' }

// ... obj4, obj5 생성 시 D, E

const obj6 = await prisma.businessObject.create({
  data: {
    typeId: type.id,
    name: '송장-001',
    currentState: 'draft',
  },
})
// 자동: { revision: 'A' } ← 순환! (E → A)
```

---

## 권한 관리

### Permission 테이블

**목적**: State별 권한 정의 (User/Role/Group)

```prisma
model Permission {
  id         String   @id @default(cuid())
  stateId    String
  resource   String   // 리소스 타입 (예: "document")
  action     String   // create, view, modify, delete
  
  // 권한 대상 (하나만 선택)
  targetType String   // "user", "role", "group"
  roleId     String?
  groupId    String?
  userId     String?
  
  expression String?  // 조건 (예: "user.department === 'Sales'")
  isAllowed  Boolean  @default(true)
  createdAt  DateTime @default(now())

  // 관계
  state State  @relation(..., onDelete: Cascade)
  role  Role?  @relation(..., onDelete: Cascade)
  group Group? @relation(..., onDelete: Cascade)

  @@index([stateId])
  @@index([targetType])
}
```

**주요 특징**:
- ✅ **targetType**: user, role, group 중 하나
- ✅ **expression**: 조건부 권한 (평가식)
- ✅ **isAllowed**: 허용/거부

**사용 예시**:
```typescript
// Role 기반 권한
await prisma.permission.create({
  data: {
    stateId: draftState.id,
    resource: 'invoice',
    action: 'create',
    targetType: 'role',
    roleId: staffRole.id,
    isAllowed: true,
  },
})

// Group 기반 권한 (조건부)
await prisma.permission.create({
  data: {
    stateId: reviewState.id,
    resource: 'invoice',
    action: 'modify',
    targetType: 'group',
    groupId: managersGroup.id,
    expression: 'user.department === "Finance"',
    isAllowed: true,
  },
})

// User 기반 권한
await prisma.permission.create({
  data: {
    stateId: approvedState.id,
    resource: 'invoice',
    action: 'delete',
    targetType: 'user',
    userId: 'auth-user-123',
    isAllowed: true,
  },
})
```

---

### Role 및 Group

```prisma
model Role {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // 관계
  permissions Permission[]
  userRoles   UserRole[]

  @@index([isActive])
}

model Group {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  parentId    String?              // 계층 구조
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // 관계
  parent      Group?  @relation("GroupHierarchy", ...)
  children    Group[] @relation("GroupHierarchy")
  permissions Permission[]
  userGroups  UserGroup[]

  @@index([isActive])
  @@index([parentId])
}

model UserRole {
  id        String   @id @default(cuid())
  userId    String   // auth.users.id
  roleId    String
  createdAt DateTime @default(now())

  role Role @relation(..., onDelete: Cascade)

  @@unique([userId, roleId])
}

model UserGroup {
  id        String   @id @default(cuid())
  userId    String   // auth.users.id
  groupId   String
  createdAt DateTime @default(now())

  group Group @relation(..., onDelete: Cascade)

  @@unique([userId, groupId])
}
```

---

## 삭제 제약 (Restrict)

### onDelete: Restrict 적용

**변경 사항**: Cascade → Restrict (종속 데이터 보호)

```prisma
// Before (자동 삭제)
policy Policy @relation(..., onDelete: Cascade)

// After (삭제 차단)
policy Policy @relation(..., onDelete: Restrict)
```

### 적용된 관계

| 자식 테이블 | 부모 테이블 | onDelete |
|-----------|-----------|----------|
| State | Policy | Restrict |
| Type | Policy | Restrict |
| PolicyType | Policy | Restrict |
| PolicyType | Type | Restrict |
| BusinessObject | Type | Restrict |
| BusinessObject | Policy | Restrict |

### 동작 방식

```typescript
// Policy 삭제 시도
await prisma.policy.delete({
  where: { id: 'policy-123' },
})

// State가 있으면 에러 발생
// ❌ Error: Foreign key constraint failed
//    Cannot delete Policy because State exists

// 올바른 순서:
// 1. State 모두 삭제
// 2. Type 삭제 또는 다른 Policy로 변경
// 3. BusinessObject 삭제 또는 Type 변경
// 4. Policy 삭제
```

### UI 구현

```typescript
// getDependencies() - 종속 데이터 확인
const deps = await getDependencies(policyId)
// { states: 4, types: 2, businessObjects: 10 }

const hasDependencies = 
  deps.states > 0 || deps.types > 0 || deps.businessObjects > 0

// 삭제 버튼 비활성화
<Button
  variant="destructive"
  disabled={hasDependencies}
>
  삭제
</Button>

// Alert 메시지
{hasDependencies && (
  <Alert variant="destructive">
    <AlertTitle>삭제 불가: 종속 데이터 존재</AlertTitle>
    <AlertDescription>
      <ul>
        <li>State: {deps.states}개 → 삭제 필요</li>
        <li>Type: {deps.types}개 → 삭제 또는 다른 Policy로 변경</li>
        <li>BusinessObject: {deps.businessObjects}개 → 삭제 또는 Type 변경</li>
      </ul>
    </AlertDescription>
  </Alert>
)}
```

---

## 마이그레이션 가이드

### 초기 데이터베이스 설정

```bash
# 1. Supabase SQL Editor에서 실행
# 또는 psql 사용

psql $DATABASE_URL -f prisma/init-v2.sql
```

**`prisma/init-v2.sql` 내용**:
1. ENUM 타입 생성 (AttrType)
2. 테이블 생성 (14개)
3. Foreign Key 제약 조건
4. 인덱스 생성
5. 샘플 데이터 (선택적)

### Prisma Client 생성

```bash
npx prisma generate
```

### 스키마 변경 시

```bash
# 1. schema.prisma 수정
# 2. Prisma Client 재생성
npx prisma generate

# 3. SQL 마이그레이션 파일 생성 (수동)
# prisma/migrations/YYYYMMDD_description.sql

# 4. Supabase에서 실행
psql $DATABASE_URL -f prisma/migrations/YYYYMMDD_description.sql
```

---

## 주요 제약 조건

### Unique 제약

| 테이블 | Unique 컬럼 | 설명 |
|--------|------------|------|
| Policy | name | Policy 이름 고유 |
| State | (policyId, name) | Policy 내 State 고유 |
| Type | type | Type 식별자 고유 |
| Attribute | key | Attribute 키 고유 |
| BusinessObject | (typeId, name, revision) | Type+Name+Revision 조합 고유 |
| Role | name | Role 이름 고유 |
| Group | name | Group 이름 고유 |
| StateTransition | (fromStateId, toStateId) | 중복 Transition 방지 |
| PolicyType | (policyId, typeId) | 중복 연결 방지 |
| TypeAttribute | (typeId, attributeId) | 중복 할당 방지 |
| UserRole | (userId, roleId) | 중복 Role 방지 |
| UserGroup | (userId, groupId) | 중복 Group 방지 |

### Index

**성능 최적화를 위한 인덱스**:
- Policy: isActive, createdAt
- State: policyId, order
- Type: type, policyId, parentId
- BusinessObject: typeId, policyId, currentState, (typeId, policyId, name, revision)
- Permission: stateId, targetType

---

## 데이터베이스 다이어그램

### 전체 구조

```
┌────────────────────────────────────────────────────────────────┐
│                     Policy 기반 권한 시스템                      │
└────────────────────────────────────────────────────────────────┘

Policy (이름 unique)
  │
  ├─── State (Policy 내 name unique)
  │     │
  │     ├─── StateTransition (fromState ↔ toState unique)
  │     │
  │     └─── Permission
  │           │
  │           ├─── Role ─── UserRole ─── User (auth.users)
  │           │
  │           └─── Group (계층) ─── UserGroup ─── User
  │
  ├─── PolicyType ─── Type (type unique, 계층 구조)
  │                    │
  │                    ├─── TypeAttribute ─── Attribute (key unique)
  │                    │
  │                    └─── BusinessObject (typeId+name+revision unique)
  │
  └─── Type (기본 Policy)
        └─── BusinessObject
```

### 계층 구조

**Type 계층**:
```
document (prefix: DOC)
  └── invoice (prefix: INV)
       └── tax-invoice (prefix: null → INV 상속)
```

**Group 계층**:
```
Engineering
  └── Frontend Team
       └── React Team
```

---

## 성능 최적화

### JSONB 인덱스

```sql
-- BusinessObject.data 인덱스 (GIN)
CREATE INDEX idx_business_object_data 
  ON "BusinessObject" USING GIN (data);

-- 특정 필드 인덱스
CREATE INDEX idx_business_object_invoice_number 
  ON "BusinessObject" ((data->>'invoiceNumber'));
```

### 복합 인덱스

```sql
-- BusinessObject 조회 최적화
CREATE INDEX idx_business_object_lookup 
  ON "BusinessObject"("typeId", "policyId", "name", "revision");

-- State 조회 최적화
CREATE INDEX idx_state_policy_order 
  ON "State"("policyId", "order");
```

### 쿼리 최적화

```typescript
// ❌ N+1 문제
const objects = await prisma.businessObject.findMany()
for (const obj of objects) {
  const type = await prisma.type.findUnique({ where: { id: obj.typeId } })
}

// ✅ include로 한 번에
const objects = await prisma.businessObject.findMany({
  include: {
    type: true,
    policy: true,
  },
})
```

---

## 참고 문서

### Prisma 관련
- **Schema**: `prisma/schema.prisma`
- **SQL**: `prisma/init-v2.sql`
- **Middleware**: `src/lib/prisma/middleware.ts`
- **Utilities**: `src/lib/business-type-utils.ts`

### 마이그레이션
- **리비전 시스템**: `prisma/migrations/add_business_type_revision.sql`
- **Policy-Type M:N**: `prisma/migrate-policy-type-many-to-many.sql`

### 가이드
- **Prisma**: `prisma/README.md`
- **ENV Setup**: `prisma/ENV_SETUP.md`
- **Troubleshooting**: `prisma/TROUBLESHOOTING.md`

---

**문서 버전**: 1.0  
**마지막 업데이트**: 2025-11-02  
**담당자**: Development Team

