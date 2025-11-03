# 환경별 DATABASE_URL 설정 가이드

## 🎯 핵심 개념

### 실제 애플리케이션 (Next.js)
- **Pooler** 사용 권장
- 포트: `6543`
- 파라미터: `pgbouncer=true`
- 이유: Serverless 최적화, 다수 연결 처리

### 통합 테스트 (Jest)
- **Direct Connection** 사용 필수
- 포트: `5432`
- 파라미터: `schema=public`
- 이유: Prepared Statement, Transaction 완전 지원

---

## 🔧 설정 방법

### 1. `.env.local` (Next.js 앱용 - Pooler)

```bash
# Pooler Connection (Serverless 최적화)
DATABASE_URL="postgresql://postgres.ckujlkdumhhtjkinngjf:JFU1hbZtGSvFspnM@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?schema=public&pgbouncer=true"
```

**용도**:
- `npm run dev` (개발 서버)
- `npm run build` (프로덕션 빌드)
- Next.js API Routes
- Server Components

---

### 2. `.env.test` (통합 테스트용 - Direct Connection)

**.env.test 파일 생성**:

```bash
# 통합 테스트 전용
# Direct Connection (안정적, Full Feature)
DATABASE_URL="postgresql://postgres.ckujlkdumhhtjkinngjf:JFU1hbZtGSvFspnM@db.ckujlkdumhhtjkinngjf.supabase.co:5432/postgres?schema=public"
```

**URL 확인 방법**:
1. Supabase Dashboard → Settings → Database
2. **Connection String** 섹션
3. **Direct connection** 탭 선택
4. Transaction pooling 모드 선택
5. **Connection string** 복사
6. `.env.test`에 붙여넣기

---

### 3. `jest.integration.setup.js` 수정

`.env.test` 파일을 먼저 로드하도록 수정:

```javascript
// .env.test 파일 읽기 (통합 테스트 전용)
const envTestPath = path.resolve(process.cwd(), '.env.test')
if (fs.existsSync(envTestPath)) {
  const envConfig = fs.readFileSync(envTestPath, 'utf8')
  envConfig.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...values] = trimmed.split('=')
      const value = values.join('=')
      if (key && value) {
        process.env[key] = value.replace(/^["']|["']$/g, '')
      }
    }
  })
  console.log('✅ .env.test 로드 완료 (Direct Connection)')
} else {
  // .env.local fallback
  const envPath = path.resolve(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    // ... 기존 로직
  }
}
```

---

## 📊 비교

| 항목 | Pooler | Direct Connection |
|------|--------|-------------------|
| **호스트** | `pooler.supabase.com` | `db.xxx.supabase.co` |
| **포트** | 6543 | 5432 |
| **모드** | Transaction/Session Pooling | Direct |
| **파라미터** | `pgbouncer=true` | `schema=public` |
| **연결 수** | 제한적 (공유 풀) | 직접 연결 |
| **Prepared Statement** | ⚠️ 제한적 | ✅ 완전 지원 |
| **Transaction** | ✅ 지원 (Transaction mode) | ✅ 완전 지원 |
| **용도** | Serverless, API | 개발, 테스트, Admin |

---

## 🚀 권장 구성

### 프로젝트 구조

```
.env.local        ← Pooler (Next.js 앱용)
.env.test         ← Direct Connection (통합 테스트용)
.env.production   ← Pooler (프로덕션용)
.gitignore        ← .env.* 모두 무시
```

### `.gitignore` 추가

```
# 환경 변수 파일
.env
.env.local
.env.test
.env.development
.env.production
```

---

## 🎯 빠른 해결

### 1. Direct Connection URL 확인

Supabase Dashboard → Settings → Database → **Direct connection**

### 2. `.env.test` 생성

```bash
DATABASE_URL="postgresql://postgres.xxx:PASSWORD@db.xxx.supabase.co:5432/postgres?schema=public"
```

### 3. `jest.integration.setup.js` 수정

파일 맨 위에 추가:

```javascript
// .env.test 우선 로드
const envTestPath = path.resolve(process.cwd(), '.env.test')
if (fs.existsSync(envTestPath)) {
  // .env.test 로드 로직
  console.log('✅ .env.test 로드 (Direct Connection)')
} else {
  // .env.local fallback
}
```

### 4. 테스트 실행

```bash
npm run test:integration
```

---

## ✅ 결론

- **Next.js 앱**: Pooler 사용 (`.env.local`)
- **통합 테스트**: Direct Connection 사용 (`.env.test`)
- **성능**: Direct Connection이 테스트에 더 안정적이고 빠름

**지금 `.env.test` 파일을 생성해주세요!** 🚀

