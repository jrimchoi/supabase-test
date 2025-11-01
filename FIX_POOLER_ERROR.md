# Pooler "prepared statement already exists" 에러 해결

## ❌ 에러 메시지

```
Error: prepared statement "s0" already exists
```

---

## 🔍 원인

현재 `.env.local`이 **Pooler + `pgbouncer=true`**를 사용하고 있어서 발생합니다.

**Pooler의 제약**:
- Session Pooling 모드에서 Prepared Statement 캐싱 문제
- 페이지 새로고침 시 같은 statement 재사용 시도 → 충돌

---

## ✅ 해결 방법 (3가지)

### 방법 1: 자동 스크립트 실행 (가장 쉬움!)

터미널에서 실행:

```bash
./switch-to-direct.sh
```

**자동으로 수행**:
- ✅ Pooler URL → Direct Connection URL 변환
- ✅ `.env.local.backup` 백업 생성
- ✅ `pgbouncer=true` 제거

실행 후:
```bash
npm run dev  # 서버 재시작
```

---

### 방법 2: 수동 변경

`.env.local` 파일을 열고 `DATABASE_URL`을 수정:

#### Before (Pooler)
```bash
DATABASE_URL="postgresql://postgres.ckujlkdumhhtjkinngjf:JFU1hbZtGSvFspnM@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?schema=public&pgbouncer=true"
```

#### After (Direct Connection)
```bash
DATABASE_URL="postgresql://postgres.ckujlkdumhhtjkinngjf:JFU1hbZtGSvFspnM@db.ckujlkdumhhtjkinngjf.supabase.co:5432/postgres?schema=public"
```

**핵심 변경**:
1. `pooler.supabase.com:6543` → `db.ckujlkdumhhtjkinngjf.supabase.co:5432`
2. `&pgbouncer=true` 제거

---

### 방법 3: Supabase Dashboard에서 복사

1. https://supabase.com/dashboard 접속
2. 프로젝트 선택
3. Settings → Database
4. **Connection String** 섹션
5. **Direct connection** 탭 선택
6. Transaction pooling 모드
7. Connection string 복사
8. `.env.local`의 `DATABASE_URL` 값 교체
9. `?schema=public` 추가

---

## 🚀 변경 후 확인

### 1. dev 서버 재시작

```bash
npm run dev
```

### 2. 브라우저에서 확인

```
http://localhost:3000/admin
```

**에러가 없어야 함!**

---

## 📊 Direct Connection vs Pooler

| 항목 | Direct Connection | Pooler |
|------|------------------|--------|
| **호스트** | `db.xxx.supabase.co` | `pooler.supabase.com` |
| **포트** | 5432 | 6543 |
| **로컬 개발** | ✅ 권장 (빠르고 안정적) | ⚠️ 제약 있음 |
| **통합 테스트** | ✅ 필수 | ❌ 에러 발생 |
| **프로덕션** | ✅ 가능 | ✅ Serverless 최적화 |

---

## 💡 결론

**로컬 개발 환경에서는 Direct Connection을 사용하세요!**

- ✅ 더 빠름
- ✅ 에러 없음
- ✅ 모든 Prisma 기능 지원
- ✅ 디버깅 쉬움

**프로덕션 배포 시에만 Pooler를 사용하세요!**

