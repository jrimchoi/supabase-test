# 통합 테스트 환경 설정 가이드

## 문제
통합 테스트에서 **TLS 인증서 오류** 발생:
```
Error opening a TLS connection: bad certificate format
```

---

## 해결 방법

### `.env.test` 파일 수정

**현재:**
```env
DATABASE_URL="postgresql://postgres.xxx:password@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?schema=public&pgbouncer=true"
```

**수정 (다음 중 하나 선택):**

#### Option 1: sslmode=disable 추가 (추천)
```env
DATABASE_URL="postgresql://postgres.xxx:password@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?schema=public&pgbouncer=true&sslmode=disable"
```

#### Option 2: sslmode=prefer 추가
```env
DATABASE_URL="postgresql://postgres.xxx:password@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?schema=public&pgbouncer=true&sslmode=prefer"
```

#### Option 3: sslmode=allow 추가
```env
DATABASE_URL="postgresql://postgres.xxx:password@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?schema=public&pgbouncer=true&sslmode=allow"
```

---

## ⚠️ 중요

### 1. 테스트 전용 설정
- **프로덕션에서는 사용 금지!**
- `.env.test`는 로컬 테스트 전용
- `.env.local`이나 `.env.production`에는 적용하지 마세요

### 2. 보안
- `sslmode=disable`은 암호화 없이 연결
- 테스트 환경에서만 사용
- 네트워크가 안전한 환경에서만 사용

---

## 실행 방법

### 1. `.env.test` 파일 수정
```bash
vi .env.test
# 또는
code .env.test
```

### 2. DATABASE_URL에 `&sslmode=disable` 추가

### 3. 테스트 재실행
```bash
npm run test:integration
```

---

## 예상 결과

```
✅ .env.test 로드 완료
ℹ️  Pooler Connection 사용 (6543 포트)
ℹ️  SSL 인증서 검증 비활성화 (테스트용)
📊 DB 연결: aws-1-ap-southeast-1.pooler.supabase.com:6543

Test Suites: 3 passed, 3 total
Tests:       7 passed, 7 total
✅ 모든 테스트 통과!
```

---

## 트러블슈팅

### 여전히 TLS 오류가 발생하면

**전역 환경 변수 설정:**
```bash
export NODE_TLS_REJECT_UNAUTHORIZED=0
npm run test:integration
```

**또는 package.json 수정:**
```json
{
  "scripts": {
    "test:integration": "NODE_TLS_REJECT_UNAUTHORIZED=0 jest --config jest.integration.config.js"
  }
}
```

---

## 참고

- Supabase Pooler는 PgBouncer를 사용
- Pooler는 SSL/TLS 연결을 지원하지만 인증서 검증에 제한이 있을 수 있음
- 로컬 테스트에서는 `sslmode=disable`이 안전함

