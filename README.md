## Supabase Auth 예제 (Next.js + Tailwind CSS + shadcn/ui)

Google, GitHub, 이메일 OTP로 로그인하는 예제입니다. Supabase Auth, DB를 Next.js(App Router)와 함께 사용합니다.

### 1) 환경 변수 설정
루트에 `.env.local` 파일을 생성하고 다음 값을 채워주세요:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://YOUR-PROJECT-REF.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR-ANON-KEY"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

- `NEXT_PUBLIC_SITE_URL`은 로컬 개발 시 `http://localhost:3000`을 사용하세요.
- 배포 시에는 실제 도메인으로 교체하세요.

### 2) Supabase OAuth 리다이렉트 설정
Supabase 프로젝트 콘솔 > Authentication > URL Configuration 에서 다음 리다이렉트를 추가합니다.

- `http://localhost:3000/auth/callback`
- 배포 도메인 사용 시: `https://YOUR-DOMAIN/auth/callback`

Authentication > Providers에서 Google, GitHub를 활성화하고 클라이언트 ID/시크릿을 입력하세요.

### 3) 설치 및 실행
```bash
npm install
npm run dev
```

### 4) 경로
- 로그인 페이지: `/signin`
- 콜백 라우트: `/auth/callback`
- 보호 페이지(세션 필요): `/dashboard`
 - 이메일 인증 안내: `/auth/verify` (재인증 메일 재전송 가능)
 - 비밀번호 재설정 요청: `/forgot-password`
 - 비밀번호 변경: `/auth/update-password`
 - RLS 예제 노트: `/notes`

### 구성 파일
- `middleware.ts`: Supabase 세션 쿠키 동기화
- `src/lib/supabase/server.ts`: 서버에서 Supabase 클라이언트 생성
- `src/lib/supabase/client.ts`: 브라우저에서 Supabase 클라이언트 생성
- `src/app/(auth)/signin/page.tsx`: 구글/깃허브/이메일 로그인 UI
- `src/app/auth/callback/page.tsx`: 클라이언트에서 세션 교환 후 `/dashboard`로 이동, access_token을 `/api/session`으로 전달해 HttpOnly JWT 쿠키(`app_jwt`) 저장
- `src/app/api/session/route.ts`: POST된 토큰을 `app_jwt`로 세팅
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
