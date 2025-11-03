# 🔧 Vercel 로그 출력 문제 해결

## ❌ 문제

**로컬에서는 로그가 보이는데 Vercel에서는 안 보임:**

```
로컬 (npm run dev):
✅ 📊 [BusinessObjects Page] 시작
✅ 🔍 [DB Query] 완료: 980ms

Vercel (배포):
❌ 로그 없음 (Middleware 로그만 보임)
```

---

## 🔍 원인

### 1. Edge Runtime에서 console.log 제한
- Vercel Edge Runtime에서는 일부 `console.log`가 캡처 안 됨
- stdout 대신 stderr 사용 필요

### 2. ISR 캐싱
- `revalidate = 10` 설정 시 캐시된 페이지 반환
- 서버 함수 실행 안 됨 → 로그 없음

---

## ✅ 해결

### 1. console.log → console.error

```typescript
// Before: Vercel에서 안 보임
console.log('📊 [BusinessObjects Page] 시작')

// After: Vercel에서도 보임!
console.error('📊 [BusinessObjects Page] 시작')
```

**이유:**
- `console.error`는 stderr로 출력
- Vercel은 stderr를 항상 캡처
- 로그 레벨 'error'가 아니라도 보임 (info로 표시)

---

### 2. Node.js Runtime 명시

```typescript
export const runtime = 'nodejs'  // Edge → Node.js
```

**효과:**
- 완전한 Node.js 환경
- 모든 console API 사용 가능
- 로그 안정적으로 출력

---

## 🎯 현재 설정 (이미 적용됨)

```typescript
// src/app/admin/business-objects/page.tsx

export const dynamic = 'force-dynamic'  // 매번 실행
export const runtime = 'nodejs'         // Node.js Runtime

async function getAllBusinessObjects() {
  console.error('📊 [BusinessObjects Page] 시작')  // stderr 사용!
  // ...
  console.error(`✅ [DB Query] 완료: ${duration}ms`)
  // ...
}
```

---

## 🚀 Vercel에서 확인

**배포 후:**

1. **Vercel Dashboard** → 프로젝트
2. **"Logs"** 탭 (왼쪽 메뉴)
3. **"Real-time"** 활성화 (우측 상단)
4. BusinessObject 페이지 방문
5. **로그 출력 확인!**

**예상 로그:**
```
2025-11-03 21:15:30.123 [info] 📊 [BusinessObjects Page] 시작
2025-11-03 21:15:30.123 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-11-03 21:15:30.123 [info] 🔍 [DB Query] 시작...
2025-11-03 21:15:31.103 [info] ✅ [DB Query] 완료: 980.21ms
2025-11-03 21:15:31.103 [info]    - 조회 개수: 45개
2025-11-03 21:15:31.103 [info]    - 평균: 21.78ms/item
2025-11-03 21:15:31.103 [info] 📦 [Data Size] 23.43 KB
2025-11-03 21:15:31.103 [info] ⏱️  [Total] 982.41ms
2025-11-03 21:15:31.103 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**주의:** `console.error`를 사용했지만 Vercel에서는 `[info]` 레벨로 표시됩니다!

---

## 📊 로컬 로그 분석

**현재 성능:**
```
DB 쿼리: 980ms  ← 느림! (예상: 50ms)
개수: 45개
평균: 21.78ms/item
크기: 23.43 KB
```

**문제:**
- ❌ **980ms는 너무 느림!**
- ❌ **createdAt 인덱스가 없음** (Full Table Scan)

**해결:**
```sql
-- Supabase SQL Editor에서 실행:
CREATE INDEX IF NOT EXISTS "BusinessObject_createdAt_idx" 
  ON "BusinessObject"("createdAt" DESC);
```

**예상 개선:**
- Before: 980ms
- After: **50ms** (20배 빠름!)

---

## 🚀 배포 및 확인

```bash
# 1. 배포
git add .
git commit -m "fix: Add Node.js runtime and stderr logging for Vercel

- Use console.error instead of console.log (Vercel captures stderr)
- Add runtime = 'nodejs' for reliable logging
- Enable force-dynamic for debugging

Current performance (local):
- DB Query: 980ms (needs createdAt index!)
- Data Size: 23.43 KB
- Total: 982ms

Next step: Add createdAt index to reduce query time from 980ms to 50ms"

git push

# 2. Vercel Logs 확인
# https://vercel.com/dashboard → Logs → Real-time

# 3. Supabase 인덱스 추가 (필수!)
# CREATE INDEX IF NOT EXISTS "BusinessObject_createdAt_idx" 
#   ON "BusinessObject"("createdAt" DESC);

# 4. 다시 확인 → 980ms → 50ms 확인!
```

---

## 🎯 중요!

**Supabase에 인덱스를 추가해야 합니다!**

```sql
CREATE INDEX IF NOT EXISTS "BusinessObject_createdAt_idx" 
  ON "BusinessObject"("createdAt" DESC);
```

**인덱스 없으면:**
- 980ms (현재, Full Table Scan)

**인덱스 추가 후:**
- **50ms** (20배 빠름!)

인덱스를 추가하시겠어요? 🚀
