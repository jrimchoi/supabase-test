# Team Workflow 문서 인덱스

> **생성일**: 2025-11-02  
> **총 문서 수**: 46개  
> **문서 구조**: 재구성 완료 ✅

---

## 📂 문서 구조 요약

```
루트/
├── README.md                          # 프로젝트 메인 README
├── DOCUMENTATION_INDEX.md             # 이 파일 (문서 인덱스)
│
├── user_scenario/ (5개)               # 사용자 시나리오 및 테스트
│   ├── README.md
│   ├── USER_SCENARIO_TEST.md          # 7개 시나리오, 42개 스크린샷
│   ├── TEST_CHECKLIST.md              # 113개 체크리스트
│   ├── TEST_REPORT.md                 # 테스트 결과 (100% 통과) ⭐
│   └── UI_COMPONENTS.md               # UI 컴포넌트 가이드
│
└── docs/ (40개)                       # 기술 문서
    ├── README.md                      # 문서 센터 메인
    ├── database/ (7개)                # 데이터베이스
    │   ├── DATABASE_MODEL_GUIDE.md    # 통합 가이드 ⭐
    │   ├── BUSINESS_ATTRIBUTE_GUIDE.md
    │   ├── BUSINESS_MODEL_GUIDE.md
    │   ├── BUSINESS_OBJECT_REVISION.md
    │   ├── SCHEMA_V2_GUIDE.md
    │   ├── SCHEMA_V2_CHANGES.md
    │   └── RLS_PUBLIC_READ_SETUP.md
    ├── api/ (1개)                     # API
    │   └── API_GUIDE.md
    ├── testing/ (13개)                # 테스트
    │   ├── TESTING_GUIDE.md
    │   ├── INTEGRATION_TEST_GUIDE.md
    │   ├── INTEGRATION_TEST_PERFORMANCE.md
    │   ├── INTEGRATION_TEST_TROUBLESHOOTING.md
    │   ├── INTEGRATION_TEST_FIX.md
    │   ├── INSTALL_TESTS.md
    │   ├── QUICK_TEST_GUIDE.md
    │   ├── RUN_TESTS.md
    │   ├── TEST_GUIDE.md
    │   ├── TEST_ENV_SETUP.md
    │   ├── TEST_STATUS.md
    │   ├── README_TESTS.md
    │   └── CREATE_ENV_TEST.md, DEBUG_USER_LIST.md
    ├── auth/ (2개)                    # 인증
    │   ├── AUTH_FLOW_TEST.md
    │   └── DEBUG_AUTH.md
    ├── ui/ (8개)                      # UI/UX
    │   ├── TABLE_COMPLETE_GUIDE.md
    │   ├── ADMIN_UI_SUMMARY.md
    │   ├── HORIZONTAL_SCROLL_FIX.md
    │   ├── SCROLLBAR_FIX.md
    │   ├── STICKY_HEADER_FIX.md
    │   ├── PAGINATION_GUIDE.md
    │   ├── PAGINATION_V2_GUIDE.md
    │   └── RESPONSIVE_NAVBAR.md
    ├── setup/ (4개)                   # 환경 설정
    │   ├── ENV_SETUP_GUIDE.md
    │   ├── FIX_ENV_LOCAL.md
    │   ├── FIX_POOLER_ERROR.md
    │   └── NEXTJS_CACHING_GUIDE.md
    └── archive/ (4개)                 # 아카이브
        ├── CONCURRENCY_EXPLAINED.md
        ├── MANUAL_VERSION_GUIDE.md
        ├── QUICK_FIX.md
        └── SUMMARY.md
```

---

## ⭐ 통합 가이드 (필수 읽기)

### 1. 데이터베이스
**`docs/database/DATABASE_MODEL_GUIDE.md`**

**내용**:
- Policy & State 관리
- Type 시스템 (계층 구조)
- Attribute 시스템
- BusinessObject (EAV 패턴)
- 리비전 자동 할당
- 권한 관리 (Permission, Role, Group)
- 삭제 제약 (onDelete: Restrict)
- 마이그레이션 가이드

**기존 문서 통합**:
- ✅ BUSINESS_ATTRIBUTE_GUIDE.md
- ✅ BUSINESS_MODEL_GUIDE.md
- ✅ BUSINESS_OBJECT_REVISION.md
- ✅ SCHEMA_V2_GUIDE.md
- ✅ SCHEMA_V2_CHANGES.md
- ✅ RLS_PUBLIC_READ_SETUP.md

---

### 2. 사용자 시나리오
**`user_scenario/USER_SCENARIO_TEST.md`**

**내용**:
- 7개 시나리오 (송장 관리 시스템 구축)
- 20개 세부 단계
- 42개 필수 스크린샷
- 검증 항목 체크리스트

**시나리오 목록**:
1. Policy 및 State 설정
2. Type 및 Attribute 정의
3. 권한 설정 (Role, Group, Permission)
4. BusinessObject 생성 및 관리
5. 다크모드 및 UI 테스트
6. Policy 삭제 제약 테스트
7. 프로필 및 로그아웃

---

### 3. 테스트 결과
**`user_scenario/TEST_REPORT.md`**

**내용**:
- 자동화 테스트 결과 (58개, 100% 통과)
- 단위 테스트: 51개 (0.285초)
- 통합 테스트: 7개 (38.241초)
- 수동 테스트 가이드
- 성능 지표

**검증된 기능**:
- ✅ Policy-Type Many-to-Many
- ✅ 리비전 자동 할당 (순환)
- ✅ EAV 패턴 (JSON)
- ✅ Type 계층 구조 (상속)
- ✅ ScrollableTable
- ✅ Drawer UI
- ✅ 다크모드

---

## 📚 카테고리별 문서

### Database (7개)

| 문서 | 설명 | 우선순위 |
|------|------|----------|
| **DATABASE_MODEL_GUIDE.md** | 통합 가이드 ⭐ | 필수 |
| BUSINESS_ATTRIBUTE_GUIDE.md | Attribute 상세 | 참고 |
| BUSINESS_MODEL_GUIDE.md | 비즈니스 모델 | 참고 |
| BUSINESS_OBJECT_REVISION.md | 리비전 시스템 | 참고 |
| SCHEMA_V2_GUIDE.md | 스키마 v2 가이드 | 참고 |
| SCHEMA_V2_CHANGES.md | v2 변경 사항 | 참고 |
| RLS_PUBLIC_READ_SETUP.md | RLS 설정 | 참고 |

---

### API (1개)

| 문서 | 설명 |
|------|------|
| API_GUIDE.md | API 엔드포인트 가이드 |

**주요 엔드포인트**:
- `/api/policies`, `/api/states`, `/api/types`
- `/api/attributes`, `/api/business-objects`
- `/api/roles`, `/api/groups`, `/api/permissions`

---

### Testing (13개)

| 문서 | 설명 | 우선순위 |
|------|------|----------|
| **TESTING_GUIDE.md** | 테스트 전체 가이드 | 필수 |
| INTEGRATION_TEST_GUIDE.md | 통합 테스트 | 중요 |
| INTEGRATION_TEST_PERFORMANCE.md | 성능 테스트 | 참고 |
| INTEGRATION_TEST_TROUBLESHOOTING.md | 트러블슈팅 | 참고 |
| QUICK_TEST_GUIDE.md | 빠른 테스트 | 중요 |
| RUN_TESTS.md | 테스트 실행 | 중요 |
| (기타 8개) | 환경, 디버깅 등 | 참고 |

---

### Auth (2개)

| 문서 | 설명 |
|------|------|
| AUTH_FLOW_TEST.md | 인증 플로우 테스트 |
| DEBUG_AUTH.md | 인증 디버깅 |

**지원 인증**:
- Google OAuth, GitHub OAuth
- Email OTP (Magic Link)
- Email/Password

---

### UI (8개)

| 문서 | 설명 | 우선순위 |
|------|------|----------|
| **TABLE_COMPLETE_GUIDE.md** | 테이블 UI 완전 가이드 | 필수 |
| ADMIN_UI_SUMMARY.md | Admin UI 요약 | 중요 |
| PAGINATION_V2_GUIDE.md | Pagination v2 | 중요 |
| RESPONSIVE_NAVBAR.md | 반응형 NavBar | 중요 |
| (기타 4개) | UI 버그 수정 기록 | 참고 |

**주요 UI 특징**:
- ScrollableTable (헤더 고정, 리사이즈, ellipsis)
- Drawer (오른쪽 슬라이드)
- 다크모드 (next-themes)

---

### Setup (4개)

| 문서 | 설명 |
|------|------|
| **ENV_SETUP_GUIDE.md** | 환경 변수 설정 |
| FIX_POOLER_ERROR.md | Pooler 에러 해결 |
| FIX_ENV_LOCAL.md | .env.local 수정 |
| NEXTJS_CACHING_GUIDE.md | Next.js 캐싱 |

---

### Archive (4개)

참고용 아카이브 문서:
- CONCURRENCY_EXPLAINED.md
- MANUAL_VERSION_GUIDE.md
- QUICK_FIX.md
- SUMMARY.md

---

## 🎯 문서 사용 가이드

### 시작하기 (처음 사용자)

1. **README.md** (루트)
   - 프로젝트 개요

2. **docs/database/DATABASE_MODEL_GUIDE.md**
   - 데이터 모델 전체 구조
   - Policy, State, Type, BusinessObject

3. **user_scenario/USER_SCENARIO_TEST.md**
   - 실제 사용 시나리오
   - 단계별 가이드

4. **user_scenario/UI_COMPONENTS.md**
   - UI 컴포넌트 사용법

---

### 개발자 (코드 수정)

1. **docs/database/DATABASE_MODEL_GUIDE.md**
   - Prisma 스키마
   - 데이터 관계

2. **docs/api/API_GUIDE.md**
   - API 엔드포인트
   - Request/Response

3. **docs/testing/TESTING_GUIDE.md**
   - 테스트 작성법
   - Jest, Prisma Mock

4. **docs/ui/TABLE_COMPLETE_GUIDE.md**
   - ScrollableTable 구현
   - 컬럼 리사이즈, ellipsis

---

### 테스터 (QA)

1. **user_scenario/TEST_REPORT.md** ⭐
   - 자동화 테스트 결과
   - 100% 통과 확인

2. **user_scenario/USER_SCENARIO_TEST.md**
   - 7개 시나리오
   - 42개 스크린샷

3. **user_scenario/TEST_CHECKLIST.md**
   - 113개 체크리스트
   - 통과/실패 기록

---

## 📊 문서 통계

### 카테고리별 분포

| 카테고리 | 문서 수 | 비율 |
|---------|--------|------|
| Testing | 13 | 28% |
| UI | 8 | 17% |
| Database | 7 | 15% |
| User Scenario | 5 | 11% |
| Setup | 4 | 9% |
| Archive | 4 | 9% |
| Auth | 2 | 4% |
| API | 1 | 2% |
| Docs Index | 2 | 4% |
| **합계** | **46** | **100%** |

### 통합 문서 (새로 작성)

| 문서 | 통합된 문서 수 | 길이 |
|------|---------------|------|
| DATABASE_MODEL_GUIDE.md | 6개 | 800줄 |
| TEST_REPORT.md | - | 400줄 |
| USER_SCENARIO_TEST.md | - | 600줄 |
| TEST_CHECKLIST.md | - | 300줄 |
| UI_COMPONENTS.md | - | 400줄 |

---

## 🔍 빠른 참조

### 문제 해결

**"데이터 모델을 이해하고 싶어요"**
→ `docs/database/DATABASE_MODEL_GUIDE.md`

**"API는 어떻게 사용하나요?"**
→ `docs/api/API_GUIDE.md`

**"테스트는 어떻게 실행하나요?"**
→ `user_scenario/TEST_REPORT.md`

**"UI 컴포넌트 사용법은?"**
→ `user_scenario/UI_COMPONENTS.md`

**"환경 변수 설정은?"**
→ `docs/setup/ENV_SETUP_GUIDE.md`

**"테이블 UI는 어떻게 만드나요?"**
→ `docs/ui/TABLE_COMPLETE_GUIDE.md`

**"사용자 시나리오는?"**
→ `user_scenario/USER_SCENARIO_TEST.md`

---

## 📝 문서 업데이트 로그

### 2025-11-02
- ✅ doc 폴더 → user_scenario로 변경
- ✅ 루트 .md 파일 (39개) → docs/ 폴더로 이동
- ✅ 데이터베이스 문서 6개 → DATABASE_MODEL_GUIDE.md로 통합
- ✅ 문서 구조 재구성 (7개 카테고리)
- ✅ TEST_REPORT.md 생성 (자동화 테스트 결과)
- ✅ README.md 업데이트 (프로젝트 개요)
- ✅ docs/README.md 생성 (문서 센터)

---

## 🎯 문서 우선순위

### ⭐ 필수 (4개)
1. README.md (루트)
2. docs/database/DATABASE_MODEL_GUIDE.md
3. user_scenario/USER_SCENARIO_TEST.md
4. user_scenario/TEST_REPORT.md

### 🔸 중요 (8개)
- docs/api/API_GUIDE.md
- docs/testing/TESTING_GUIDE.md
- docs/ui/TABLE_COMPLETE_GUIDE.md
- user_scenario/TEST_CHECKLIST.md
- user_scenario/UI_COMPONENTS.md
- docs/setup/ENV_SETUP_GUIDE.md
- docs/auth/AUTH_FLOW_TEST.md
- docs/ui/ADMIN_UI_SUMMARY.md

### 🔹 참고 (34개)
- 나머지 모든 문서

---

## 🔄 문서 유지보수

### 시나리오 수정 시
```bash
# 사용자 요청
"시나리오 2에서 Attribute 5개로 변경"

# AI가 자동 업데이트
- user_scenario/USER_SCENARIO_TEST.md
- user_scenario/TEST_CHECKLIST.md

# 재테스트
npm test
npm run test:integration
```

### 데이터 모델 변경 시
```bash
# 1. Prisma Schema 수정
vi prisma/schema.prisma

# 2. 문서 업데이트
vi docs/database/DATABASE_MODEL_GUIDE.md

# 3. Prisma Client 재생성
npx prisma generate

# 4. 테스트 실행
npm test
```

---

## 📸 스크린샷 현황

### 대기 중 (42개)

**저장 위치**: `user_scenario/screenshots/`

**우선순위**:
- Policy 관리: 8개
- State 관리: 4개
- Type 관리: 6개
- 권한 관리: 4개
- BusinessObject: 8개
- UI/UX: 12개

**명명 규칙**:
```
{시나리오}-{단계}-{번호}_{설명}.png

예시:
1-1-1_policy-list.png
5-4-3_text-ellipsis.png
```

---

## 🎉 문서 재구성 완료

### Before (재구성 전)
```
루트/
├── *.md (39개 - 혼재)
└── doc/ (5개)
```

### After (재구성 후)
```
루트/
├── README.md (개선됨)
├── DOCUMENTATION_INDEX.md (NEW)
├── docs/ (40개 - 분류됨)
│   ├── database/ (7개)
│   ├── api/ (1개)
│   ├── testing/ (13개)
│   ├── auth/ (2개)
│   ├── ui/ (8개)
│   ├── setup/ (4개)
│   └── archive/ (4개)
└── user_scenario/ (5개)
```

---

## 📖 추천 읽기 순서

### 1주차: 기초
- Day 1: README.md
- Day 2: docs/database/DATABASE_MODEL_GUIDE.md
- Day 3: user_scenario/USER_SCENARIO_TEST.md
- Day 4: user_scenario/UI_COMPONENTS.md
- Day 5: user_scenario/TEST_REPORT.md

### 2주차: 심화
- Day 1-2: docs/api/API_GUIDE.md
- Day 3-4: docs/testing/TESTING_GUIDE.md
- Day 5: docs/ui/TABLE_COMPLETE_GUIDE.md

---

**문서 관리자**: Development Team  
**마지막 재구성**: 2025-11-02

