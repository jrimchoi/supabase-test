# Complete API Collection Guide

## 📋 개요

이 컬렉션은 Supabase Test 프로젝트의 모든 API 엔드포인트를 포함하며, 각 엔드포인트에 대한 샘플 데이터를 제공합니다.

## 🚀 빠른 시작

### 1. Postman에서 Import

1. Postman 실행
2. `Import` 버튼 클릭
3. `Complete-API-Collection.json` 파일 선택
4. `Complete-Environment.json` 파일도 Import

### 2. Environment 설정

- Collection 우측 상단에서 `Complete Environment` 선택
- 필요한 변수 값 설정:
  - `baseUrl`: 기본값 `http://localhost:3000`
  - 기타 ID 변수들은 요청 후 자동으로 저장 가능

## 📁 API 카테고리

### 1. Auth (인증)
- **Logout**: 로그아웃
- **Set Session Cookie**: JWT 토큰을 쿠키로 저장
- **Get Session Status**: 세션 상태 확인
- **Set Supabase Session**: Supabase 세션 설정
- **Ensure Profile**: 프로필 확인/생성

### 2. Policies (정책)
- **List**: 모든 정책 조회
- **Create**: 새 정책 생성
  - Sample: `Invoice Policy` with revision sequence
- **Get by ID**: 특정 정책 조회
- **Update**: 정책 수정
- **Delete**: 정책 삭제
- **Get Dependencies**: 정책 종속성 확인
- **Deactivate Others**: 다른 정책 비활성화

### 3. States (상태)
- **List**: 정책별 상태 목록
- **Create**: 새 상태 생성
  - Sample: `Draft` state with initial/final flags
- **Get by ID**: 특정 상태 조회
- **Update**: 상태 수정
- **Delete**: 상태 삭제

### 4. State Transitions (상태 전환)
- **List**: 정책별 전환 목록
- **Create**: 새 전환 생성
  - Sample: Manager approval transition with condition
- **Get by ID**: 특정 전환 조회
- **Update**: 전환 수정
- **Delete**: 전환 삭제

### 5. Types (타입)
- **List**: 정책별 타입 목록
- **Create**: 새 타입 생성
  - Sample: `Invoice` type with prefix
- **Get by ID**: 특정 타입 조회
- **Update**: 타입 수정
- **Delete**: 타입 삭제

### 6. Attributes (속성)
- **List**: 모든 속성 조회
- **Search**: 속성 검색
- **Create**: 새 속성 생성
  - Sample: `invoiceNumber` attribute
- **Get by ID**: 특정 속성 조회
- **Update**: 속성 수정
- **Delete**: 속성 삭제

### 7. Business Objects (비즈니스 객체)
- **List**: 객체 목록 (페이징 지원)
  - Query params: `page`, `limit`, `typeId`, `policyId`, `currentState`
- **Create**: 새 객체 생성
  - Sample: Invoice with complete data structure
- **Get by ID**: 특정 객체 조회
- **Update**: 객체 수정
- **Delete**: 객체 삭제

**샘플 데이터:**
```json
{
  "typeId": "type_id_here",
  "policyId": "policy_id_here",
  "currentState": "Draft",
  "name": "송장-2024-001",
  "data": {
    "invoiceNumber": "INV-2024-001",
    "customerName": "ABC Company",
    "totalAmount": 1000000,
    "isPaid": false,
    "issueDate": "2024-11-04"
  }
}
```

### 8. Relationships (타입 관계)
- **List**: 모든 관계 정의 조회
- **Create**: 새 관계 정의 생성
  - Sample: `Invoice-Customer` relationship
- **Get by ID**: 특정 관계 조회
- **Update**: 관계 수정
- **Delete**: 관계 삭제

### 9. Business Relations (객체 관계)
- **List**: 객체 간 관계 목록
- **Create**: 새 객체 관계 생성
- **Get by ID**: 특정 관계 조회
- **Update**: 관계 수정
- **Delete**: 관계 삭제

### 10. Roles (역할)
- **List**: 모든 역할 조회
- **Create**: 새 역할 생성
  - Sample: `Manager` role
- **Get by ID**: 특정 역할 조회
- **Update**: 역할 수정
- **Delete**: 역할 삭제
- **Get Dependencies**: 역할 종속성 확인

### 11. Groups (그룹)
- **List**: 모든 그룹 조회
- **Create**: 새 그룹 생성
  - Sample: `Finance Team` group
- **Get by ID**: 특정 그룹 조회
- **Update**: 그룹 수정
- **Delete**: 그룹 삭제

### 12. Permissions (권한)
- **List**: 권한 목록 (필터링 지원)
- **Create**: 새 권한 생성
  - Sample: Multi-action permission with expression
- **Get by ID**: 특정 권한 조회
- **Update**: 권한 수정
- **Delete**: 권한 삭제

**샘플 데이터:**
```json
{
  "stateId": "state_id_here",
  "resource": "Invoice",
  "action": "create,view,modify",
  "targetType": "role",
  "targetId": "role_id_here",
  "expression": "user.department === 'finance'"
}
```

### 13. User Roles (사용자-역할)
- **List**: 사용자-역할 매핑 목록
- **Create**: 새 매핑 생성
- **Get by ID**: 특정 매핑 조회
- **Delete**: 매핑 삭제

### 14. User Groups (사용자-그룹)
- **List**: 사용자-그룹 매핑 목록
- **Create**: 새 매핑 생성
- **Get by ID**: 특정 매핑 조회
- **Delete**: 매핑 삭제

### 15. User Permissions (사용자 권한)
- **List**: 사용자별 권한 목록
- **Create**: 새 사용자 권한 생성
- **Get by ID**: 특정 권한 조회
- **Update**: 권한 수정
- **Delete**: 권한 삭제

### 16. Users (사용자)
- **Search**: 사용자 검색

### 17. Utilities (유틸리티)
- **Query Test**: SQL 쿼리 테스트
  - Direct 또는 Pool 연결 선택 가능
- **Table Spec**: 테이블 스펙 조회

## 🔄 워크플로우 예시

### 1. Policy 기반 시스템 설정

```
1. Create Policy
   ↓
2. Create States (Draft, Pending, Approved)
   ↓
3. Create State Transitions
   ↓
4. Create Types (Invoice, etc.)
   ↓
5. Create Attributes
   ↓
6. Create Roles & Groups
   ↓
7. Create Permissions
```

### 2. Business Object 생성 및 관리

```
1. Create Business Object with data
   ↓
2. Create Relationships between Types
   ↓
3. Create Business Relations between Objects
   ↓
4. Update Object State
   ↓
5. Assign User Roles/Groups
```

### 3. 권한 설정

```
1. Create Roles & Groups
   ↓
2. Create Permissions for States
   ↓
3. Assign Users to Roles/Groups
   ↓
4. Create User-specific Permissions
```

## 📊 샘플 데이터 템플릿

### Policy
```json
{
  "name": "Invoice Policy",
  "description": "송장 처리를 위한 정책",
  "version": 1,
  "revisionSequence": "A,B,C",
  "isActive": true
}
```

### State
```json
{
  "name": "Draft",
  "description": "초안 상태",
  "policyId": "{{policyId}}",
  "order": 1,
  "isInitial": true,
  "isFinal": false
}
```

### Type
```json
{
  "type": "invoice",
  "name": "Invoice",
  "description": "송장 문서 타입",
  "policyId": "{{policyId}}",
  "prefix": "INV",
  "parentId": null
}
```

### Attribute
```json
{
  "name": "invoiceNumber",
  "label": "Invoice Number",
  "description": "고유 송장 번호",
  "attrType": "STRING",
  "isRequired": true,
  "defaultValue": null
}
```

### Business Object
```json
{
  "typeId": "{{typeId}}",
  "policyId": "{{policyId}}",
  "currentState": "Draft",
  "name": "송장-2024-001",
  "description": "2024년 첫 번째 송장",
  "data": {
    "invoiceNumber": "INV-2024-001",
    "customerName": "ABC Company",
    "totalAmount": 1000000,
    "isPaid": false,
    "issueDate": "2024-11-04"
  }
}
```

### Permission
```json
{
  "stateId": "{{stateId}}",
  "resource": "Invoice",
  "action": "create,view,modify",
  "targetType": "role",
  "targetId": "{{roleId}}",
  "expression": "user.department === 'finance'"
}
```

## 🔍 필터링 및 검색

### Business Objects
- `typeId`: 특정 타입의 객체만 조회
- `policyId`: 특정 정책의 객체만 조회
- `currentState`: 특정 상태의 객체만 조회
- `page`: 페이지 번호
- `limit`: 페이지당 항목 수

### Permissions
- `stateId`: 특정 상태의 권한만 조회
- `targetType`: role, group, user
- `targetId`: 특정 대상의 권한만 조회

### States & Transitions
- `policyId`: 특정 정책의 상태/전환만 조회

## 💡 팁

1. **Environment 변수 활용**: 
   - 생성된 ID를 Environment 변수로 저장
   - 후속 요청에서 재사용

2. **페이징 활용**:
   - Business Objects는 기본 20개씩 조회
   - `limit` 파라미터로 조정 가능 (최대 100)

3. **Expression 테스트**:
   - Permission의 `expression` 필드로 조건부 권한 설정
   - JavaScript 표현식 사용 가능

4. **Multi-action**:
   - Permission의 `action`은 쉼표로 구분된 여러 액션 지원
   - 예: `"create,view,modify,delete"`

## 🐛 문제 해결

### 401 Unauthorized
- 로그인 필요 (Supabase Auth)
- `Set Session Cookie` 또는 `Set Supabase Session` 실행

### 404 Not Found
- ID 확인
- Environment 변수 설정 확인

### 400 Bad Request
- 필수 필드 확인
- JSON 형식 확인
- 샘플 데이터 참고

## 📝 주의사항

1. **ID 변수**: 샘플의 `*_id_here`를 실제 ID로 교체 필요
2. **순서**: Policy → State → Type → Attribute 순서로 생성 권장
3. **Dependencies**: 삭제 전 종속성 확인 (Dependencies API 사용)
4. **Pagination**: Business Objects는 페이징 지원 (최신순 정렬)

## 🔗 관련 문서

- [API 아키텍처](../docs/api/)
- [데이터베이스 모델](../docs/database/)
- [테스트 가이드](../docs/testing/)

---

**마지막 업데이트**: 2025-11-04  
**버전**: 1.0.0

