# 📦 Policy 수동 버전 관리 가이드

## 🎯 개요

Policy의 모든 버전 업은 **수동으로만** 수행됩니다.

## 📊 버전 관리 규칙

### 🖐️ 수동 버전 업 (Manual Only)

| 작업 | 버전 변화 | 설명 |
|------|----------|------|
| **State 추가** | ❌ 변경 없음 | 일반 생성 |
| **State 삭제** | ❌ 변경 없음 | 일반 삭제 |
| **State 수정** | ❌ 변경 없음 | 속성만 수정 |
| **Policy 수정** | ❌ 변경 없음 (기본) | `createNewVersion: true`로 수동 버전 업 |

**핵심**: State를 추가/삭제해도 **Policy 버전은 자동으로 변경되지 않습니다!**

---

## 🚀 사용 방법

### 1️⃣ Policy 생성 (v1)

```bash
POST /api/policies
{
  "name": "문서 결재 정책",
  "description": "초기 버전"
}

# 응답
{
  "success": true,
  "data": {
    "id": "policy-123",
    "name": "문서 결재 정책",
    "version": 1,  # v1
    "isActive": true
  }
}
```

---

### 2️⃣ State 추가 (버전 변경 없음)

```bash
POST /api/states
{
  "policyId": "policy-123",
  "name": "Review",
  "description": "검토 단계",
  "order": 3
}

# 응답
{
  "success": true,
  "data": { "id": "state-456", "name": "Review" }
}

# Policy는 여전히 v1 (변경 없음)
```

---

### 3️⃣ State 삭제 (버전 변경 없음)

```bash
DELETE /api/states/state-456

# 응답
{
  "success": true,
  "message": "State가 삭제되었습니다."
}

# Policy는 여전히 v1 (변경 없음)
```

---

### 4️⃣ Policy 수정 - 일반 (버전 변경 없음)

```bash
PATCH /api/policies/policy-123
{
  "description": "설명만 수정"
}

# 응답
{
  "success": true,
  "data": {
    "id": "policy-123",
    "version": 1  # 그대로 v1
  }
}
```

---

### 5️⃣ Policy 수동 버전 업 (v2 생성)

```bash
PATCH /api/policies/policy-123
{
  "description": "대폭 수정된 버전 2",
  "createNewVersion": true  # ✅ 수동 버전 업
}

# 응답
{
  "success": true,
  "data": {
    "id": "policy-789",  # 새 ID
    "version": 2,        # v2
    "isActive": true
  },
  "message": "새 버전 (v2) 생성됨"
}
```

**자동 처리**:
- ✅ Policy v1 비활성화 (`isActive: false`)
- ✅ Policy v2 생성
- ✅ 기존 States 및 Permissions 복사

---

### 6️⃣ States 복사 없이 새 버전 생성

```bash
PATCH /api/policies/policy-123
{
  "description": "완전히 새로운 구조",
  "createNewVersion": true,
  "copyStates": false  # ✅ States 복사 안 함
}

# 응답
{
  "success": true,
  "data": {
    "id": "policy-999",
    "version": 3,
    "isActive": true
  }
}

# v3는 States가 비어있음 (새로 추가 필요)
```

---

### 7️⃣ 새 Policy 버전 생성 (POST)

```bash
POST /api/policies
{
  "name": "문서 결재 정책",  # 기존과 같은 이름
  "description": "새 버전",
  "newVersion": true  # ✅ 새 버전 생성
}

# 응답
{
  "success": true,
  "data": {
    "version": 4,  # 자동으로 v4
    "isActive": true
  }
}
```

**자동 처리**:
- ✅ 같은 이름의 최대 버전 찾기
- ✅ 새 버전 = 최대 버전 + 1
- ✅ 이전 버전들 비활성화

---

## 🔄 워크플로우 시나리오

### 일반적인 사용

```javascript
// 1. Policy v1 생성
POST /api/policies
{ "name": "문서 결재 정책" }
→ v1

// 2. States 추가 (버전 변경 없음)
POST /api/states { "policyId": "v1-id", "name": "Create", "order": 1 }
POST /api/states { "policyId": "v1-id", "name": "Review", "order": 2 }
POST /api/states { "policyId": "v1-id", "name": "Complete", "order": 3 }
→ v1 (그대로)

// 3. Permissions 설정 (버전 변경 없음)
POST /api/permissions { "stateId": "...", "action": "create", ... }
→ v1 (그대로)

// 4. 테스트 및 검증
GET /api/policies/v1-id
→ v1

// 5. 대폭 수정 필요 시 수동으로 새 버전 생성
PATCH /api/policies/v1-id
{ "description": "v2: 승인 단계 추가", "createNewVersion": true }
→ v2 생성 (States 자동 복사)

// 6. 새 버전에 State 추가
POST /api/states { "policyId": "v2-id", "name": "Approve", "order": 3 }
→ v2 (그대로)

// 7. 최종 확정 후 새 버전
PATCH /api/policies/v2-id
{ "description": "v3: 최종 확정", "createNewVersion": true }
→ v3 생성
```

---

## 📋 버전 조회

### 모든 버전 조회

```bash
GET /api/policies

# 응답
[
  { "name": "문서 결재 정책", "version": 3, "isActive": true },
  { "name": "문서 결재 정책", "version": 2, "isActive": false },
  { "name": "문서 결재 정책", "version": 1, "isActive": false }
]
```

### 최신 버전만 조회

```bash
GET /api/policies?latestVersion=true

# 응답
[
  { "name": "문서 결재 정책", "version": 3, "isActive": true }
]
```

### 활성화된 버전만 조회

```bash
GET /api/policies?onlyActive=true
```

---

## 💡 Best Practices

### 1. 버전 업 타이밍

**언제 새 버전을 만들어야 할까?**

✅ **새 버전 생성 권장**:
- 구조 변경 (State 추가/삭제/순서 변경)
- 권한 대폭 수정
- 프로덕션 배포 전
- 메이저 업데이트

❌ **새 버전 불필요**:
- 설명만 수정
- State 이름/설명 수정
- 권한 일부 조정
- 오타 수정

### 2. 버전 설명 작성

```javascript
// ✅ Good: 변경 내용 명시
{
  "description": "v2 변경사항:\n- 승인 단계 추가\n- 검토자 권한 강화",
  "createNewVersion": true
}

// ❌ Bad: 의미 없는 설명
{
  "description": "수정됨",
  "createNewVersion": true
}
```

### 3. States 복사 관리

```javascript
// 기존 구조 유지하면서 개선
PATCH /api/policies/{id}
{
  "description": "v2: 권한 개선",
  "createNewVersion": true,
  "copyStates": true  // 기본값, States 복사
}

// 완전히 새로운 구조
PATCH /api/policies/{id}
{
  "description": "v2: 완전 재설계",
  "createNewVersion": true,
  "copyStates": false  // States 복사 안 함
}
```

---

## 🧪 테스트

### 단위 테스트

```bash
npm test
# ✅ All tests passed
```

### 통합 테스트

```bash
# 실제 DB 연결 후
npm run test:integration
```

---

## 📊 버전 히스토리 조회

### SQL로 조회

```sql
-- 특정 Policy의 모든 버전
SELECT id, name, version, "isActive", "updatedAt", description
FROM "Policy"
WHERE name = '문서 결재 정책'
ORDER BY version DESC;
```

### API로 조회

```typescript
const getVersionHistory = async (policyName: string) => {
  const response = await fetch('/api/policies')
  const { data } = await response.json()
  
  return data
    .filter(p => p.name === policyName)
    .sort((a, b) => b.version - a.version)
}

// 사용
const history = await getVersionHistory('문서 결재 정책')
history.forEach(v => {
  console.log(`v${v.version}: ${v.isActive ? '활성' : '비활성'} - ${v.description}`)
})
```

---

## ⚠️ 주의사항

### 1. 수동 버전 관리

- State를 추가/삭제해도 **자동으로 버전이 올라가지 않습니다**
- 중요한 변경 사항이 있을 때 **수동으로 버전 업**해야 합니다

### 2. 이전 버전 관리

- 새 버전 생성 시 이전 버전은 **자동 비활성화**됩니다
- 롤백이 필요하면 이전 버전을 다시 활성화:

```bash
PATCH /api/policies/old-version-id
{ "isActive": true }
```

### 3. States 복사

- 기본적으로 States와 Permissions가 복사됩니다
- `copyStates: false` 옵션으로 복사 생략 가능

---

## 📚 관련 문서

- **API 레퍼런스**: `API_GUIDE.md`
- **Prisma Schema**: `prisma/schema.prisma`
- **테스트 가이드**: `TEST_GUIDE.md`
- **Postman Collection**: `postman/Policy-API-Collection.v2.json`

---

**Manual Versioning Made Easy! 🚀**

