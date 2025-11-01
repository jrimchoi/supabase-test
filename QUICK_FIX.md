# ⚡ 통합 테스트 빠른 수정 가이드

## 🎯 문제

```
Error opening a TLS connection: bad certificate format
```

## ✅ 해결 (30초)

### 1. `.env.local` 파일 열기

```bash
code .env.local  # 또는 원하는 에디터
```

### 2. DATABASE_URL 수정

**변경 전** (Pooler):
```
DATABASE_URL="postgresql://postgres.xxx:password@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?schema=public"
```

**변경 후** (Direct Connection):
```
DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres?schema=public"
```

**핵심 변경사항**:
- ❌ `aws-1-ap-southeast-1.pooler.supabase.com:6543`
- ✅ `db.xxx.supabase.co:5432`

### 3. 테스트 재실행

```bash
npm run test:integration
```

---

## 📋 완전한 예시

`.env.local` 파일:

```bash
# Direct Connection (통합 테스트용)
DATABASE_URL="postgresql://postgres:JFU1hbZtGSvFspnM@db.ckujlkdumhhtjkinngjf.supabase.co:5432/postgres?schema=public"

NEXT_PUBLIC_SUPABASE_URL="https://ckujlkdumhhtjkinngjf.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrdWpsa2R1bWhodGpraW5uZ2pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MzEwODAsImV4cCI6MjA3NzQwNzA4MH0.vjpQ8SVgu9HcGAp0LfpBluhQxAm_RQ2eCBc_hyH3IL4"
```

---

## 🔍 비밀번호 찾는 방법

1. Supabase Dashboard → https://supabase.com
2. Settings → Database
3. Connection String → **Direct connection**
4. Password 부분 복사

---

## ⚠️ IP 제한 확인

Direct Connection이 실패하면:

1. Supabase Dashboard → Settings → Database
2. Connection Pooling → IP Restrictions
3. 현재 IP 추가 또는 **제한 해제**

---

**끝!** 이제 `npm run test:integration`을 실행하세요! 🚀

