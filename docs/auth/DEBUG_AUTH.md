# 인증 문제 디버깅

## ❌ 현재 문제

**세션 없이 `/admin` 페이지가 접근 가능**

- URL: `http://localhost:3000/admin`
- localStorage: 비어있음
- 세션 쿠키: 없음
- 페이지: 정상 로드됨 (Dashboard 표시)

---

## 🔍 원인 분석

### 1. Middleware 작동 확인

터미널 로그에서 다음을 확인:

```
middleware {
  path: '/admin',
  user: null,
  hasSession: false,
  ...
}
```

**만약 로그가 없다면** → Middleware가 실행되지 않음!

---

### 2. 가능한 원인

#### A. Middleware Matcher 문제
```typescript
// middleware.ts의 config.matcher가 /admin을 포함하는지 확인
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg).*)",
  ],
};
```

#### B. Next.js 캐시
- Turbopack Fast Refresh가 middleware 업데이트를 감지하지 못함
- 서버 재시작 필요

#### C. 브라우저 측 문제
- Service Worker가 캐시된 응답 반환
- 브라우저 완전 재시작 필요

---

## ✅ 해결 방법

### 1. 터미널에서 로그 확인

`npm run dev` 실행 중인 터미널에서:

```
# /admin 접속 시 middleware 로그가 보여야 함
middleware {
  path: '/admin',
  user: null,
  hasSession: false
}
```

**로그가 안 보이면** → middleware가 실행되지 않음!

---

### 2. 완전히 서버 재시작

```bash
# 모든 Node 프로세스 종료
pkill -9 node

# dev 서버 재시작
npm run dev
```

---

### 3. 브라우저 완전 정리

```bash
# Chrome/Arc 완전 종료 후 재시작
# 또는 시크릿 모드로 테스트
```

---

### 4. Middleware 강제 새로고침

`middleware.ts` 파일에 임시 로그 추가:

```typescript
export async function middleware(req: NextRequest) {
  console.log('🔒 MIDDLEWARE:', req.nextUrl.pathname)
  
  const res = NextResponse.next();
  // ...
}
```

저장 후 `/admin` 접속 → 터미널에 로그가 보여야 함

---

## 🧪 수동 테스트

### curl로 확인

```bash
# 세션 없이 /admin 접속
curl -I http://localhost:3000/admin

# 예상 결과:
HTTP/1.1 307 Temporary Redirect
Location: http://localhost:3000/signin?redirectTo=/admin

# 실제 결과가 200이면 → Middleware 작동 안 함!
```

---

## 🎯 임시 해결

Middleware 대신 Page 레벨에서 체크:

`/admin/page.tsx`에 추가:

```typescript
import { redirect } from 'next/navigation'
import { getServerSupabase } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = await getServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/signin?redirectTo=/admin')
  }
  
  // ... 기존 코드
}
```

---

**먼저 터미널 로그를 확인하고 middleware 로그가 보이는지 확인해주세요!** 🔍

