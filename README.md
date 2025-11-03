# Team Workflow - Policy 기반 권한 관리 시스템

> **버전**: 2.0  
> **프레임워크**: Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui  
> **데이터베이스**: Supabase PostgreSQL + Prisma  
> **인증**: Supabase Auth (Google, GitHub, Email OTP, Email/Password)

## 📋 프로젝트 개요

**Team Workflow**는 Policy 기반의 유연한 권한 관리 시스템입니다.

### 핵심 기능

1. **Policy 기반 워크플로우**
   - Policy: 비즈니스 정책 정의
   - State: 상태 관리 (Draft → Review → Approved)
   - StateTransition: 상태 전이 관계
   - Permission: State별 권한 (Role/Group/User)

2. **Type 시스템 (계층 구조)**
   - Type: 비즈니스 타입 정의
   - Attribute: 공통 속성 정의
   - 속성 상속 (prefix, name)

3. **EAV 패턴 (JSON 방식)**
   - Type/Attribute로 스키마 정의
   - BusinessObject.data에 JSONB로 저장
   - 유연한 속성 관리

4. **리비전 자동 할당**
   - Policy의 revisionSequence 기반 (A,B,C,D,E)
   - 동일 Name의 여러 Revision
   - Prisma Middleware 자동 할당

5. **고급 UI**
   - ScrollableTable (헤더 고정, 컬럼 리사이즈, 텍스트 ellipsis)
   - Drawer (오른쪽 슬라이드 패널)
   - 다크모드 (next-themes)
   - 반응형 디자인

---

## 📂 문서 구조

```
루트/
├── README.md                     # 이 파일 (프로젝트 개요)
├── docs/                         # 기술 문서
│   ├── README.md                 # 문서 센터 메인
│   ├── database/                 # 데이터베이스 (7개 문서)
│   │   └── DATABASE_MODEL_GUIDE.md ⭐ 통합 가이드
│   ├── api/                      # API 가이드
│   ├── testing/                  # 테스트 가이드 (13개)
│   ├── auth/                     # 인증 가이드 (2개)
│   ├── ui/                       # UI/UX 가이드 (8개)
│   ├── setup/                    # 환경 설정 (4개)
│   └── archive/                  # 아카이브 (4개)
└── user_scenario/                # 사용자 시나리오 및 테스트
    ├── README.md
    ├── USER_SCENARIO_TEST.md     # 7개 시나리오, 42개 스크린샷
    ├── TEST_CHECKLIST.md         # 113개 체크리스트
    ├── TEST_REPORT.md            # 테스트 결과 (100% 통과) ⭐
    ├── UI_COMPONENTS.md          # UI 컴포넌트 가이드
    └── screenshots/              # 테스트 스크린샷
```

---

## 🚀 빠른 시작

### 1. 환경 변수 설정
```bash
# .env.local 파일 생성
NEXT_PUBLIC_SUPABASE_URL="https://YOUR-PROJECT-REF.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR-ANON-KEY"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"
```

**상세 가이드**: `docs/setup/ENV_SETUP_GUIDE.md`

### 2. 데이터베이스 초기화
```bash
# Supabase SQL Editor 또는 psql 사용
psql $DATABASE_URL -f prisma/init-v2.sql

# Prisma Client 생성
npx prisma generate
```

**상세 가이드**: `docs/database/DATABASE_MODEL_GUIDE.md`

### 3. 설치 및 실행
```bash
# 패키지 설치
npm install

# 개발 서버 시작
npm run dev

# 브라우저 접속
open http://localhost:3000
```

### 4. 주요 경로

#### 인증
- `/signin` - 로그인 페이지
- `/auth/callback` - OAuth 콜백
- `/dashboard` - 보호된 페이지

#### Admin (Policy 시스템)
- `/admin` - Dashboard
- `/admin/policies` - Policy 관리
- `/admin/states` - State 관리
- `/admin/types` - Type 관리
- `/admin/attributes` - Attribute 관리
- `/admin/business-objects` - BusinessObject 관리
- `/admin/roles` - Role 관리
- `/admin/groups` - Group 관리
- `/admin/permissions` - Permission 관리
- `/admin/design-template` - UI 컴포넌트 가이드

---

## 📚 문서 가이드

### 시작하기

1. **README.md** (이 파일)
   - 프로젝트 개요 및 빠른 시작

2. **docs/database/DATABASE_MODEL_GUIDE.md** ⭐
   - 통합 데이터베이스 가이드
   - Policy, State, Type, BusinessObject
   - EAV 패턴, 리비전 시스템

3. **user_scenario/USER_SCENARIO_TEST.md**
   - 실제 사용 시나리오 (송장 관리)
   - 7개 시나리오, 20개 단계

### 개발자용

- **docs/api/API_GUIDE.md** - API 엔드포인트
- **docs/testing/TESTING_GUIDE.md** - 테스트 작성법
- **docs/ui/TABLE_COMPLETE_GUIDE.md** - ScrollableTable 구현
- **user_scenario/UI_COMPONENTS.md** - shadcn/ui 컴포넌트

### 테스터용

- **user_scenario/TEST_REPORT.md** ⭐ - 자동화 테스트 결과 (100%)
- **user_scenario/TEST_CHECKLIST.md** - 113개 체크리스트
- **user_scenario/USER_SCENARIO_TEST.md** - 시나리오 가이드

---

## 🧪 테스트

### 자동화 테스트 (1분)
```bash
# 단위 테스트 (51개)
npm test

# 통합 테스트 (7개)
npm run test:integration

# 결과 확인
cat user_scenario/TEST_REPORT.md
```

**현재 통과율**: **100%** (58/58 테스트) ✅

### UI 수동 테스트 (40분)
```bash
# 시나리오 가이드
cat user_scenario/USER_SCENARIO_TEST.md

# 체크리스트
cat user_scenario/TEST_CHECKLIST.md

# 스크린샷 가이드 (42개)
ls user_scenario/screenshots/
```

---

## 🎨 주요 특징

### 1. Policy-Type Many-to-Many
- Policy에서 여러 Type 검색 및 선택
- 디바운스 검색 (2글자 이상, 300ms)
- Badge로 선택된 Type 표시

### 2. 리비전 자동 할당
```typescript
// 동일 Name으로 여러 객체 생성
송장-001 → revision: A
송장-001 → revision: B  (자동 순환)
송장-001 → revision: C
송장-001 → revision: D
송장-001 → revision: E
송장-001 → revision: A  (순환!)
```

### 3. EAV 패턴 (JSON 방식)
```typescript
// Type/Attribute 정의 (스키마)
Type: invoice
  - invoiceNumber (STRING, 필수)
  - amount (INTEGER, 필수)
  - customerName (STRING, 필수)

// BusinessObject 생성 (data 필드에 JSON)
{
  typeId: 'invoice',
  data: {
    invoiceNumber: 'INV-2025-001',
    amount: 5000000,
    customerName: 'ABC 주식회사',
  },
}
```

### 4. ScrollableTable
- ✅ 헤더 고정, 데이터 스크롤
- ✅ 컬럼 드래그 리사이즈
- ✅ 텍스트 ellipsis + hover 툴팁
- ✅ 중첩 div ellipsis 지원

### 5. Drawer UI
- ✅ Dialog → Drawer 전환 (6개)
- ✅ 오른쪽 슬라이드 (500-700px)
- ✅ 헤더/푸터 고정, 내용 스크롤

### 6. 다크모드
- ✅ next-themes 통합
- ✅ 우측 상단 토글 (Moon/Sun)
- ✅ Tailwind CSS 변수 기반

---

## 📖 Supabase Auth 기능

### 구성 파일
- `middleware.ts`: Supabase 세션 쿠키 동기화
- `src/lib/supabase/server.ts`: 서버에서 Supabase 클라이언트 생성
- `src/lib/supabase/client.ts`: 브라우저에서 Supabase 클라이언트 생성
- `src/app/(auth)/signin/page.tsx`: 구글/깃허브/이메일 로그인 UI
- `src/app/auth/callback/page.tsx`: 클라이언트에서 세션 교환 후 `/dashboard`로 이동, access_token을 `/api/session`으로 전달해 HttpOnly JWT 쿠키(`app_jwt`) 저장, `/api/profile/ensure`로 프로필 확인/생성
- `src/app/api/session/route.ts`: POST된 토큰을 `app_jwt`로 세팅
- `src/app/api/profile/ensure/route.ts`: 프로필 존재 여부 확인, 없으면 생성 (signup/signin 구분)
- `supabase/profiles.sql`: profiles 테이블 및 트리거 SQL
- `src/app/dashboard/page.tsx`: 보호된 페이지(서버 액션으로 로그아웃)
 - `src/app/auth/verify/page.tsx`: 이메일 인증 안내 및 재전송
 - `src/app/forgot-password/page.tsx`: 재설정 메일 요청
 - `src/app/auth/update-password/page.tsx`: 새 비밀번호 설정
 - `src/app/notes/page.tsx`: RLS 예제 노트 목록/추가 (서버 액션)
 - `supabase/notes.sql`: 테이블/정책 SQL

### 동작 방식 요약
- OAuth/이메일 링크 인증 후 `/auth/callback`에서 `exchangeCodeForSession()`으로 세션을 쿠키에 저장합니다.
- `middleware.ts`가 요청마다 세션 쿠키를 최신 상태로 유지합니다.
- 보호 페이지는 서버에서 `getUser()`로 사용자 여부를 확인해 미인증 시 `/signin`으로 리디렉트합니다.
- 콜백 쿼리 `type=recovery` 수신 시 비밀번호 변경 페이지로 라우팅합니다.

### 프로필 테이블 설정 (자동 signup/signin)
1) Supabase SQL 에디터에서 `supabase/profiles.sql` 내용을 실행합니다:
   - `profiles` 테이블 생성 (email, full_name, name, avatar_url, provider, bio, website, gender, phone_number 등)
   - 기존 테이블에 새 컬럼 자동 추가 (마이그레이션)
   - RLS 정책 설정
   - `auth.users` INSERT 시 자동으로 `profiles`에도 INSERT하는 트리거 생성

2) **기존 데이터 마이그레이션** (필수 - auth.users에 데이터가 있는 경우):
   - `auth.users`에 사용자가 있지만 `profiles`에 없으면 `supabase/migrate-existing-profiles.sql`을 실행하여 모든 사용자에 대한 프로필 레코드를 생성합니다.
   - 이 스크립트는 `auth.users`에 있지만 `profiles`에 없는 모든 사용자에 대해 프로필을 자동 생성합니다.

3) Google/GitHub/Email 로그인 시:
   - 첫 로그인(signup): `auth.users`에 자동 생성 → 트리거로 `profiles`에도 자동 생성
   - 이후 로그인(signin): 기존 프로필 확인 → 대시보드로 이동
   - 콜백 페이지에서 `/api/profile/ensure` 호출로 프로필 존재 여부 확인/생성

### RLS 예제 설정
1) Supabase SQL 에디터에서 다음 스크립트를 실행합니다:

```sql
-- 파일: supabase/notes.sql 내용 참고
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);
alter table public.notes enable row level security;
create policy if not exists "Notes read own" on public.notes for select using ( auth.uid() = user_id );
create policy if not exists "Notes insert own" on public.notes for insert with check ( auth.uid() = user_id );
create policy if not exists "Notes update own" on public.notes for update using ( auth.uid() = user_id );
create policy if not exists "Notes delete own" on public.notes for delete using ( auth.uid() = user_id );
```

2) 로그인 후 `/notes`에서 본인 노트를 추가/조회할 수 있습니다. RLS로 인해 다른 사용자의 데이터는 접근할 수 없습니다.

### 사용자 확인 방법

1) **Supabase Dashboard**:
   - Authentication > Users: `auth.users` 테이블의 모든 사용자 확인
   - Table Editor > `public.profiles`: 프로필 정보 확인

2) **SQL Editor**:
   ```sql
   -- 모든 사용자 조회
   SELECT id, email, created_at, raw_user_meta_data FROM auth.users;
   
   -- 프로필 조회
   SELECT * FROM public.profiles ORDER BY created_at DESC;
   ```

3) **코드에서**:
   - `/admin/users`: 관리자용 사용자 목록 페이지 (RLS 정책 조정 필요)
   - 서버 컴포넌트: `await getServerSupabase().auth.getUser()` 로 현재 사용자 확인

---

## 🔗 문서 링크

### ⭐ 필수 문서
- [데이터베이스 통합 가이드](docs/database/DATABASE_MODEL_GUIDE.md)
- [사용자 시나리오 테스트](user_scenario/USER_SCENARIO_TEST.md)
- [테스트 결과 리포트](user_scenario/TEST_REPORT.md)
- [UI 컴포넌트 가이드](user_scenario/UI_COMPONENTS.md)

### 📚 카테고리별
- [Database](docs/database/) - 데이터베이스 및 모델 (7개)
- [API](docs/api/) - API 가이드
- [Testing](docs/testing/) - 테스트 가이드 (13개)
- [Auth](docs/auth/) - 인증 가이드
- [UI](docs/ui/) - UI/UX 가이드 (8개)
- [Setup](docs/setup/) - 환경 설정 (4개)

---

## 📊 프로젝트 통계

### 코드
- **TypeScript**: ~15,000 줄
- **컴포넌트**: 40개 (UI 14개, Admin 26개)
- **API Routes**: 8개
- **Prisma Models**: 14개

### 테스트
- **단위 테스트**: 51개 (100% 통과) ✅
- **통합 테스트**: 7개 (100% 통과) ✅
- **총 테스트**: 58개

### 문서
- **기술 문서**: 39개
- **사용자 시나리오**: 7개
- **테스트 항목**: 113개
- **스크린샷 가이드**: 42개

---

## 🤝 기여 가이드

### 시나리오 수정 요청
```
user_scenario/USER_SCENARIO_TEST.md 수정 요청
  ↓
AI가 문서 자동 업데이트
  ↓
재테스트 진행
```

### 이슈 발견 시
```
1. user_scenario/TEST_CHECKLIST.md에서 실패 항목 체크
2. 스크린샷 캡처
3. user_scenario/USER_SCENARIO_TEST.md에 이슈 추가
```

---

## 📞 문의

- **문서**: `docs/README.md`
- **테스트**: `user_scenario/TEST_REPORT.md`
- **데이터베이스**: `docs/database/DATABASE_MODEL_GUIDE.md`

---

**Team Workflow v2.0**  
Built with ❤️ using Next.js, Supabase, Prisma, shadcn/ui
