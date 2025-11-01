# 📋 Business Attribute 가이드

## 🎯 개요

비즈니스 객체의 속성을 정의하는 메타데이터 테이블입니다.

---

## 📊 데이터 모델

### BusinessAttribute

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | String (UUID) | Primary Key |
| `name` | String | 속성 이름 (예: "title", "amount") - Unique |
| `type` | AttributeType | 속성 타입 (enum) |
| `createdAt` | DateTime | 생성 시각 |
| `updatedAt` | DateTime | 수정 시각 |

### AttributeType Enum

```typescript
enum AttributeType {
  string   // 문자열 (예: 제목, 설명)
  integer  // 정수 (예: 수량, 개수)
  real     // 실수 (예: 가격, 금액)
  date     // 날짜 (예: 마감일, 계약일)
}
```

**특징**:
- `name`은 **유니크**해야 함
- `type`은 4가지 값만 허용 (enum)

---

## 🚀 API 사용법

### 생성

```bash
POST /api/business-attributes
{
  "name": "title",
  "type": "string"
}

# 응답
{
  "success": true,
  "data": {
    "id": "attr-123",
    "name": "title",
    "type": "string"
  }
}
```

### 다양한 타입 예시

```bash
# String 타입
POST /api/business-attributes
{ "name": "title", "type": "string" }

# Integer 타입
POST /api/business-attributes
{ "name": "quantity", "type": "integer" }

# Real 타입
POST /api/business-attributes
{ "name": "price", "type": "real" }

# Date 타입
POST /api/business-attributes
{ "name": "dueDate", "type": "date" }
```

### 조회

```bash
# 전체 조회
GET /api/business-attributes

# 타입별 필터링
GET /api/business-attributes?type=string
GET /api/business-attributes?type=integer
GET /api/business-attributes?type=real
GET /api/business-attributes?type=date

# 단일 조회
GET /api/business-attributes/{id}
```

### 수정

```bash
PATCH /api/business-attributes/{id}
{
  "name": "totalAmount",
  "type": "real"
}
```

### 삭제

```bash
DELETE /api/business-attributes/{id}
```

---

## 💡 사용 예제

### 예제 1: 문서 속성 정의

```javascript
// 문서에 필요한 속성들 정의
const attributes = [
  { name: 'title', type: 'string' },
  { name: 'description', type: 'string' },
  { name: 'pageCount', type: 'integer' },
  { name: 'fileSize', type: 'real' },
  { name: 'createdDate', type: 'date' },
  { name: 'dueDate', type: 'date' },
]

for (const attr of attributes) {
  await fetch('/api/business-attributes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(attr),
  })
}
```

### 예제 2: 타입별 속성 조회

```javascript
// 모든 날짜 타입 속성 조회
const response = await fetch('/api/business-attributes?type=date')
const { data } = await response.json()

console.log('날짜 타입 속성:')
data.forEach(attr => {
  console.log(`- ${attr.name}`)
})
// 출력:
// - createdDate
// - dueDate
```

### 예제 3: 속성 유효성 검증

```javascript
// BusinessObject 생성 시 속성 타입 검증
const validateAttribute = async (attrName: string, value: any) => {
  const response = await fetch('/api/business-attributes')
  const { data } = await response.json()
  
  const attribute = data.find(a => a.name === attrName)
  if (!attribute) {
    throw new Error(`Unknown attribute: ${attrName}`)
  }
  
  // 타입 검증
  switch (attribute.type) {
    case 'string':
      if (typeof value !== 'string') {
        throw new Error(`${attrName} must be a string`)
      }
      break
    case 'integer':
      if (!Number.isInteger(value)) {
        throw new Error(`${attrName} must be an integer`)
      }
      break
    case 'real':
      if (typeof value !== 'number') {
        throw new Error(`${attrName} must be a number`)
      }
      break
    case 'date':
      if (!(value instanceof Date || typeof value === 'string')) {
        throw new Error(`${attrName} must be a date`)
      }
      break
  }
  
  return true
}

// 사용
await validateAttribute('title', 'My Document')  // ✅ OK
await validateAttribute('quantity', 10)          // ✅ OK
await validateAttribute('price', 99.99)          // ✅ OK
await validateAttribute('dueDate', '2024-12-31') // ✅ OK
```

---

## 📊 샘플 데이터

### 일반적인 속성 정의

```json
[
  {
    "name": "title",
    "type": "string",
    "description": "제목"
  },
  {
    "name": "description",
    "type": "string",
    "description": "설명"
  },
  {
    "name": "amount",
    "type": "integer",
    "description": "수량"
  },
  {
    "name": "price",
    "type": "real",
    "description": "가격"
  },
  {
    "name": "totalPrice",
    "type": "real",
    "description": "총 가격"
  },
  {
    "name": "startDate",
    "type": "date",
    "description": "시작일"
  },
  {
    "name": "endDate",
    "type": "date",
    "description": "종료일"
  },
  {
    "name": "dueDate",
    "type": "date",
    "description": "마감일"
  }
]
```

---

## 🔗 다른 테이블과의 관계

### BusinessType → BusinessObject → Attributes

```
BusinessType (예: "Contract")
    ↓
BusinessObject (예: "계약서-001")
    ↓
Attributes (예: title="공급계약", amount=1000, dueDate="2024-12-31")
```

**참고**: 현재는 느슨한 연결 (문자열 기반)
- BusinessAttribute는 독립적인 메타데이터
- 실제 값은 BusinessObject에 별도 저장 필요 (향후 확장)

---

## 🗄️ 데이터베이스 업데이트

### Supabase SQL Editor에서 실행

```sql
-- 1. Enum 타입 생성
CREATE TYPE "AttributeType" AS ENUM ('string', 'integer', 'real', 'date');

-- 2. 테이블 생성
CREATE TABLE IF NOT EXISTS "BusinessAttribute" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL UNIQUE,
  "type" "AttributeType" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BusinessAttribute_pkey" PRIMARY KEY ("id")
);

-- 3. 인덱스 생성
CREATE UNIQUE INDEX IF NOT EXISTS "BusinessAttribute_name_key" ON "BusinessAttribute"("name");
CREATE INDEX IF NOT EXISTS "BusinessAttribute_name_idx" ON "BusinessAttribute"("name");
CREATE INDEX IF NOT EXISTS "BusinessAttribute_type_idx" ON "BusinessAttribute"("type");
```

**또는** `prisma/init.sql` 전체 실행

---

## ✅ 테스트 결과

```
PASS src/__tests__/api/business-attributes.test.ts
  BusinessAttribute API
    GET /api/business-attributes
      ✓ 모든 BusinessAttribute 목록을 반환해야 함
      ✓ type으로 필터링해야 함
    POST /api/business-attributes
      ✓ 새로운 BusinessAttribute를 생성해야 함
      ✓ name, type이 없으면 400 에러를 반환해야 함
      ✓ 잘못된 type이면 400 에러를 반환해야 함
    GET /api/business-attributes/:id
      ✓ 특정 BusinessAttribute를 반환해야 함
      ✓ 존재하지 않는 BusinessAttribute는 404를 반환해야 함
    PATCH /api/business-attributes/:id
      ✓ BusinessAttribute를 수정해야 함
      ✓ 잘못된 type이면 400 에러를 반환해야 함
    DELETE /api/business-attributes/:id
      ✓ BusinessAttribute를 삭제해야 함

Tests: 42 passed, 42 total
```

---

## 📂 API 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/business-attributes` | 목록 조회 |
| GET | `/api/business-attributes?type={type}` | Type으로 필터링 |
| POST | `/api/business-attributes` | 생성 |
| GET | `/api/business-attributes/{id}` | 단일 조회 |
| PATCH | `/api/business-attributes/{id}` | 수정 |
| DELETE | `/api/business-attributes/{id}` | 삭제 |

---

## 🎯 향후 확장

### BusinessObjectAttribute 테이블 (선택사항)

실제 속성 값을 저장하려면:

```prisma
model BusinessObjectAttribute {
  id                String @id @default(uuid())
  businessObjectId  String
  attributeId       String
  value             String // 모든 타입을 문자열로 저장
  
  @@unique([businessObjectId, attributeId])
}
```

**사용 예시**:
```javascript
// 계약서-001의 속성 값
{
  "businessObjectId": "bo-123",
  "attributeId": "attr-title",
  "value": "공급 계약서"
}
```

---

## 📚 관련 문서

- **Business Model**: `BUSINESS_MODEL_GUIDE.md`
- **API 레퍼런스**: `API_GUIDE.md`
- **Prisma Schema**: `prisma/schema.prisma`

---

**Happy Attribute Management! 🚀**

