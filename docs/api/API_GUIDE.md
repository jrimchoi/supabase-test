# Policy 기반 권한 관리 시스템 - API 가이드

## 📋 개요

이 문서는 Policy 기반 권한 관리 시스템의 백엔드 CRUD API 사용법을 설명합니다.

## 🔧 기술 스택

- **Framework**: Next.js 16 App Router
- **ORM**: Prisma Client
- **Database**: PostgreSQL (Supabase)
- **Language**: TypeScript

---

## 🔄 Policy 버전 관리

### 수동 버전 업 (Manual Only)

모든 버전 업은 **수동으로만** 수행됩니다:

- 🖐️ **Policy 수정** → `createNewVersion: true` 옵션으로 수동 버전 업
- ❌ **State 추가/삭제** → 버전 변경 없음 (자동 버전 업 없음)
- ❌ **State 수정** → 버전 변경 없음

**핵심**: State를 추가/삭제해도 Policy 버전은 자동으로 변경되지 않습니다!

자세한 내용은 **`MANUAL_VERSION_GUIDE.md`** 참조

---

## 📂 API 엔드포인트 구조

각 리소스는 다음 패턴을 따릅니다:

```
GET    /api/{resource}      - 목록 조회
POST   /api/{resource}      - 생성
GET    /api/{resource}/{id} - 단일 조회
PATCH  /api/{resource}/{id} - 수정
DELETE /api/{resource}/{id} - 삭제
```

---

## 🗂️ 리소스 목록

### 1. Policy (권한 정책)

**엔드포인트**: `/api/policies`

#### 목록 조회
```bash
GET /api/policies                          # 전체 조회
GET /api/policies?include=states           # State 포함
GET /api/policies?latestVersion=true       # 최신 버전만
GET /api/policies?onlyActive=true          # 활성화된 것만
```

#### 생성
```bash
POST /api/policies
Content-Type: application/json

# 새 Policy (v1)
{
  "name": "문서 결재 정책",
  "description": "문서 결재 흐름 관리",
  "isActive": true,
  "createdBy": "user-id"
}

# 기존 Policy의 새 버전
{
  "name": "문서 결재 정책",
  "description": "수정된 흐름",
  "newVersion": true  # v2, v3, ... 자동 생성
}
```

#### 수정
```bash
# 일반 수정 (버전 변경 없음)
PATCH /api/policies/{id}
{
  "description": "설명 수정"
}

# 버전 업과 함께 수정
PATCH /api/policies/{id}
{
  "description": "대폭 수정",
  "createNewVersion": true  # 수동 버전 업
}
```

---

### 2. State (상태)

**엔드포인트**: `/api/states`

#### 생성

```bash
POST /api/states
{
  "policyId": "policy-id",
  "name": "Review",
  "description": "검토 단계",
  "order": 3
}

# 응답
{
  "success": true,
  "data": { "id": "state-456", "name": "Review", ... }
}
```

**참고**: State 추가만 수행됩니다. Policy 버전은 변경되지 않습니다.

#### 삭제

```bash
DELETE /api/states/{id}

# 응답
{
  "success": true,
  "message": "State가 삭제되었습니다."
}
```

**참고**: State 삭제만 수행됩니다. Policy 버전은 변경되지 않습니다.

#### 수정

```bash
PATCH /api/states/{id}
{
  "description": "설명 수정",
  "order": 4
}
# Policy 버전 변경 없음
```

---

### 3. Permission (권한)

**엔드포인트**: `/api/permissions`

#### 생성

```bash
POST /api/permissions
{
  "stateId": "state-id",
  "resource": "document",
  "action": "modify",
  "targetType": "role",
  "roleId": "role-id",
  "isAllowed": true
}
```

**targetType별 필수 필드**:
- `"role"` → `roleId` 필수
- `"group"` → `groupId` 필수
- `"user"` → `userId` 필수

---

### 4. Role (역할)

**엔드포인트**: `/api/roles`

```bash
# 생성
POST /api/roles
{ "name": "Manager", "description": "관리자" }

# 목록 조회
GET /api/roles?include=permissions,users
```

---

### 5. Group (그룹)

**엔드포인트**: `/api/groups`

```bash
# 생성
POST /api/groups
{ "name": "개발팀", "description": "소프트웨어 개발팀" }

# 계층 구조 생성
POST /api/groups
{ "name": "백엔드팀", "parentId": "개발팀-id" }
```

---

### 6. UserRole (User-Role 매핑)

**엔드포인트**: `/api/user-roles`

```bash
# User에게 Role 할당
POST /api/user-roles
{ "userId": "user-id", "roleId": "role-id" }

# User의 Role 조회
GET /api/user-roles?userId={userId}
```

---

### 7. UserGroup (User-Group 매핑)

**엔드포인트**: `/api/user-groups`

```bash
# User에게 Group 할당
POST /api/user-groups
{ "userId": "user-id", "groupId": "group-id" }
```

---

### 8. UserPermission (User별 직접 권한)

**엔드포인트**: `/api/user-permissions`

```bash
POST /api/user-permissions
{
  "userId": "user-id",
  "stateId": "state-id",
  "resource": "document",
  "action": "modify",
  "isAllowed": true
}
```

---

## 🧪 테스트 시나리오

### 시나리오 1: Policy 생성 → State 추가

```bash
# 1. Policy 생성 (v1)
POST /api/policies
{ "name": "문서 결재 정책" }
→ { "version": 1, "isActive": true }

# 2. State 추가 (버전 변경 없음)
POST /api/states
{ "policyId": "policy-v1-id", "name": "Review", "order": 2 }
→ Policy는 여전히 v1

# 3. 또 다른 State 추가 (버전 변경 없음)
POST /api/states
{ "policyId": "policy-v1-id", "name": "Approve", "order": 3 }
→ Policy는 여전히 v1
```

### 시나리오 2: 수동 버전 업

```bash
# 대폭 수정 시
PATCH /api/policies/{id}
{
  "description": "전면 개편",
  "createNewVersion": true
}
→ Policy v5 생성
```

---

## 📊 응답 형식

### 성공 응답
```json
{
  "success": true,
  "data": { /* ... */ },
  "message": "State 추가 및 Policy v2 생성됨"  // 선택적
}
```

### 에러 응답
```json
{
  "success": false,
  "error": "에러 메시지"
}
```

---

## 🔍 Query Parameters

### `include` (관계 포함)

| 리소스 | include 옵션 |
|--------|-------------|
| Policy | `states` |
| State | `policy`, `transitions`, `permissions` |
| StateTransition | `states` |
| Permission | `state`, `role`, `group` |
| Role | `permissions`, `users` |
| Group | `parent`, `children`, `permissions`, `users` |

### Policy 전용 옵션

| 옵션 | 설명 |
|------|------|
| `latestVersion=true` | 각 Policy의 최신 버전만 조회 |
| `onlyActive=true` | 활성화된 Policy만 조회 |

---

## 📚 관련 문서

- **버전 관리**: `AUTO_VERSION_GUIDE.md` ⭐
- **통합 테스트**: `INTEGRATION_TEST_GUIDE.md`
- **문제 해결**: `INTEGRATION_TEST_TROUBLESHOOTING.md`
- **Prisma Schema**: `prisma/schema.prisma`
- **프로젝트 규칙**: `.cursorrules`

---

**Happy Coding! 🚀**
