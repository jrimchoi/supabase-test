# 🔧 Supabase OAuth Redirect URL 설정 (필수!)

## 🐛 문제 상황

Vercel에 배포했는데 OAuth 인증 후 `localhost:3000`으로 리다이렉트됨

```
http://localhost:3000/?code=f4d26913-fb41-4ce3-b724-a0df260eddd4
```

## 🔍 원인

코드는 올바르지만, **Supabase 설정에서 허용된 Redirect URL이 localhost만 등록되어 있음**

## ✅ 해결 방법 (필수!)

### 1️⃣ Supabase Dashboard 접속

```
https://supabase.com/dashboard
```

### 2️⃣ 프로젝트 선택

왼쪽 프로젝트 목록에서 해당 프로젝트 클릭

### 3️⃣ Authentication → URL Configuration

왼쪽 메뉴:
- **Authentication** 클릭
- **URL Configuration** 클릭

### 4️⃣ Redirect URLs 설정

**"Redirect URLs" 섹션에서 추가:**

```
https://your-app.vercel.app/auth/callback
https://your-app.vercel.app/**
http://localhost:3000/auth/callback
http://localhost:3000/**
```

**⚠️ 주의:**
- `your-app.vercel.app`를 실제 Vercel 도메인으로 변경
- 각 URL을 별도로 추가 (여러 개 가능)
- 와일드카드 `**` 포함 (모든 하위 경로 허용)

### 5️⃣ Site URL 설정 (선택)

**"Site URL" 섹션:**

**로컬 개발:**
```
http://localhost:3000
```

**프로덕션:**
```
https://your-app.vercel.app
```

**팁:** Preview 배포도 테스트하려면 Preview URL도 추가하세요

### 6️⃣ Save 버튼 클릭

우측 하단 **Save** 버튼 클릭

---

## 📱 실제 Vercel URL 확인 방법

### Vercel Dashboard에서:
```
https://vercel.com/dashboard
→ 프로젝트 선택
→ Domains 탭
→ Production Domain 확인
```

### 예시:
```
supabase-test.vercel.app
또는
supabase-test-jrimchoi.vercel.app
```

---

## 🔐 OAuth Provider 설정 (추가)

### Google OAuth
Google Cloud Console에서 승인된 리디렉션 URI에 추가:
```
https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
https://your-app.vercel.app/auth/callback
```

### GitHub OAuth
GitHub OAuth App Settings에서 Authorization callback URL:
```
https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
```

---

## ✅ 설정 확인

설정 후 다음을 확인하세요:

### 1. Supabase Redirect URLs
- ✅ Vercel URL 포함
- ✅ 와일드카드 포함
- ✅ localhost도 유지 (로컬 개발용)

### 2. Vercel 환경 변수 (선택)
```
NEXT_PUBLIC_SITE_URL = https://your-app.vercel.app
```

### 3. 테스트
1. Vercel 앱 접속
2. 로그인 시도
3. Vercel URL로 리다이렉트 확인

---

## 🎯 최종 체크리스트

Vercel 배포 후:

- [ ] Supabase Redirect URLs에 Vercel 도메인 추가
- [ ] Vercel 도메인 확인 (예: `your-app.vercel.app`)
- [ ] Google/GitHub OAuth 설정 (필요 시)
- [ ] 로그인 테스트
- [ ] 콜백 URL이 Vercel 도메인으로 오는지 확인

---

## 🐛 여전히 localhost로 가는 경우

### 체크 1: Supabase 설정 저장 확인
- Redirect URLs 입력 후 **Save** 버튼 클릭했는지 확인

### 체크 2: 브라우저 캐시
- 시크릿/프라이빗 브라우징 모드에서 테스트
- 또는 브라우저 캐시 삭제

### 체크 3: Vercel 재배포
```bash
git commit --allow-empty -m "Redeploy"
git push
```

### 체크 4: Supabase Project URL 확인
```
프로젝트 Settings → API
→ Project URL 확인
```

---

## 💡 참고

Supabase는 보안을 위해 **등록된 URL로만 리다이렉트**를 허용합니다.
반드시 Supabase Dashboard에서 URL을 사전에 등록해야 합니다!

