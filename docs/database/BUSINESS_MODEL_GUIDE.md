# 📊 Business Type & Object 가이드

## 🎯 개요

비즈니스 타입과 객체를 관리하는 시스템입니다.

- **Type**: 비즈니스 유형 정의 (예: Document, Purchase Order, Contract)
- **BusinessObject**: 실제 비즈니스 객체 (예: 계약서-001, 발주서-002)

---

## 📋 데이터 모델

### 전체 구조

```
Type (비즈니스 타입)
    ↓
BusinessObject (비즈니스 객체)
    ↓
BusinessAttribute (속성 메타데이터)
```

### 1. Type

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | String (UUID) | Primary Key |
| `name` | String | 타입 이름 (예: "Document") - Unique |
| `policy` | String | Policy 이름 (문자열) |
| `createdAt` | DateTime | 생성 시각 |
| `updatedAt` | DateTime | 수정 시각 |

**특징**:
- `name`은 **유니크**해야 함
- `policy`는 Policy 테이블의 `name`을 **문자열로 저장** (외래 키 아님)

### 2. BusinessObject

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | String (UUID) | Primary Key |
| `type` | String | Type 이름 |
| `name` | String | 객체 이름 |
| `revision` | Int | 버전 번호 (1, 2, 3, ...) |
| `current` | Boolean | 현재 버전 여부 |
| `owner` | String? | 소유자 (auth.users.id) |
| `modifiedBy` | String? | 수정자 (auth.users.id) |
| `createdBy` | String? | 생성자 (auth.users.id) |
| `createdAt` | DateTime | 생성 시각 |
| `updatedAt` | DateTime | 수정 시각 |

**특징**:
- `(name, revision)` 조합은 **유니크**
- `revision`은 자동 증가 (Policy와 동일한 패턴)
- `current=true`인 객체가 현재 활성 버전

### 3. BusinessAttribute

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | String (UUID) | Primary Key |
| `name` | String | 속성 이름 (예: "title", "amount") - Unique |
| `type` | AttributeType | 속성 타입 (enum) |
| `createdAt` | DateTime | 생성 시각 |
| `updatedAt` | DateTime | 수정 시각 |

**AttributeType Enum**: `string`, `integer`, `real`, `date`

**특징**:
- `name`은 **유니크**해야 함
- `type`은 4가지 값만 허용 (enum)

---

## 🚀 API 사용법

### Type

#### 생성

```bash
POST /api/business-types
{
  "name": "Document",
  "policy": "문서 결재 정책"
}

# 응답
{
  "success": true,
  "data": {
    "id": "bt-123",
    "name": "Document",
    "policy": "문서 결재 정책"
  }
}
```

#### 조회

```bash
# 전체 조회
GET /api/business-types

# Policy로 필터링
GET /api/business-types?policy=문서 결재 정책

# 단일 조회
GET /api/business-types/{id}
```

#### 수정

```bash
PATCH /api/business-types/{id}
{
  "policy": "수정된 정책"
}
```

#### 삭제

```bash
DELETE /api/business-types/{id}
```

---

### BusinessObject

#### 생성 (첫 버전)

```bash
POST /api/business-objects
{
  "type": "Document",
  "name": "계약서-001",
  "owner": "user-id",
  "createdBy": "user-id"
}

# 응답
{
  "success": true,
  "data": {
    "id": "bo-123",
    "type": "Document",
    "name": "계약서-001",
    "revision": 1,  # 자동으로 1
    "current": true
  }
}
```

#### 새 Revision 생성

```bash
POST /api/business-objects
{
  "type": "Document",
  "name": "계약서-001",  # 같은 이름
  "owner": "user-id",
  "createdBy": "user-id",
  "newRevision": true  # ✅ 새 revision 생성
}

# 응답
{
  "success": true,
  "data": {
    "id": "bo-456",
    "revision": 2,  # 자동으로 2
    "current": true
  }
}
```

**자동 처리**:
- ✅ 같은 이름의 최대 revision 찾기
- ✅ 새 revision = 최대 + 1
- ✅ 이전 revision들 `current: false`로 변경

#### 조회

```bash
# 전체 조회
GET /api/business-objects

# Type으로 필터링
GET /api/business-objects?type=Document

# Owner로 필터링
GET /api/business-objects?owner=user-id

# 현재 버전만 조회
GET /api/business-objects?currentOnly=true

# 조합
GET /api/business-objects?type=Document&currentOnly=true
```

#### 수정

```bash
PATCH /api/business-objects/{id}
{
  "owner": "new-owner-id",
  "modifiedBy": "modifier-id"
}
```

#### 삭제

```bash
DELETE /api/business-objects/{id}
```

---

## 🔄 Revision 관리 워크플로우

### 시나리오: 문서 수정

```javascript
// 1. 계약서 첫 버전 생성 (r1)
POST /api/business-objects
{
  "type": "Document",
  "name": "계약서-001",
  "owner": "user-1",
  "createdBy": "user-1"
}
→ { "revision": 1, "current": true }

// 2. 계약서 수정본 생성 (r2)
POST /api/business-objects
{
  "type": "Document",
  "name": "계약서-001",
  "owner": "user-1",
  "createdBy": "user-2",
  "newRevision": true
}
→ { "revision": 2, "current": true }
→ r1: current = false (자동 변경)

// 3. 또 다른 수정본 (r3)
POST /api/business-objects
{
  "type": "Document",
  "name": "계약서-001",
  "newRevision": true
}
→ { "revision": 3, "current": true }
→ r1, r2: current = false
```

---

## 📊 Revision 히스토리 조회

### 특정 객체의 모든 버전

```typescript
// API 호출
const response = await fetch('/api/business-objects')
const { data } = await response.json()

// 같은 이름으로 필터링
const revisions = data
  .filter(obj => obj.name === '계약서-001')
  .sort((a, b) => b.revision - a.revision)

console.log('계약서-001 버전 히스토리:')
revisions.forEach(r => {
  console.log(`r${r.revision}: ${r.current ? '현재' : '이전'} - ${r.modifiedBy || r.createdBy}`)
})
```

### 현재 버전만 조회

```bash
GET /api/business-objects?currentOnly=true

# 또는
GET /api/business-objects?name=계약서-001&currentOnly=true
```

---

## 🔍 Policy 연결

### Type과 Policy 연결

```javascript
// 1. Policy 생성
POST /api/policies
{ "name": "문서 결재 정책" }

// 2. Type 생성 (Policy name 연결)
POST /api/business-types
{
  "name": "Document",
  "policy": "문서 결재 정책"  // Policy의 name
}

// 3. Type의 Policy 조회
GET /api/business-types/{id}
→ { "policy": "문서 결재 정책" }

// 4. Policy 상세 정보 조회 (별도)
GET /api/policies?latestVersion=true
→ Policy 전체 정보
```

**참고**: `policy`는 단순 문자열이므로, Policy 상세 정보가 필요하면 별도 조회 필요

---

## 💡 사용 예제

### 예제 1: 문서 타입 및 객체 생성

```javascript
// 1. Type 생성
const typeResponse = await fetch('/api/business-types', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Contract',
    policy: '계약 결재 정책',
  }),
})
const type = await typeResponse.json()

// 2. BusinessObject 생성
const objResponse = await fetch('/api/business-objects', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'Contract',
    name: '공급 계약서-2024-001',
    owner: 'user-123',
    createdBy: 'user-123',
  }),
})
const businessObject = await objResponse.json()
console.log(`생성됨: ${businessObject.data.name} r${businessObject.data.revision}`)
```

### 예제 2: 객체 수정 (새 Revision)

```javascript
// 계약서 수정본 생성
const response = await fetch('/api/business-objects', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'Contract',
    name: '공급 계약서-2024-001',
    owner: 'user-123',
    createdBy: 'user-456',
    newRevision: true,  // ✅ 새 revision
  }),
})
const updated = await response.json()
console.log(`새 버전: r${updated.data.revision}`)
```

### 예제 3: 현재 버전 조회

```javascript
// 모든 현재 버전의 문서만 조회
const response = await fetch('/api/business-objects?type=Document&currentOnly=true')
const { data } = await response.json()

data.forEach(obj => {
  console.log(`${obj.name} (r${obj.revision}) - 소유자: ${obj.owner}`)
})
```

---

## 📊 데이터 구조 예시

### Type 데이터

```json
[
  {
    "id": "bt-1",
    "name": "Document",
    "policy": "문서 결재 정책"
  },
  {
    "id": "bt-2",
    "name": "Purchase Order",
    "policy": "구매 결재 정책"
  },
  {
    "id": "bt-3",
    "name": "Contract",
    "policy": "계약 결재 정책"
  }
]
```

### BusinessObject 데이터 (Revision 히스토리)

```json
[
  {
    "id": "bo-3",
    "type": "Document",
    "name": "계약서-001",
    "revision": 3,
    "current": true,  // 현재 버전
    "owner": "user-1",
    "modifiedBy": "user-3"
  },
  {
    "id": "bo-2",
    "type": "Document",
    "name": "계약서-001",
    "revision": 2,
    "current": false,  // 이전 버전
    "owner": "user-1",
    "modifiedBy": "user-2"
  },
  {
    "id": "bo-1",
    "type": "Document",
    "name": "계약서-001",
    "revision": 1,
    "current": false,  // 이전 버전
    "owner": "user-1",
    "createdBy": "user-1"
  }
]
```

---

## 🗄️ 데이터베이스 업데이트

### Supabase SQL Editor에서 실행

```sql
-- Type 테이블 생성
CREATE TABLE IF NOT EXISTS "Type" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL UNIQUE,
  "policy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Type_pkey" PRIMARY KEY ("id")
);

-- BusinessObject 테이블 생성
CREATE TABLE IF NOT EXISTS "BusinessObject" (
  "id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "revision" INTEGER NOT NULL DEFAULT 1,
  "current" BOOLEAN NOT NULL DEFAULT true,
  "owner" TEXT,
  "modifiedBy" TEXT,
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BusinessObject_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "BusinessObject_name_revision_key" UNIQUE ("name", "revision")
);
```

**또는** `prisma/init.sql` 전체 실행

---

## ✅ 테스트 결과

```
PASS src/__tests__/api/business-objects.test.ts
PASS src/__tests__/api/business-types.test.ts
PASS src/__tests__/api/policies.test.ts
PASS src/__tests__/api/states.test.ts
PASS src/__tests__/api/roles.test.ts

Test Suites: 5 passed, 5 total
Tests:       32 passed, 32 total
```

---

## 📂 생성된 파일

### Backend API
- ✅ `src/app/api/business-types/route.ts` - Type 목록/생성
- ✅ `src/app/api/business-types/[id]/route.ts` - Type 조회/수정/삭제
- ✅ `src/app/api/business-objects/route.ts` - BusinessObject 목록/생성
- ✅ `src/app/api/business-objects/[id]/route.ts` - BusinessObject 조회/수정/삭제

### Tests
- ✅ `src/__tests__/api/business-types.test.ts` - Type 테스트
- ✅ `src/__tests__/api/business-objects.test.ts` - BusinessObject 테스트

### Database
- ✅ `prisma/schema.prisma` - 모델 정의 추가
- ✅ `prisma/init.sql` - SQL 생성 스크립트 업데이트
- ✅ `prisma/clean-tables.sql` - DROP TABLE 추가

---

## 🎯 API 엔드포인트

### Type

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/business-types` | 목록 조회 |
| GET | `/api/business-types?policy={name}` | Policy로 필터링 |
| POST | `/api/business-types` | 생성 |
| GET | `/api/business-types/{id}` | 단일 조회 |
| PATCH | `/api/business-types/{id}` | 수정 |
| DELETE | `/api/business-types/{id}` | 삭제 |

### BusinessObject

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/business-objects` | 목록 조회 |
| GET | `/api/business-objects?type={type}` | Type으로 필터링 |
| GET | `/api/business-objects?owner={userId}` | Owner로 필터링 |
| GET | `/api/business-objects?currentOnly=true` | 현재 버전만 |
| POST | `/api/business-objects` | 생성 |
| POST | `/api/business-objects` + `newRevision: true` | 새 revision |
| GET | `/api/business-objects/{id}` | 단일 조회 |
| PATCH | `/api/business-objects/{id}` | 수정 |
| DELETE | `/api/business-objects/{id}` | 삭제 |

---

## 🔗 Policy와의 관계

### 흐름

```
1. Policy 생성
   ↓
2. Type 생성 (Policy name 지정)
   ↓
3. BusinessObject 생성 (Type name 지정)
   ↓
4. BusinessObject의 상태는 Policy의 State를 따름 (향후 구현 가능)
```

### 예시

```javascript
// 1. Policy 생성
POST /api/policies
{ "name": "문서 결재 정책" }

// 2. Type 생성
POST /api/business-types
{ "name": "Contract", "policy": "문서 결재 정책" }

// 3. BusinessObject 생성
POST /api/business-objects
{ "type": "Contract", "name": "계약서-001" }

// 4. 관계 조회
GET /api/business-types?policy=문서 결재 정책
→ [ { "name": "Contract" } ]

GET /api/business-objects?type=Contract
→ [ { "name": "계약서-001" } ]
```

---

## ⚠️ 주의사항

### 1. Policy는 문자열

- `Type.policy`는 Policy 테이블을 **참조하지 않음**
- 단순 **문자열**로 저장
- Policy 이름 변경 시 수동으로 업데이트 필요

### 2. Type도 문자열

- `BusinessObject.type`은 Type을 **참조하지 않음**
- 단순 **문자열**로 저장
- Type 이름 변경 시 주의

### 3. Revision 관리

- BusinessObject는 Policy와 동일한 revision 패턴 사용
- `newRevision: true`로 새 버전 생성
- 이전 버전은 `current: false`로 자동 변경

---

## 📚 관련 문서

- **API 레퍼런스**: `API_GUIDE.md`
- **Policy 버전 관리**: `MANUAL_VERSION_GUIDE.md`
- **Prisma Schema**: `prisma/schema.prisma`
- **테스트 가이드**: `TEST_GUIDE.md`

---

**Happy Business Modeling! 🚀**

