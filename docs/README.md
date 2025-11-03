# Team Workflow 문서 센터

> **프로젝트**: Team Workflow - Policy 기반 권한 관리 시스템  
> **버전**: 2.0  
> **마지막 업데이트**: 2025-11-02

---

## 📂 문서 구조

```
docs/
├── README.md                    # 이 파일 (문서 센터 메인)
├── database/                    # 데이터베이스 및 모델
│   ├── DATABASE_MODEL_GUIDE.md  # 통합 데이터베이스 가이드 ⭐
│   ├── BUSINESS_ATTRIBUTE_GUIDE.md
│   ├── BUSINESS_MODEL_GUIDE.md
│   ├── BUSINESS_OBJECT_REVISION.md
│   ├── SCHEMA_V2_GUIDE.md
│   ├── SCHEMA_V2_CHANGES.md
│   └── RLS_PUBLIC_READ_SETUP.md
├── api/                         # API 가이드
│   └── API_GUIDE.md
├── testing/                     # 테스트 가이드
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
│   ├── CREATE_ENV_TEST.md
│   └── DEBUG_USER_LIST.md
├── auth/                        # 인증 가이드
│   ├── AUTH_FLOW_TEST.md
│   └── DEBUG_AUTH.md
├── ui/                          # UI/UX 가이드
│   ├── ADMIN_UI_SUMMARY.md
│   ├── TABLE_COMPLETE_GUIDE.md
│   ├── HORIZONTAL_SCROLL_FIX.md
│   ├── SCROLLBAR_FIX.md
│   ├── STICKY_HEADER_FIX.md
│   ├── PAGINATION_GUIDE.md
│   ├── PAGINATION_V2_GUIDE.md
│   └── RESPONSIVE_NAVBAR.md
├── setup/                       # 환경 설정
│   ├── ENV_SETUP_GUIDE.md
│   ├── FIX_ENV_LOCAL.md
│   ├── FIX_POOLER_ERROR.md
│   └── NEXTJS_CACHING_GUIDE.md
└── archive/                     # 아카이브 (참고용)
    ├── CONCURRENCY_EXPLAINED.md
    ├── MANUAL_VERSION_GUIDE.md
    ├── QUICK_FIX.md
    └── SUMMARY.md

user_scenario/                   # 사용자 시나리오 및 테스트
├── README.md
├── USER_SCENARIO_TEST.md        # 7개 시나리오
├── TEST_CHECKLIST.md            # 113개 체크리스트
├── TEST_REPORT.md               # 자동화 테스트 결과 ⭐
├── UI_COMPONENTS.md             # UI 컴포넌트 가이드
└── screenshots/                 # 42개 스크린샷
```

---

## 🎯 문서 분류

### ⭐ 필수 문서 (시작하기)

1. **README.md** (루트)
   - 프로젝트 개요
   - 빠른 시작 가이드

2. **docs/database/DATABASE_MODEL_GUIDE.md** ⭐
   - **통합 데이터베이스 가이드**
   - 모든 데이터 모델 설명
   - ERD, 스키마, 사용 예시

3. **user_scenario/USER_SCENARIO_TEST.md**
   - 실제 사용 시나리오
   - 단계별 테스트 가이드

4. **user_scenario/TEST_REPORT.md** ⭐
   - 자동화 테스트 결과
   - 100% 통과 확인

---

## 📚 문서 카테고리

### 1. Database (데이터베이스)

**통합 가이드**: `DATABASE_MODEL_GUIDE.md` ⭐

**주요 내용**:
- Policy & State 관리
- Type 시스템 (계층 구조)
- Attribute 시스템
- BusinessObject (EAV 패턴)
- 리비전 자동 할당
- 권한 관리
- 삭제 제약

**개별 문서** (상세 참고용):
- BUSINESS_ATTRIBUTE_GUIDE.md
- BUSINESS_MODEL_GUIDE.md
- BUSINESS_OBJECT_REVISION.md
- SCHEMA_V2_GUIDE.md
- SCHEMA_V2_CHANGES.md
- RLS_PUBLIC_READ_SETUP.md

---

### 2. API (API 가이드)

**문서**: `API_GUIDE.md`

**주요 엔드포인트**:
- `/api/policies` - Policy CRUD
- `/api/states` - State CRUD
- `/api/types` - Type CRUD
- `/api/attributes` - Attribute CRUD
- `/api/business-objects` - BusinessObject CRUD
- `/api/roles` - Role CRUD
- `/api/groups` - Group CRUD
- `/api/permissions` - Permission CRUD

---

### 3. Testing (테스트)

**주요 문서**:
- **TESTING_GUIDE.md** - 전체 테스트 가이드
- **INTEGRATION_TEST_GUIDE.md** - 통합 테스트
- **QUICK_TEST_GUIDE.md** - 빠른 테스트

**테스트 환경**:
- TEST_ENV_SETUP.md
- INSTALL_TESTS.md
- RUN_TESTS.md

**성능 및 트러블슈팅**:
- INTEGRATION_TEST_PERFORMANCE.md
- INTEGRATION_TEST_TROUBLESHOOTING.md

---

### 4. Auth (인증)

**문서**:
- **AUTH_FLOW_TEST.md** - 인증 플로우 테스트
- **DEBUG_AUTH.md** - 인증 디버깅

**인증 방식**:
- Google OAuth
- GitHub OAuth
- Email OTP
- Email/Password

---

### 5. UI (UI/UX)

**주요 문서**:
- **TABLE_COMPLETE_GUIDE.md** - 테이블 UI 완전 가이드
- **ADMIN_UI_SUMMARY.md** - Admin UI 요약

**UI 수정 가이드**:
- HORIZONTAL_SCROLL_FIX.md
- SCROLLBAR_FIX.md
- STICKY_HEADER_FIX.md
- PAGINATION_GUIDE.md
- PAGINATION_V2_GUIDE.md
- RESPONSIVE_NAVBAR.md

---

### 6. Setup (환경 설정)

**문서**:
- **ENV_SETUP_GUIDE.md** - 환경 변수 설정
- **FIX_POOLER_ERROR.md** - Pooler 에러 해결
- **FIX_ENV_LOCAL.md** - .env.local 수정
- **NEXTJS_CACHING_GUIDE.md** - Next.js 캐싱

---

### 7. Archive (아카이브)

**오래된/참고용 문서**:
- CONCURRENCY_EXPLAINED.md
- MANUAL_VERSION_GUIDE.md
- QUICK_FIX.md
- SUMMARY.md

---

## 🚀 빠른 시작

### 1. 환경 설정
```bash
# 1. 환경 변수 설정
# docs/setup/ENV_SETUP_GUIDE.md 참조

# 2. 데이터베이스 초기화
psql $DATABASE_URL -f prisma/init-v2.sql

# 3. Prisma Client 생성
npx prisma generate

# 4. 개발 서버 시작
npm run dev
```

### 2. 데이터 모델 이해
```bash
# 통합 가이드 읽기
cat docs/database/DATABASE_MODEL_GUIDE.md

# ERD 확인
# Policy → State → Permission
# Type → Attribute → BusinessObject
# 리비전 자동 할당 시스템
```

### 3. 테스트 실행
```bash
# 단위 테스트
npm test

# 통합 테스트
npm run test:integration

# 결과 확인
cat user_scenario/TEST_REPORT.md
```

### 4. UI 테스트
```bash
# 사용자 시나리오
cat user_scenario/USER_SCENARIO_TEST.md

# 체크리스트
cat user_scenario/TEST_CHECKLIST.md

# 브라우저 테스트
open http://localhost:3000
```

---

## 📖 문서 읽는 순서

### 처음 시작하는 경우

1. **README.md** (루트)
   - 프로젝트 개요

2. **docs/database/DATABASE_MODEL_GUIDE.md** ⭐
   - 데이터 모델 전체 구조
   - Policy, State, Type, BusinessObject

3. **user_scenario/USER_SCENARIO_TEST.md**
   - 실제 사용 시나리오
   - 송장 관리 시스템 구축

4. **user_scenario/UI_COMPONENTS.md**
   - UI 컴포넌트 사용법

### 개발자용

1. **docs/database/DATABASE_MODEL_GUIDE.md**
   - 스키마 구조
   - Prisma 사용법

2. **docs/api/API_GUIDE.md**
   - API 엔드포인트

3. **docs/testing/TESTING_GUIDE.md**
   - 테스트 작성법

4. **docs/ui/TABLE_COMPLETE_GUIDE.md**
   - ScrollableTable 구현

### 테스터용

1. **user_scenario/TEST_REPORT.md** ⭐
   - 자동화 테스트 결과

2. **user_scenario/USER_SCENARIO_TEST.md**
   - 7개 시나리오

3. **user_scenario/TEST_CHECKLIST.md**
   - 113개 체크리스트

---

## 🔍 문서 검색

### 카테고리별 찾기

**데이터베이스 관련?**
→ `docs/database/DATABASE_MODEL_GUIDE.md`

**API 엔드포인트?**
→ `docs/api/API_GUIDE.md`

**테스트 실행?**
→ `docs/testing/TESTING_GUIDE.md`

**UI 수정?**
→ `docs/ui/TABLE_COMPLETE_GUIDE.md`

**환경 설정?**
→ `docs/setup/ENV_SETUP_GUIDE.md`

**사용자 시나리오?**
→ `user_scenario/USER_SCENARIO_TEST.md`

---

## 🎯 주요 문서 목록

### 통합 가이드 ⭐

| 문서 | 내용 | 위치 |
|------|------|------|
| **DATABASE_MODEL_GUIDE.md** | 데이터베이스 통합 가이드 | docs/database/ |
| **USER_SCENARIO_TEST.md** | 사용자 시나리오 | user_scenario/ |
| **TEST_REPORT.md** | 테스트 결과 리포트 | user_scenario/ |
| **UI_COMPONENTS.md** | UI 컴포넌트 가이드 | user_scenario/ |

### 참고 문서

| 카테고리 | 문서 수 | 폴더 |
|---------|--------|------|
| Database | 7 | docs/database/ |
| API | 1 | docs/api/ |
| Testing | 13 | docs/testing/ |
| Auth | 2 | docs/auth/ |
| UI | 8 | docs/ui/ |
| Setup | 4 | docs/setup/ |
| Archive | 4 | docs/archive/ |
| **합계** | **39** | - |

---

## 📝 문서 업데이트 프로세스

### 시나리오 수정 요청
```
사용자: "시나리오 2에서 Attribute 5개로 변경"
  ↓
AI: user_scenario/USER_SCENARIO_TEST.md 업데이트
  ↓
AI: user_scenario/TEST_CHECKLIST.md 업데이트
  ↓
사용자: 재테스트 진행
```

### 데이터 모델 변경
```
Prisma Schema 수정
  ↓
docs/database/DATABASE_MODEL_GUIDE.md 업데이트
  ↓
npx prisma generate
  ↓
테스트 실행
```

---

## 🎓 학습 경로

### 초보자
```
1. README.md (루트)
2. docs/database/DATABASE_MODEL_GUIDE.md
3. user_scenario/USER_SCENARIO_TEST.md
4. user_scenario/UI_COMPONENTS.md
```

### 개발자
```
1. docs/database/DATABASE_MODEL_GUIDE.md
2. docs/api/API_GUIDE.md
3. docs/testing/TESTING_GUIDE.md
4. docs/ui/TABLE_COMPLETE_GUIDE.md
```

### QA/테스터
```
1. user_scenario/TEST_REPORT.md
2. user_scenario/USER_SCENARIO_TEST.md
3. user_scenario/TEST_CHECKLIST.md
```

---

**문서 관리자**: Development Team  
**마지막 검토**: 2025-11-02

