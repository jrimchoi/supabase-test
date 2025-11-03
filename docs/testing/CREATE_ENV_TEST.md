# .env.test 파일 생성 가이드

## 🎯 목적

통합 테스트용 **Direct Connection** 설정 파일 생성

---

## 📋 단계별 가이드

### 1단계: Supabase Dashboard에서 Direct Connection URL 확인

1. https://supabase.com/dashboard 접속
2. 프로젝트 선택
3. 왼쪽 메뉴 **Settings** → **Database** 클릭
4. **Connection String** 섹션 찾기
5. **Direct connection** 탭 선택
6. **Mode**: Transaction pooling 선택
7. **Connection string** 복사

**예시**:
```
postgresql://postgres.ckujlkdumhhtjkinngjf:JFU1hbZtGSvFspnM@db.ckujlkdumhhtjkinngjf.supabase.co:5432/postgres
```

---

### 2단계: `.env.test` 파일 생성

프로젝트 루트에 `.env.test` 파일 생성:

```bash
# 터미널에서 실행
cd /Users/jrchoi/Documents/GitHub/supabase-test
touch .env.test
```

또는 VS Code에서:
1. 루트 디렉토리에서 우클릭
2. **New File** 선택
3. 파일명: `.env.test`

---

### 3단계: `.env.test` 내용 작성

복사한 URL에 `?schema=public` 추가:

```bash
# 통합 테스트 전용 (Direct Connection)
DATABASE_URL="postgresql://postgres.ckujlkdumhhtjkinngjf:JFU1hbZtGSvFspnM@db.ckujlkdumhhtjkinngjf.supabase.co:5432/postgres?schema=public"
```

**체크리스트**:
- ✅ 호스트: `db.xxx.supabase.co` (Pooler 아님!)
- ✅ 포트: `5432` (6543 아님!)
- ✅ 파라미터: `?schema=public` (pgbouncer=true 아님!)

---

### 4단계: 확인

터미널에서 파일 내용 확인:

```bash
cat .env.test
```

**예상 출력**:
```
DATABASE_URL="postgresql://postgres.xxx:PASSWORD@db.xxx.supabase.co:5432/postgres?schema=public"
```

---

### 5단계: 통합 테스트 실행

```bash
npm run test:integration
```

**예상 로그**:
```
✅ .env.test 로드 완료 (Direct Connection)
ℹ️  schema=public 추가
📊 DB 연결: db.ckujlkdumhhtjkinngjf.supabase.co:5432
1️⃣ Role 생성 중...
   ✅ Admin 역할 생성
```

---

## ⚠️ 주의사항

### `.env.local`은 그대로 유지!

```bash
# .env.local (Next.js 앱용 - Pooler 유지)
DATABASE_URL="postgresql://...@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?schema=public&pgbouncer=true"
```

**이유**:
- Next.js 앱은 Serverless 환경에서 실행
- Pooler가 연결 관리에 최적화됨
- `pgbouncer=true`로 성능 향상

---

## 📊 환경별 파일 구성

```
프로젝트 루트/
├─ .env.local      ← Next.js 앱 (Pooler)
├─ .env.test       ← 통합 테스트 (Direct Connection) ← 지금 생성!
└─ .gitignore      ← .env.* 모두 무시됨
```

---

## 🚀 완료 후

### 테스트 실행

```bash
npm run test:integration
```

### 개발 서버 실행

```bash
npm run dev  # .env.local 사용 (Pooler)
```

---

## 💡 Troubleshooting

### "Error opening a TLS connection" 에러

**원인**: 여전히 Pooler URL 사용 중

**해결**:
1. `.env.test` 파일 확인
2. 호스트가 `db.xxx.supabase.co:5432`인지 확인
3. `pgbouncer=true` 제거 확인

### "Can't reach database server" 에러

**원인**: Direct Connection 포트(5432) 차단

**해결**:
1. Supabase 프로젝트가 Pause 상태인지 확인
2. 네트워크/방화벽 확인
3. Pooler로 fallback: `.env.test` 삭제 → `.env.local` 사용

---

**지금 `.env.test` 파일을 만들어주세요!** 🎯

```bash
# 빠른 생성 (터미널)
cat > .env.test << 'EOF'
DATABASE_URL="postgresql://postgres.ckujlkdumhhtjkinngjf:JFU1hbZtGSvFspnM@db.ckujlkdumhhtjkinngjf.supabase.co:5432/postgres?schema=public"
EOF
```

실제 Direct Connection URL로 변경 후 테스트하세요!

