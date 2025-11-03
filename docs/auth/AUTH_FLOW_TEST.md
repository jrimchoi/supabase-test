# 인증 플로우 테스트 가이드

## 🎯 변경 사항

### ✅ 기본 보안 정책
- **모든 페이지는 기본적으로 로그인 필요**
- **공개 페이지만 예외로 허용**

### ✅ 공개 페이지 리스트
```typescript
// middleware.ts
const publicPaths = [
  "/signin",              // 로그인 페이지
  "/auth/callback",       // OAuth 콜백
  "/auth/verify",         // 이메일 인증 안내
  "/forgot-password",     // 비밀번호 재설정
  "/api/auth/signout",    // 로그아웃 API
  "/api/session",         // 세션 저장 API
  "/api/supabase-session",// Supabase 세션 API
  "/api/profile/ensure",  // 프로필 생성 API
];
```

---

## 🧪 테스트 시나리오

### 1️⃣ 로그인하지 않은 상태

#### A. 루트 접속
```
http://localhost:3000
  → page.tsx에서 세션 체크
  → /signin으로 리다이렉트 ✅
```

#### B. 보호된 페이지 직접 접속
```
http://localhost:3000/admin/policies
  → middleware가 세션 없음 감지
  → /signin?redirectTo=/admin/policies로 리다이렉트 ✅
```

#### C. API 직접 호출
```
curl http://localhost:3000/api/policies
  → middleware가 세션 없음 감지
  → /signin으로 리다이렉트 ✅
```

#### D. 공개 페이지 접속
```
http://localhost:3000/signin
  → 접속 가능 ✅

http://localhost:3000/forgot-password
  → 접속 가능 ✅
```

---

### 2️⃣ 로그인 플로우

#### A. 보호된 페이지 → 로그인 → 복귀
```
1. http://localhost:3000/admin/roles 접속
   → /signin?redirectTo=/admin/roles로 리다이렉트

2. Google로 로그인 클릭
   → OAuth 플로우 시작
   → redirectTo가 callback URL에 전달됨

3. 로그인 성공
   → /auth/callback?redirectTo=/admin/roles
   → 세션 저장 완료
   → /admin/roles로 자동 복귀 ✅
```

#### B. 로그인 페이지에서 직접 로그인
```
1. http://localhost:3000/signin 접속
   → redirectTo 없음 (기본값: /admin)

2. 이메일/비밀번호로 로그인
   → 세션 저장
   → /admin으로 이동 ✅
```

---

### 3️⃣ 로그아웃 플로우

#### A. 로그아웃 후 세션 완전 삭제
```
1. 로그인 상태에서 "로그아웃" 클릭
   ↓
2. 클라이언트 처리:
   - supabase.auth.signOut()
   - localStorage.clear()
   ↓
3. 서버 처리:
   - POST /api/auth/signout
   - app_jwt 쿠키 삭제
   - sb-* 쿠키 모두 삭제
   ↓
4. window.location.href = '/signin'
   → Hard redirect (캐시 무효화)
```

#### B. 로그아웃 후 보호된 페이지 접근 불가
```
1. 로그아웃 완료 → /signin 페이지

2. 브라우저 뒤로가기
   → middleware가 세션 없음 감지
   → /signin으로 리다이렉트 ✅

3. /admin 직접 입력
   → middleware가 세션 없음 감지
   → /signin?redirectTo=/admin으로 리다이렉트 ✅

4. 개발자 도구에서 쿠키 확인
   → app_jwt 없음 ✅
   → sb-* 쿠키 없음 ✅
```

---

## 🔧 공개 페이지 추가 방법

새로운 공개 페이지를 만들려면 `middleware.ts`의 `publicPaths`에 추가:

```typescript
const publicPaths = [
  "/signin",
  "/auth/callback",
  "/auth/verify",
  "/forgot-password",
  "/api/auth/signout",
  "/api/session",
  "/api/supabase-session",
  "/api/profile/ensure",
  "/about",              // ← 새 공개 페이지 추가
  "/terms",              // ← 새 공개 페이지 추가
];
```

---

## 📊 보안 매트릭스

| 경로 | 로그인 필요 | 예외 처리 |
|------|-----------|----------|
| `/` | ✅ Yes | page.tsx에서 리다이렉트 |
| `/signin` | ❌ No | publicPaths |
| `/admin/*` | ✅ Yes | middleware |
| `/dashboard/*` | ✅ Yes | middleware |
| `/notes/*` | ✅ Yes | middleware |
| `/profiles/*` | ✅ Yes | middleware |
| `/api/*` | ✅ Yes | middleware |
| `/api/auth/signout` | ❌ No | publicPaths |
| `/auth/callback` | ❌ No | publicPaths |
| `/forgot-password` | ❌ No | publicPaths |

---

## 🎯 핵심 변경

### Before (특정 경로만 보호)
```typescript
const protectedPaths = ["/admin", "/dashboard"]
if (protectedPaths.some(...) && !session) {
  redirect('/signin')
}
// ❌ 다른 경로는 보호 안 됨!
```

### After (모든 경로 기본 보호)
```typescript
const publicPaths = ["/signin", "/auth/callback"]
if (!publicPaths.some(...) && !session) {
  redirect('/signin')
}
// ✅ 공개 페이지 외에는 모두 보호됨!
```

---

## 🚀 테스트 체크리스트

### ✅ 로그인 전
- [ ] `/` → `/signin`으로 리다이렉트
- [ ] `/admin` → `/signin?redirectTo=/admin`
- [ ] `/admin/policies` → `/signin?redirectTo=/admin/policies`
- [ ] `/api/policies` → `/signin`으로 리다이렉트
- [ ] `/signin` → 접속 가능 (무한 루프 없음)

### ✅ 로그인 후
- [ ] `/` → `/admin`으로 리다이렉트
- [ ] `/admin` → 접속 가능
- [ ] `/admin/policies` → 접속 가능
- [ ] 헤더에 이메일 + 로그아웃 버튼 표시

### ✅ 로그아웃 후
- [ ] localStorage 비어있음
- [ ] 쿠키 모두 삭제됨
- [ ] `/signin`으로 이동
- [ ] `/admin` 접속 시 `/signin?redirectTo=/admin`으로 리다이렉트
- [ ] 브라우저 뒤로가기 시 접근 불가

---

## 🔒 보안 강화 완료!

**이제 모든 페이지가 기본적으로 보호됩니다!**

dev 서버를 재시작하고 위의 체크리스트를 확인하세요! 🚀

