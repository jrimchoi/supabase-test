# 🔧 통합 테스트 문제 해결 가이드

## ❌ 현재 발생한 문제

```
Error opening a TLS connection: bad certificate format
```

### 원인

Supabase **Pooler** (포트 6543) 연결 시 Prisma Client의 TLS 인증서 검증 문제입니다.

---

## ✅ 해결 방법

### 방법 1: Direct Connection 사용 (권장)

통합 테스트용으로 `.env.test` 파일을 만드세요:

```bash
# .env.test (통합 테스트 전용)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.ckujlkdumhhtjkinngjf.supabase.co:5432/postgres?schema=public"
NEXT_PUBLIC_SUPABASE_URL="https://ckujlkdumhhtjkinngjf.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

**변경 사항**:
- ❌ `aws-1-ap-southeast-1.pooler.supabase.com:6543` (Pooler)
- ✅ `db.ckujlkdumhhtjkinngjf.supabase.co:5432` (Direct)

**장점**:
- ✅ TLS 에러 없음
- ✅ 안정적인 연결
- ✅ 마이그레이션 지원

**단점**:
- ⚠️ IP 제한이 있을 수 있음 (Supabase 대시보드에서 확인)

---

### 방법 2: SSL 검증 비활성화

`.env.local`에서 DATABASE_URL 수정:

```bash
# Pooler 사용 + SSL 검증 비활성화
DATABASE_URL="postgresql://postgres.xxx:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?schema=public&sslmode=require&sslaccept=strict"
```

**또는**:

```bash
# SSL 완전 비활성화 (로컬 테스트용)
DATABASE_URL="postgresql://postgres.xxx:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?schema=public&sslmode=disable"
```

⚠️ **주의**: `sslmode=disable`은 프로덕션에서 사용하지 마세요!

---

### 방법 3: 환경 변수 파일 자동 로드

`jest.integration.setup.js` 수정 완료 (이미 적용됨):

```javascript
// .env.local 자동 로드
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8')
  // ... 로드 로직
}
```

---

## 🚀 권장 설정

### `.env.local` (개발 & 앱 실행용)

```bash
# Session Pooling (앱 사용)
DATABASE_URL="postgresql://postgres.ckujlkdumhhtjkinngjf:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?schema=public"
NEXT_PUBLIC_SUPABASE_URL="https://ckujlkdumhhtjkinngjf.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

### `.env.test` (통합 테스트 전용) - 새로 생성

```bash
# Direct Connection (테스트용)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.ckujlkdumhhtjkinngjf.supabase.co:5432/postgres?schema=public"
NEXT_PUBLIC_SUPABASE_URL="https://ckujlkdumhhtjkinngjf.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

그리고 `jest.integration.setup.js` 수정:

```javascript
// .env.test 파일 우선 로드
const envPath = path.resolve(process.cwd(), '.env.test')
if (fs.existsSync(envPath)) {
  // .env.test 사용
} else {
  // .env.local fallback
}
```

---

## 📊 비교표

| 항목 | Direct Connection | Pooler (Session) | Pooler (Transaction) |
|------|-------------------|------------------|---------------------|
| **포트** | 5432 | 6543 | 6543 |
| **TLS 에러** | ❌ 없음 | ⚠️ 발생 가능 | ⚠️ 발생 가능 |
| **통합 테스트** | ✅ 권장 | ⚠️ SSL 설정 필요 | ❌ 권장하지 않음 |
| **마이그레이션** | ✅ 지원 | ✅ 지원 | ❌ 미지원 |
| **앱 운영** | ⚠️ 제한적 | ✅ 권장 | ⚠️ 제한적 |

---

## 🔍 디버깅

### 현재 DATABASE_URL 확인

```bash
# 터미널에서
echo $DATABASE_URL

# 또는 Node.js에서
node -e "require('dotenv').config({path:'.env.local'}); console.log(process.env.DATABASE_URL)"
```

### Supabase 연결 테스트

```bash
# psql로 Direct Connection 테스트
psql "postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres"

# Pooler 테스트
psql "postgresql://postgres.xxx:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres"
```

### IP 제한 확인

1. Supabase Dashboard → Settings → Database
2. Connection Pooling → IP Restrictions
3. 현재 IP 추가 또는 제한 해제

---

## 🎯 빠른 해결 방법

### 1. `.env.local` 파일 생성/수정

```bash
# Pooler 대신 Direct Connection 사용
DATABASE_URL="postgresql://postgres:[비밀번호]@db.ckujlkdumhhtjkinngjf.supabase.co:5432/postgres?schema=public"
```

### 2. 비밀번호 확인

Supabase Dashboard → Settings → Database → Connection String

### 3. 테스트 재실행

```bash
npm run test:integration
```

---

## 📝 참고

- Prisma는 Direct Connection을 선호합니다
- 통합 테스트는 Mock이 아닌 실제 DB를 사용합니다
- 테스트 데이터는 자동으로 정리됩니다 (`afterAll`)

---

**문제가 계속되면**: `INTEGRATION_TEST_GUIDE.md`를 참고하거나 이슈를 등록하세요.

