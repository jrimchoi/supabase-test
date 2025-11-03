# .env.local 수정 가이드

## 🎯 목표

Direct Connection이 막혀있으므로 **Pooler를 사용하되 `pgbouncer=true` 제거**

---

## ✅ 해결 방법

### `.env.local` 파일 수정

#### Before (현재 - 문제)
```bash
DATABASE_URL="postgresql://postgres:JFU1hbZtGSvFspnM@[2406:da18:243:741f:236d:bb26:157f:24a8]:5432/postgres?sslmode=require&schema=public
```

**문제점**:
- ❌ IPv6 주소 (불안정)
- ❌ 따옴표 미닫힘
- ❌ postgres.xxx 형식이 아님

---

#### After (해결)

```bash
DATABASE_URL="postgresql://postgres.ckujlkdumhhtjkinngjf:JFU1hbZtGSvFspnM@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?schema=public"
```

**변경 사항**:
- ✅ Pooler 호스트 사용
- ✅ 포트 6543
- ✅ `pgbouncer=true` **제거** (중요!)
- ✅ `schema=public` 유지

---

## 📝 전체 .env.local 예시

```bash
# Supabase Connection (Pooler - Session Pooling 모드)
DATABASE_URL="postgresql://postgres.ckujlkdumhhtjkinngjf:JFU1hbZtGSvFspnM@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?schema=public"

# Supabase Config
NEXT_PUBLIC_SUPABASE_URL="https://ckujlkdumhhtjkinngjf.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_ANON_KEY"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

---

## 🚀 적용 방법

### 1. .env.local 파일 백업

```bash
cp .env.local .env.local.backup
```

### 2. .env.local 파일 열기

VS Code 또는 텍스트 에디터로 `.env.local` 열기

### 3. DATABASE_URL 수정

위의 "After" URL로 변경:

```bash
DATABASE_URL="postgresql://postgres.ckujlkdumhhtjkinngjf:JFU1hbZtGSvFspnM@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?schema=public"
```

**주의**: 
- 비밀번호(`JFU1hbZtGSvFspnM`)는 실제 비밀번호로 변경
- 따옴표를 정확히 닫기

### 4. 저장 후 서버 재시작

```bash
npm run dev
```

---

## ✅ 확인

### 터미널 로그

서버 시작 후:

```
✓ Starting...
✓ Ready in 3s
- Local:        http://localhost:3000
```

에러 없이 시작되어야 함!

### 브라우저 접속

```
http://localhost:3000/admin
```

터미널에 다음이 표시되어야 함:

```
🔒 MIDDLEWARE 실행: /admin
🚫 세션 없음! 리다이렉트: /admin → /signin
```

---

## 💡 왜 pgbouncer=true를 제거하나?

### Pooler 모드

| 파라미터 | 모드 | 특징 | 문제 |
|---------|------|------|------|
| `pgbouncer=true` | Transaction Pooling | 매우 빠름 | Prepared Statement 충돌 |
| (없음) | Session Pooling | 안정적 | 약간 느림 |

**Session Pooling 모드**가 로컬 개발에 더 적합!

---

## 🎯 최종 설정

```bash
# Pooler (Session Pooling 모드)
DATABASE_URL="postgresql://postgres.ckujlkdumhhtjkinngjf:JFU1hbZtGSvFspnM@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?schema=public"
```

**`.env.local`을 이 설정으로 변경 후 저장하고 `npm run dev`를 실행하세요!** 🚀

