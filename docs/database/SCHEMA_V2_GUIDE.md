# 📊 Schema V2 - EAV 패턴 완벽 가이드

## 🎯 개요

**Schema V2**는 EAV(Entity-Attribute-Value) 패턴을 적용하여 동적 속성 관리를 지원합니다.

---

## 🏗️ 전체 구조

```
Policy (권한 정책)
    ├─ State (상태)
    ├─ Type (비즈니스 타입)
    │    └─ Attribute (속성 정의/스키마)
    └─ BusinessObject (비즈니스 객체 인스턴스)
         └─ BusinessAttribute (실제 속성 값, EAV)
```

---

## 📋 테이블 구조

### 1. Policy → Type (1:N)

```typescript
// Policy
{ id: "p1", name: "문서 결재 정책", version: 1 }

// Type (Policy에 속함)
{ id: "t1", name: "Contract", policyId: "p1" }
{ id: "t2", name: "Invoice", policyId: "p1" }
```

### 2. Type → Attribute (1:N) - 속성 정의

```typescript
// Type "Contract"의 속성 정의
[
  { typeId: "t1", key: "title", label: "제목", attrType: "STRING", isRequired: true },
  { typeId: "t1", key: "amount", label: "금액", attrType: "INTEGER", isRequired: true },
  { typeId: "t1", key: "dueDate", label: "마감일", attrType: "DATE", isRequired: false }
]
```

### 3. Type → BusinessObject (1:N) - 인스턴스

```typescript
// Type "Contract"의 인스턴스들
{ id: "o1", typeId: "t1", policyId: "p1", currentState: "Draft" }
{ id: "o2", typeId: "t1", policyId: "p1", currentState: "Review" }
```

### 4. BusinessObject → BusinessAttribute (1:N) - 실제 값 (EAV)

```typescript
// BusinessObject "o1"의 속성 값들
[
  { objectId: "o1", attributeKey: "title", valueString: "공급 계약서" },
  { objectId: "o1", attributeKey: "amount", valueInteger: 1000000 },
  { objectId: "o1", attributeKey: "dueDate", valueDate: "2024-12-31" }
]
```

---

## 🔄 완전한 예시

### 1. Policy 생성

```bash
POST /api/policies
{
  "name": "문서 결재 정책",
  "version": 1
}
→ { "id": "policy-1" }
```

### 2. Type 생성 (Policy와 연결)

```bash
POST /api/types
{
  "name": "Contract",
  "policyId": "policy-1"
}
→ { "id": "type-1" }
```

### 3. Attribute 정의 (Type별 속성 스키마)

```bash
# 속성 1: 제목 (필수)
POST /api/attributes
{
  "typeId": "type-1",
  "key": "title",
  "label": "제목",
  "attrType": "STRING",
  "isRequired": true
}

# 속성 2: 금액 (필수, 검증 있음)
POST /api/attributes
{
  "typeId": "type-1",
  "key": "amount",
  "label": "금액",
  "attrType": "INTEGER",
  "isRequired": true,
  "validation": "{\"min\": 0, \"max\": 999999999}"
}

# 속성 3: 마감일 (선택)
POST /api/attributes
{
  "typeId": "type-1",
  "key": "dueDate",
  "label": "마감일",
  "attrType": "DATE",
  "isRequired": false
}
```

### 4. BusinessObject 생성

```bash
POST /api/business-objects
{
  "typeId": "type-1",
  "policyId": "policy-1",
  "currentState": "Draft"
}
→ { "id": "object-1" }
```

### 5. BusinessAttribute 값 설정 (EAV)

```bash
# 제목 설정
POST /api/business-attributes
{
  "objectId": "object-1",
  "attributeKey": "title",
  "valueString": "공급 계약서"
}

# 금액 설정
POST /api/business-attributes
{
  "objectId": "object-1",
  "attributeKey": "amount",
  "valueInteger": 1000000
}

# 마감일 설정
POST /api/business-attributes
{
  "objectId": "object-1",
  "attributeKey": "dueDate",
  "valueDate": "2024-12-31T00:00:00Z"
}
```

### 6. 완전한 객체 조회

```bash
GET /api/business-objects/object-1?include=type,policy,attributes

# 응답
{
  "success": true,
  "data": {
    "id": "object-1",
    "typeId": "type-1",
    "policyId": "policy-1",
    "currentState": "Draft",
    "type": {
      "name": "Contract",
      "policy": { "name": "문서 결재 정책" }
    },
    "attributes": [
      { "attributeKey": "title", "valueString": "공급 계약서" },
      { "attributeKey": "amount", "valueInteger": 1000000 },
      { "attributeKey": "dueDate", "valueDate": "2024-12-31T00:00:00Z" }
    ]
  }
}
```

---

## 💡 EAV 패턴의 장점

### 1. 동적 스키마

```javascript
// Type별로 다른 속성 정의 가능
// Contract Type
{ key: "amount", attrType: "INTEGER" }
{ key: "dueDate", attrType: "DATE" }

// Invoice Type
{ key: "invoiceNumber", attrType: "STRING" }
{ key: "totalPrice", attrType: "REAL" }
{ key: "paid", attrType: "BOOLEAN" }
```

### 2. 검증 규칙

```javascript
// Attribute 정의 시 검증 규칙 설정
{
  "key": "email",
  "attrType": "STRING",
  "validation": JSON.stringify({
    pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
  })
}

{
  "key": "age",
  "attrType": "INTEGER",
  "validation": JSON.stringify({
    min: 0,
    max: 120
  })
}
```

### 3. 기본값

```javascript
{
  "key": "status",
  "attrType": "STRING",
  "defaultValue": "\"draft\""  // JSON string
}

{
  "key": "quantity",
  "attrType": "INTEGER",
  "defaultValue": "1"
}
```

---

## 🔍 쿼리 예제

### Type별 Attribute 조회

```bash
GET /api/attributes?typeId=type-1

# 응답: Contract Type의 모든 속성 정의
[
  { "key": "title", "label": "제목", "attrType": "STRING" },
  { "key": "amount", "label": "금액", "attrType": "INTEGER" },
  { "key": "dueDate", "label": "마감일", "attrType": "DATE" }
]
```

### BusinessObject의 모든 속성 값 조회

```bash
GET /api/business-attributes?objectId=object-1

# 응답: 객체의 모든 속성 값 (EAV)
[
  { "attributeKey": "title", "valueString": "공급 계약서" },
  { "attributeKey": "amount", "valueInteger": 1000000 },
  { "attributeKey": "dueDate", "valueDate": "2024-12-31" }
]
```

### Type별 객체 조회

```bash
GET /api/business-objects?typeId=type-1&include=attributes

# 응답: Contract Type의 모든 객체 + 속성 값
[
  {
    "id": "obj-1",
    "currentState": "Draft",
    "attributes": [
      { "attributeKey": "title", "valueString": "계약서 A" }
    ]
  }
]
```

---

## 📊 AttrType 타입별 사용

### STRING

```bash
POST /api/business-attributes
{
  "objectId": "obj-1",
  "attributeKey": "title",
  "valueString": "공급 계약서"  # ✅ valueString 사용
}
```

### INTEGER

```bash
POST /api/business-attributes
{
  "objectId": "obj-1",
  "attributeKey": "quantity",
  "valueInteger": 100  # ✅ valueInteger 사용
}
```

### REAL

```bash
POST /api/business-attributes
{
  "objectId": "obj-1",
  "attributeKey": "price",
  "valueReal": 99.99  # ✅ valueReal 사용
}
```

### DATE

```bash
POST /api/business-attributes
{
  "objectId": "obj-1",
  "attributeKey": "dueDate",
  "valueDate": "2024-12-31T00:00:00Z"  # ✅ valueDate 사용
}
```

### BOOLEAN

```bash
POST /api/business-attributes
{
  "objectId": "obj-1",
  "attributeKey": "isActive",
  "valueBoolean": true  # ✅ valueBoolean 사용
}
```

### JSON

```bash
POST /api/business-attributes
{
  "objectId": "obj-1",
  "attributeKey": "metadata",
  "valueJson": { "tags": ["urgent", "contract"], "priority": 1 }  # ✅ valueJson 사용
}
```

### ENUM

```bash
# ENUM은 valueString 사용
POST /api/business-attributes
{
  "objectId": "obj-1",
  "attributeKey": "status",
  "valueString": "approved"  # ✅ enum 값을 문자열로
}
```

---

## 🚀 API 엔드포인트

### Type (비즈니스 타입)

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/types` | 목록 조회 |
| GET | `/api/types?policyId={id}` | Policy별 조회 |
| GET | `/api/types?include=policy,attributes,objects` | 관계 포함 |
| POST | `/api/types` | 생성 |
| GET | `/api/types/{id}` | 단일 조회 |
| PATCH | `/api/types/{id}` | 수정 |
| DELETE | `/api/types/{id}` | 삭제 |

### Attribute (속성 정의)

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/attributes` | 목록 조회 |
| GET | `/api/attributes?typeId={id}` | Type별 속성 조회 |
| POST | `/api/attributes` | 속성 정의 생성 |
| GET | `/api/attributes/{id}` | 단일 조회 |
| PATCH | `/api/attributes/{id}` | 수정 |
| DELETE | `/api/attributes/{id}` | 삭제 |

### BusinessObject (비즈니스 객체)

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/business-objects` | 목록 조회 |
| GET | `/api/business-objects?typeId={id}` | Type별 조회 |
| GET | `/api/business-objects?currentState={state}` | State별 조회 |
| POST | `/api/business-objects` | 생성 |
| GET | `/api/business-objects/{id}?include=attributes` | 속성 포함 조회 |
| PATCH | `/api/business-objects/{id}` | 수정 (State 전환 등) |
| DELETE | `/api/business-objects/{id}` | 삭제 |

### BusinessAttribute (속성 값, EAV)

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/business-attributes` | 목록 조회 |
| GET | `/api/business-attributes?objectId={id}` | 객체별 속성 값 조회 |
| POST | `/api/business-attributes` | 속성 값 설정 |
| GET | `/api/business-attributes/{id}` | 단일 조회 |
| PATCH | `/api/business-attributes/{id}` | 값 수정 |
| DELETE | `/api/business-attributes/{id}` | 삭제 |

---

## 🗄️ 데이터베이스 설정

### Supabase SQL Editor에서 실행

```bash
# 전체 재생성 (권장)
1. prisma/clean-tables.sql 실행 (기존 테이블 삭제)
2. prisma/init-v2.sql 실행 (새 테이블 생성)

# Prisma Client 재생성
npx prisma generate
```

---

## 💻 사용 예제 (완전한 워크플로우)

```javascript
// ============================================
// 1. Policy 생성
// ============================================
const policyRes = await fetch('/api/policies', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: '계약 결재 정책',
  }),
})
const policy = await policyRes.json()
console.log('Policy:', policy.data.id)

// ============================================
// 2. States 생성
// ============================================
const states = ['Draft', 'Review', 'Approved', 'Complete']
for (let i = 0; i < states.length; i++) {
  await fetch('/api/states', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      policyId: policy.data.id,
      name: states[i],
      order: i + 1,
      isInitial: i === 0,
      isFinal: i === states.length - 1,
    }),
  })
}

// ============================================
// 3. Type 생성
// ============================================
const typeRes = await fetch('/api/types', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Contract',
    policyId: policy.data.id,
  }),
})
const type = await typeRes.json()
console.log('Type:', type.data.id)

// ============================================
// 4. Attribute 정의 (속성 스키마)
// ============================================
const attributeDefs = [
  { key: 'title', label: '제목', attrType: 'STRING', isRequired: true },
  { key: 'contractNumber', label: '계약 번호', attrType: 'STRING', isRequired: true },
  { key: 'amount', label: '계약 금액', attrType: 'INTEGER', isRequired: true },
  { key: 'unitPrice', label: '단가', attrType: 'REAL', isRequired: false },
  { key: 'startDate', label: '시작일', attrType: 'DATE', isRequired: true },
  { key: 'endDate', label: '종료일', attrType: 'DATE', isRequired: false },
  { key: 'autoRenew', label: '자동 갱신', attrType: 'BOOLEAN', isRequired: false },
  { key: 'metadata', label: '메타데이터', attrType: 'JSON', isRequired: false },
]

for (const attrDef of attributeDefs) {
  await fetch('/api/attributes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      typeId: type.data.id,
      ...attrDef,
    }),
  })
}
console.log('Attributes defined:', attributeDefs.length)

// ============================================
// 5. BusinessObject 생성
// ============================================
const objectRes = await fetch('/api/business-objects', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    typeId: type.data.id,
    policyId: policy.data.id,
    currentState: 'Draft',
  }),
})
const businessObject = await objectRes.json()
console.log('BusinessObject:', businessObject.data.id)

// ============================================
// 6. BusinessAttribute 값 설정 (EAV)
// ============================================
const attributeValues = [
  { attributeKey: 'title', valueString: 'IT 장비 공급 계약서' },
  { attributeKey: 'contractNumber', valueString: 'CTR-2024-001' },
  { attributeKey: 'amount', valueInteger: 50000000 },
  { attributeKey: 'unitPrice', valueReal: 1250000.50 },
  { attributeKey: 'startDate', valueDate: '2024-01-01T00:00:00Z' },
  { attributeKey: 'endDate', valueDate: '2024-12-31T23:59:59Z' },
  { attributeKey: 'autoRenew', valueBoolean: true },
  { attributeKey: 'metadata', valueJson: { tags: ['urgent', 'IT'], department: 'Engineering' } },
]

for (const attrValue of attributeValues) {
  await fetch('/api/business-attributes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      objectId: businessObject.data.id,
      ...attrValue,
    }),
  })
}
console.log('Attribute values set:', attributeValues.length)

// ============================================
// 7. 완전한 객체 조회
// ============================================
const fullObjectRes = await fetch(
  `/api/business-objects/${businessObject.data.id}?include=type,policy,attributes`
)
const fullObject = await fullObjectRes.json()

console.log('\n완성된 계약서:')
console.log('- ID:', fullObject.data.id)
console.log('- Type:', fullObject.data.type.name)
console.log('- Policy:', fullObject.data.policy.name)
console.log('- State:', fullObject.data.currentState)
console.log('- Attributes:', fullObject.data.attributes.length)

fullObject.data.attributes.forEach(attr => {
  const value = attr.valueString || attr.valueInteger || attr.valueReal || 
                attr.valueDate || attr.valueBoolean || JSON.stringify(attr.valueJson)
  console.log(`  - ${attr.attributeKey}: ${value}`)
})
```

---

## 📊 Schema 비교

| 항목 | V1 (이전) | V2 (현재) |
|------|----------|----------|
| **타입** | Type (독립) | Type (Policy FK) |
| **속성 정의** | BusinessAttribute | Attribute (Type FK) |
| **속성 값** | - | BusinessAttribute (EAV) |
| **객체** | BusinessObject (단순) | BusinessObject (Type, Policy FK) |
| **상태 추적** | - | currentState 필드 |
| **유연성** | 낮음 | 높음 (EAV) |

---

## ⚠️ 주의사항

### 1. EAV 값은 하나만 설정

```javascript
// ❌ Bad: 여러 value 동시 설정
{
  valueString: "test",
  valueInteger: 123  // 충돌!
}

// ✅ Good: 하나의 value만
{
  valueString: "test"  // attrType=STRING인 경우
}
```

### 2. attrType에 맞는 value 사용

| attrType | 사용할 value 필드 |
|----------|------------------|
| STRING | `valueString` |
| INTEGER | `valueInteger` |
| REAL | `valueReal` |
| DATE | `valueDate` |
| BOOLEAN | `valueBoolean` |
| JSON | `valueJson` |
| ENUM | `valueString` |

---

## 📚 관련 문서

- **변경 사항**: `SCHEMA_V2_CHANGES.md`
- **API 레퍼런스**: `API_GUIDE.md` (업데이트 필요)
- **Prisma Schema**: `prisma/schema.prisma`
- **SQL 스크립트**: `prisma/init-v2.sql`

---

**Schema V2로 업그레이드 완료! 🚀**

