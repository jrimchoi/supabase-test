# Postman API Collections

이 폴더는 Supabase Test 프로젝트의 API 테스트를 위한 Postman 컬렉션을 포함합니다.

## 📦 파일 목록

### 주요 컬렉션

1. **Complete-API-Collection.json** ⭐ (최신, 권장)
   - 모든 API 엔드포인트 포함 (17개 카테고리)
   - 각 엔드포인트별 샘플 데이터 포함
   - 2025-11-04 업데이트
   - **사용 가이드**: `COMPLETE_API_GUIDE.md` 참고

2. **Policy-API-Collection.v2.json**
   - Policy 관련 API 컬렉션 (이전 버전)
   - 하위 호환성 유지

3. **Policy-API-Collection.json**
   - Policy 관련 API 컬렉션 (초기 버전)

### Environment 파일

1. **Complete-Environment.json** ⭐ (최신, 권장)
   - 모든 API 변수 포함
   - baseUrl, ID 변수, 인증 토큰 등

2. **Local-Environment.json**
   - 로컬 환경 설정 (이전 버전)

## 🚀 빠른 시작

### 1. Postman 설치
- [Postman 다운로드](https://www.postman.com/downloads/)

### 2. Collection Import
```
1. Postman 실행
2. Import 버튼 클릭
3. Complete-API-Collection.json 선택
4. Complete-Environment.json 선택
```

### 3. Environment 설정
```
1. 우측 상단 Environment 드롭다운
2. "Complete Environment" 선택
3. baseUrl 확인: http://localhost:3000
```

### 4. 첫 API 테스트
```
1. Auth > Set Session Cookie 실행 (선택사항)
2. Policies > List Policies 실행
3. 200 OK 응답 확인
```

## 📚 상세 가이드

### 전체 API 가이드
👉 **[COMPLETE_API_GUIDE.md](./COMPLETE_API_GUIDE.md)** - 모든 API 엔드포인트 상세 설명

### 빠른 시작 가이드
👉 **[QUICKSTART.md](./QUICKSTART.md)** - 5분 안에 시작하기

## 📋 API 카테고리 (17개)

1. **Auth** - 인증 및 세션 관리
2. **Policies** - 정책 관리
3. **States** - 상태 관리
4. **State Transitions** - 상태 전환
5. **Types** - 타입 정의
6. **Attributes** - 속성 정의
7. **Business Objects** - 비즈니스 객체
8. **Relationships** - 타입 간 관계
9. **Business Relations** - 객체 간 관계
10. **Roles** - 역할 관리
11. **Groups** - 그룹 관리
12. **Permissions** - 권한 관리
13. **User Roles** - 사용자-역할 매핑
14. **User Groups** - 사용자-그룹 매핑
15. **User Permissions** - 사용자 권한
16. **Users** - 사용자 검색
17. **Utilities** - 유틸리티 (쿼리 테스트 등)

## 🎯 주요 기능

### ✅ 완전한 CRUD 지원
- 모든 리소스에 대해 Create, Read, Update, Delete 지원

### ✅ 샘플 데이터 포함
- 각 엔드포인트에 실제 사용 가능한 샘플 데이터 제공
- 복사-붙여넣기로 즉시 테스트 가능

### ✅ 필터링 및 검색
- Business Objects: typeId, policyId, currentState 등으로 필터링
- Permissions: stateId, targetType, targetId로 필터링
- 페이징 지원 (page, limit)

### ✅ Environment 변수
- ID 변수 자동 관리
- baseUrl 환경별 설정 가능

## 📊 샘플 워크플로우

### Policy 시스템 설정
```
POST /api/policies           # 1. 정책 생성
POST /api/states             # 2. 상태 생성 (Draft, Approved 등)
POST /api/state-transitions  # 3. 전환 정의
POST /api/types              # 4. 타입 생성 (Invoice 등)
POST /api/attributes         # 5. 속성 정의
```

### Business Object 생성
```
POST /api/business-objects   # 객체 생성 (data 필드에 JSON)
GET  /api/business-objects   # 목록 조회 (필터링/페이징)
PUT  /api/business-objects/:id  # 상태 변경 및 데이터 수정
```

### 권한 설정
```
POST /api/roles              # 역할 생성
POST /api/groups             # 그룹 생성
POST /api/permissions        # 권한 정의 (expression 포함)
POST /api/user-roles         # 사용자에게 역할 할당
```

## 🔧 문제 해결

### 401 Unauthorized
- Supabase Auth 로그인 필요
- `Auth > Set Session Cookie` 실행

### 404 Not Found
- Environment 변수의 ID 확인
- 존재하는 리소스 ID 사용

### 400 Bad Request
- 필수 필드 확인
- JSON 형식 검증
- 샘플 데이터 참고

## 📝 버전 히스토리

### v1.0.0 (2025-11-04)
- ✨ Complete API Collection 추가
- ✨ 17개 카테고리, 100+ 엔드포인트
- ✨ 모든 엔드포인트에 샘플 데이터 포함
- ✨ Environment 변수 완전 지원
- 📚 COMPLETE_API_GUIDE.md 추가

### v0.2.0 (이전)
- Policy API Collection v2

### v0.1.0 (초기)
- Policy API Collection 초기 버전

## 🔗 관련 문서

- [프로젝트 README](../README.md)
- [API 문서](../docs/api/)
- [데이터베이스 모델](../docs/database/)
- [테스트 가이드](../docs/testing/)

## 💡 팁

1. **Collection Runner 사용**: 여러 요청을 순차적으로 실행
2. **Tests 탭 활용**: 응답 검증 자동화
3. **Pre-request Script**: 변수 자동 설정
4. **환경 전환**: Local ↔ Production 간편하게 전환

---

**도움이 필요하신가요?**
- 📖 [COMPLETE_API_GUIDE.md](./COMPLETE_API_GUIDE.md) - 전체 가이드
- 🚀 [QUICKSTART.md](./QUICKSTART.md) - 빠른 시작
- 🐛 Issues 탭에서 문의

**마지막 업데이트**: 2025-11-04
