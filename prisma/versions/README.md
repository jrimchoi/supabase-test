# Prisma Schema Versions

## 버전 관리 규칙

### 파일 네이밍
```
schema.v{MAJOR}.{MINOR}.prisma
```

**예시:**
- `schema.v2.0.prisma` - 초기 완전한 스키마
- `schema.v2.1.prisma` - owner 필드 추가
- `schema.v2.2.prisma` - Profile 관계 추가

### 버전 업데이트 프로세스

**새로운 버전 생성 시:**

```bash
# 1. 현재 schema.prisma를 새 버전으로 백업
cp prisma/schema.prisma prisma/versions/schema.v2.1.prisma

# 2. prisma/schema.prisma 수정
# (원하는 변경사항 적용)

# 3. schema 파일에 버전 주석 업데이트
# Line 1-2:
# // Prisma Schema for Policy-based Permission Management System
# // Version: 2.1 (YYYY-MM-DD) - {변경사항 설명}

# 4. Prisma Client 재생성
npx prisma generate

# 5. Supabase에 적용
npx prisma db push

# 6. src/types/*.ts 업데이트 (필요시)

# 7. 빌드 테스트
npm run build

# 8. SQL 마이그레이션 파일 생성
# supabase/migrations/v2.1_{description}.sql

# 9. Git 커밋
git add prisma/schema.prisma prisma/versions supabase/migrations src/types
git commit -m "feat: Schema v2.1 - {변경사항}"
```

### 버전 롤백

이전 버전으로 롤백이 필요한 경우:

```bash
# 1. 이전 버전 복원
cp prisma/versions/schema.v2.0.prisma prisma/schema.prisma

# 2. Prisma Client 재생성
npx prisma generate

# 3. 빌드 테스트
npm run build
```

## 현재 버전 히스토리

### v2.0 (2025-11-04)
**초기 완전한 스키마**

주요 테이블:
- Policy (권한 정책)
  - createdBy, updatedBy 추가
  - revisionSequence 기본값: "A,B,C"
  
- State (상태 정의)
  - order, isInitial, isFinal 필드
  
- Type (비즈니스 타입)
  - 계층 구조 지원 (parent, children)
  - prefix, name 필드로 상속 가능
  
- BusinessObject (인스턴스)
  - owner, createdBy, updatedBy 필드
  - data (Json) 필드로 EAV 패턴 지원
  - revision 자동 할당
  
- BusinessObjectRelationship
  - data (Json) 필드로 관계별 속성 저장
  - createdBy, updatedBy 추가
  
- Group (그룹)
  - parentId, isActive 필드
  - 계층 구조 지원
  
- Profile (사용자)
  - auth.users 연동
  - UserRole, UserGroup에서 참조

주요 기능:
- ✅ Policy 기반 권한 관리
- ✅ State 전이 시스템
- ✅ EAV 패턴 (Type/Attribute → BusinessObject.data)
- ✅ 리비전 자동 할당
- ✅ Profile 연동 (auth.users)
- ✅ 계층 구조 (Type, Group)

PreviewFeatures:
- ❌ relationJoins 제거 (프로덕션 안정성)

## 버전 비교

### v1.x → v2.0 주요 변경사항

추가된 필드:
- `Policy.createdBy`, `Policy.updatedBy`
- `BusinessObject.owner`, `BusinessObject.createdBy`, `BusinessObject.updatedBy`
- `BusinessObjectRelationship.data`, `BusinessObjectRelationship.createdBy`, `BusinessObjectRelationship.updatedBy`
- `Group.parentId`, `Group.isActive`

추가된 관계:
- `UserRole.user → Profile`
- `UserGroup.user → Profile`
- `Group.parent`, `Group.children` (계층 구조)
- `Type.parent`, `Type.children` (계층 구조)

제거된 기능:
- `previewFeatures = ["relationJoins"]` (프로덕션 미권장)

## 참고사항

- 모든 schema 버전은 Git으로 추적됩니다
- 버전 파일은 참조용으로만 사용 (실제 적용은 schema.prisma)
- 중요한 변경사항은 마이그레이션 SQL과 함께 관리
- 프로덕션 배포 전 반드시 백업

