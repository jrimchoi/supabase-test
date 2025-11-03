# Vercel 프로덕션 에러 디버깅 가이드

## 🐛 발생한 에러

**URL:** `/admin/policies/policy2`

**에러:**
```
Application error: a server-side exception has occurred
Digest: 1218807656
```

**추가 에러:**
```
401 - manifest.json failed
Uncaught Error in Server Components render
```

## 🔍 원인 파악 방법

### 1. Vercel 로그 확인 (가장 정확!)

#### Vercel Dashboard:
```
1. https://vercel.com/dashboard
2. supabase-test 프로젝트 클릭
3. Deployments 탭
4. 최신 배포 클릭
5. "Runtime Logs" 탭 또는 "Functions" 탭
6. 에러 메시지 확인
```

**찾아야 할 것:**
- `PrismaClientKnownRequestError`
- `column does not exist`
- `Invalid prisma.xxx.findUnique()`

---

### 2. 로컬에서 재현

```bash
# 1. 최신 코드로 업데이트
git pull

# 2. Prisma Client 재생성
npx prisma generate

# 3. 개발 서버 실행
npm run dev

# 4. 동일한 URL 접속
http://localhost:3000/admin/policies/policy2

# 5. 터미널에서 상세한 에러 메시지 확인
```

---

### 3. 401 에러 (manifest.json)

이건 부차적인 문제입니다:

**원인:**
- PWA manifest.json 요청 시 인증 에러
- 서버 에러로 인해 모든 요청이 실패

**해결:**
- 메인 서버 에러를 먼저 해결하면 자동으로 해결됨

---

## 🔧 체크리스트

### 데이터베이스 확인

**Supabase SQL Editor에서 실행:**

```sql
-- 1. Type 테이블 컬럼 확인
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'Type';

-- 기대: id, name, description, prefix, policyId, parentId, createdAt, updatedAt
```

```sql
-- 2. Policy 데이터 확인
SELECT id, name, description 
FROM "Policy" 
WHERE id = 'policy2';

-- policy2가 존재하는지 확인
```

```sql
-- 3. PolicyType 확인
SELECT pt.id, p.name as policy_name, t.name as type_name
FROM "PolicyType" pt
JOIN "Policy" p ON pt."policyId" = p.id
JOIN "Type" t ON pt."typeId" = t.id
WHERE pt."policyId" = 'policy2';

-- policy2와 연결된 Type이 있는지 확인
```

---

## 🎯 예상 원인 & 해결

### 원인 1: Vercel이 이전 빌드 캐시 사용

**해결:**
```bash
# 코드 푸시 후
git commit --allow-empty -m "Force rebuild"
git push

# 또는 Vercel Dashboard에서 수동 재배포
```

### 원인 2: Prisma Client 버전 불일치

**해결:**
```bash
# 로컬에서
npx prisma generate

# 커밋 & 푸시
git add .
git commit -m "Regenerate Prisma Client"
git push
```

### 원인 3: 환경 변수 문제

**확인:**
```
Vercel Dashboard → Settings → Environment Variables
DATABASE_URL이 올바른지 확인
```

### 원인 4: 데이터 불일치

**해결:**
```sql
-- Supabase SQL Editor
-- init-v2.sql 전체 재실행
```

---

## 🚀 권장 조치 (순서대로)

### 1단계: Vercel 로그 확인
```
Vercel Dashboard → Deployments → Runtime Logs
실제 에러 메시지 확인
```

### 2단계: 로컬 재현
```bash
npm run dev
http://localhost:3000/admin/policies/policy2
터미널 에러 메시지 확인
```

### 3단계: 데이터베이스 재초기화
```sql
-- Supabase SQL Editor
-- prisma/init-v2.sql 실행
```

### 4단계: 강제 재배포
```bash
git commit --allow-empty -m "Force rebuild after DB migration"
git push
```

---

## 💡 빠른 해결 (3분)

**가장 확실한 방법:**

1. **Supabase SQL Editor:**
```sql
-- init-v2.sql 전체 내용 복사 & 실행
```

2. **Vercel 재배포:**
```bash
git commit --allow-empty -m "Rebuild"
git push
```

3. **캐시 제거:**
- 브라우저 시크릿 모드로 접속
- 또는 Hard Refresh (Ctrl+Shift+R / Cmd+Shift+R)

---

## 🔍 Digest 번호 활용

```
Digest: 1218807656
```

**Vercel 로그에서 검색:**
1. Runtime Logs 또는 Functions 탭
2. "1218807656" 검색
3. 정확한 에러 메시지 확인

이 digest로 정확한 에러를 찾을 수 있습니다!

---

## 🎯 다음 단계

**우선순위:**
1. ✅ Vercel Runtime Logs 확인 (정확한 에러 파악)
2. ✅ Supabase에서 `init-v2.sql` 재실행
3. ✅ 강제 재배포
4. ✅ 브라우저 캐시 제거 후 재접속

Vercel 로그에서 어떤 에러가 나오는지 확인해주시면 정확한 해결책을 드릴 수 있습니다! 😊

