# Vercel 배포 시 인증 리다이렉트 문제 해결 ✅

## 🐛 문제

Vercel에 배포했는데 OAuth 인증 후 `localhost:3000`으로 리다이렉트되는 문제

## 🔍 원인

### 이전 코드:
```typescript
const origin = process.env.NEXT_PUBLIC_SITE_URL;  // "http://localhost:3000"
const callbackUrl = `${origin}/auth/callback`;
```

- `.env.local`에 `NEXT_PUBLIC_SITE_URL=http://localhost:3000` 설정
- Vercel에서도 이 값을 사용하여 localhost로 리다이렉트

## ✅ 해결 방법

### 적용된 수정:
```typescript
// ✅ 항상 현재 브라우저의 URL 사용 (클라이언트 컴포넌트)
const origin = window.location.origin;
const callbackUrl = `${origin}/auth/callback`;
```

**장점:**
- 로컬: `http://localhost:3000/auth/callback`
- Vercel: `https://your-app.vercel.app/auth/callback`
- 환경 변수 설정 불필요
- 자동으로 올바른 URL 사용

## 📝 수정된 파일

1. ✅ `src/app/(auth)/signin/page.tsx`
   - OAuth 로그인 (Google, GitHub)
   - 이메일 OTP
   - 이메일/비밀번호 회원가입

2. ✅ `src/app/forgot-password/page.tsx`
   - 비밀번호 재설정

3. ✅ `src/app/auth/callback/page.tsx`
   - 로깅 개선

## 🎯 인증 플로우

### OAuth (Google/GitHub)
1. 사용자가 로그인 버튼 클릭
2. `window.location.origin`으로 현재 URL 확인
3. Callback URL 생성: `{현재 도메인}/auth/callback`
4. Provider 인증 → Callback으로 리다이렉트
5. 세션 교환 → `/admin` 이동

### 이메일 OTP
1. 이메일 입력
2. `window.location.origin` 사용
3. 이메일로 매직 링크 전송
4. 링크 클릭 → `/auth/callback`
5. 세션 교환 → `/admin` 이동

### 이메일/비밀번호 회원가입
1. 이메일/비밀번호 입력
2. `window.location.origin` 사용
3. 이메일 인증 링크 전송
4. 링크 클릭 → `/auth/callback`
5. 세션 교환 → `/admin` 이동

## 🚀 최종 리다이렉트 경로

**성공 시:**
```
OAuth/Email 인증 완료
→ /auth/callback
→ /admin (기본값)
```

**Query Parameter로 변경 가능:**
```
/signin?redirectTo=/dashboard
→ 인증 후 /dashboard로 이동
```

**비밀번호 재설정:**
```
인증 완료
→ /auth/callback?type=recovery
→ /auth/update-password
```

## ⚠️ 중요: Supabase 설정

Vercel 배포 후 Supabase에서 허용 URL 추가:

### 1. Supabase Dashboard
```
https://supabase.com/dashboard
```

### 2. Authentication → URL Configuration

**Redirect URLs에 추가:**
```
https://your-app.vercel.app/auth/callback
https://your-app.vercel.app/**
```

**Site URL:**
```
https://your-app.vercel.app
```

## ✨ 이제 Vercel에서 정상 작동!

- ✅ 로컬: `localhost:3000`
- ✅ Vercel: `your-app.vercel.app`
- ✅ 자동 감지
- ✅ 환경 변수 불필요

## 📚 참고

`.env.local`의 `NEXT_PUBLIC_SITE_URL`은 이제 사용하지 않지만, 
다른 서버 컴포넌트나 미들웨어에서 필요할 수 있으므로 삭제하지 않았습니다.

