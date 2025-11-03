# 📊 Schema V2 변경 사항

## 🔄 주요 변경사항

### 이전 구조 (V1) → 새 구조 (V2)

| V1 | V2 | 변경 내용 |
|----|----|----------|
| `Type` | `Type` | Policy와 FK 관계로 변경 |
| `BusinessAttribute` (메타) | `Attribute` | Type별 속성 정의 (스키마) |
| - | `BusinessAttribute` | EAV 패턴으로 실제 값 저장 |
| `BusinessObject` (단순) | `BusinessObject` | Type, Policy FK 추가, currentState 추가 |
| `AttributeType` enum | `AttrType` enum | 더 많은 타입 추가 (BOOLEAN, JSON, ENUM) |

---

## 📋 새 구조 설명

### 1. Type (이전 Type)

```prisma
model Type {
  id       String @id @default(cuid())
  name     String @unique
  policyId String  // ✅ Policy FK 추가
  
  policy          Policy           @relation(...)
  attributes      Attribute[]      // ✅ 속성 정의
  businessObjects BusinessObject[] // ✅ 인스턴스들
}
```

**변경점**:
- ❌ `policy: String` 삭제
- ✅ `policyId: String` 추가 (FK)
- ✅ `attributes` 관계 추가
- ✅ `businessObjects` 관계 추가

---

### 2. Attribute (속성 정의/스키마)

```prisma
model Attribute {
  id           String   @id @default(cuid())
  typeId       String   // ✅ Type FK
  key          String   // "amount", "due_date"
  label        String   // "금액", "마감일"
  attrType     AttrType // ✅ Enum 타입
  isRequired   Boolean  @default(false)
  defaultValue String?  // JSON string
  validation   String?  // 검증 규칙
  
  type Type @relation(...)
}
```

**역할**: Type별로 어떤 속성이 있는지 **정의**
- 예: "Invoice" Type은 "amount", "due_date", "vendor" 속성을 가짐

---

### 3. AttrType Enum (확장)

```prisma
enum AttrType {
  STRING   // 문자열
  INTEGER  // 정수
  REAL     // 실수
  DATE     // 날짜
  BOOLEAN  // ✅ 신규
  JSON     // ✅ 신규
  ENUM     // ✅ 신규
}
```

---

### 4. BusinessObject (강화)

```prisma
model BusinessObject {
  id           String @id @default(cuid())
  typeId       String  // ✅ Type FK
  policyId     String  // ✅ Policy FK
  currentState String  // ✅ State name (문자열)
  data         Json?   // ✅ 선택적 JSONB
  
  type       Type                @relation(...)
  policy     Policy              @relation(...)
  attributes BusinessAttribute[] // ✅ 실제 속성 값들
}
```

**변경점**:
- ✅ `typeId` FK 추가
- ✅ `policyId` FK 추가
- ✅ `currentState` 추가 (State 추적)
- ✅ `data` JSONB 추가 (유연성)
- ✅ `attributes` 관계 추가 (EAV)

---

### 5. BusinessAttribute (EAV 패턴)

```prisma
model BusinessAttribute {
  id           String    @id @default(cuid())
  objectId     String    // BusinessObject FK
  attributeKey String    // "amount", "due_date"
  
  // 타입별 값 저장 (하나만 사용)
  valueString  String?
  valueInteger Int?
  valueReal    Float?
  valueDate    DateTime?
  valueBoolean Boolean?  // ✅ 신규
  valueJson    Json?     // ✅ 신규
  
  object BusinessObject @relation(...)
}
```

**역할**: BusinessObject의 **실제 속성 값** 저장 (EAV 패턴)
- 예: "계약서-001"의 "amount" = 1000000

---

## 🔄 데이터 구조 예시

### 이전 (V1)

```javascript
// Type (독립)
{ name: "Document", policy: "문서 결재 정책" }

// BusinessObject (독립)
{ type: "Document", name: "계약서-001", revision: 1 }

// BusinessAttribute (메타데이터만)
{ name: "title", type: "string" }
```

### 이후 (V2)

```javascript
// Policy
{ id: "policy-1", name: "문서 결재 정책", version: 1 }

// Type (Policy와 연결)
{ id: "type-1", name: "Contract", policyId: "policy-1" }

// Attribute (Type별 속성 정의)
[
  { typeId: "type-1", key: "title", label: "제목", attrType: "STRING", isRequired: true },
  { typeId: "type-1", key: "amount", label: "금액", attrType: "INTEGER", isRequired: true },
  { typeId: "type-1", key: "dueDate", label: "마감일", attrType: "DATE" }
]

// BusinessObject (Type, Policy와 연결)
{ 
  id: "obj-1", 
  typeId: "type-1", 
  policyId: "policy-1",
  currentState: "Draft"
}

// BusinessAttribute (실제 값, EAV)
[
  { objectId: "obj-1", attributeKey: "title", valueString: "공급 계약서" },
  { objectId: "obj-1", attributeKey: "amount", valueInteger: 1000000 },
  { objectId: "obj-1", attributeKey: "dueDate", valueDate: "2024-12-31" }
]
```

---

## 🚀 마이그레이션 방법

### 방법 1: 완전 초기화 (권장)

```sql
-- 1. 모든 테이블 삭제
-- prisma/clean-tables.sql 실행

-- 2. 새 스키마로 재생성
-- prisma/init-v2.sql 실행

-- 3. Prisma Client 재생성
npx prisma generate
```

### 방법 2: 기존 데이터 마이그레이션

**주의**: 복잡한 데이터 변환 필요

```sql
-- 1. 새 테이블 생성
-- 2. 데이터 변환 스크립트 작성
-- 3. 기존 테이블 삭제
```

---

## ⚠️ Breaking Changes

### API 변경 필요

| 엔드포인트 | 변경 사항 |
|-----------|----------|
| `/api/business-types` | → `/api/types` (이름 변경) |
| `/api/business-attributes` | → `/api/attributes` (역할 변경) |
| `/api/business-objects` | 요청/응답 구조 변경 |

### 필드 변경

```javascript
// 이전
POST /api/business-types
{ "name": "Document", "policy": "문서 결재 정책" }

// 이후
POST /api/types
{ "name": "Contract", "policyId": "policy-id" }  // FK 사용
```

---

## 🎯 새 기능

### 1. Type별 Attribute 정의

```javascript
// Type 생성
POST /api/types
{ "name": "Invoice", "policyId": "policy-1" }

// Attribute 정의
POST /api/attributes
{
  "typeId": "type-1",
  "key": "amount",
  "label": "금액",
  "attrType": "INTEGER",
  "isRequired": true
}
```

### 2. BusinessObject에 동적 속성 할당

```javascript
// BusinessObject 생성
POST /api/business-objects
{
  "typeId": "type-1",
  "policyId": "policy-1",
  "currentState": "Draft"
}

// 속성 값 설정 (EAV)
POST /api/business-attributes
{
  "objectId": "obj-1",
  "attributeKey": "amount",
  "valueInteger": 1000000
}
```

### 3. 속성 검증

```javascript
// Attribute 정의에서 검증 규칙 사용
{
  "key": "amount",
  "attrType": "INTEGER",
  "validation": JSON.stringify({ min: 0, max: 999999999 })
}

{
  "key": "email",
  "attrType": "STRING",
  "validation": JSON.stringify({ pattern: "^[a-z@.]+$" })
}
```

---

## 📚 다음 단계

1. ✅ 스키마 변경 완료
2. ✅ Prisma Client 생성 완료
3. ⏳ SQL 스크립트 생성 (`init-v2.sql`)
4. ⏳ API 업데이트 필요
5. ⏳ 테스트 업데이트 필요

---

**Schema V2로 업그레이드 완료! 🚀**

