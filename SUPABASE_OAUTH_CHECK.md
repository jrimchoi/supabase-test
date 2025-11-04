# Supabase OAuth 설정 확인

## 1. Supabase Dashboard 접속
https://supabase.com/dashboard/project/ckujlkdumhhtjkinngjf

## 2. Authentication → URL Configuration 확인

### Site URL
```
http://localhost:3000
```

### Redirect URLs (Allow list에 추가되어 있어야 함)
```
http://localhost:3000/auth/callback
http://localhost:3000/auth/callback?*
```

## 3. OAuth Providers 설정

### Google OAuth
- **Enabled**: ✅ 체크
- **Client ID**: 설정되어 있어야 함
- **Client Secret**: 설정되어 있어야 함

## 4. PKCE Flow 지원 확인

Supabase는 기본적으로 PKCE를 지원하지만, 다음을 확인하세요:

### Authentication → Settings → Auth Flow
- **Enable PKCE flow for OAuth**: ✅ 체크 (있다면)

## 5. 로컬 환경 확인

`.env.local` 파일에 다음이 있는지 확인:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://ckujlkdumhhtjkinngjf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 문제 해결

만약 위 설정이 모두 맞는데도 안 된다면:

### A. Supabase 콘솔에서 직접 테스트
1. Authentication → Users → Invite User
2. 이메일/비밀번호로 먼저 로그인 테스트
3. 정상 작동하면 OAuth 설정 문제

### B. @supabase/ssr 버전 확인
```bash
npm list @supabase/ssr
npm list @supabase/supabase-js
```

최신 버전인지 확인하고, 필요시 업데이트:
```bash
npm update @supabase/ssr @supabase/supabase-js
```

### C. Supabase 로그 확인
Dashboard → Logs → Auth Logs에서 실시간 로그 확인

