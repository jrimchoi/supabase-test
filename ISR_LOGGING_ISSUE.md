# 🔍 ISR 캐싱과 로그 출력 문제

## ❌ 문제

**서버 로그가 보이지 않는 이유:**

```typescript
export const revalidate = 10  // ISR 캐싱

async function getAllBusinessObjects() {
  console.log('📊 [BusinessObjects Page] 시작')  // ← 이 로그가 안 보임!
  // ...
}
```

**원인:**
1. **첫 방문자:** 서버 함수 실행 → 로그 출력 ✅
2. **10초 내 재방문:** 캐시된 HTML 반환 → **함수 실행 안 됨** → 로그 없음! ❌

**ISR의 동작:**
- 캐시 유효 시간 내에는 페이지 함수가 **실행되지 않음**
- Pre-rendered HTML만 반환
- console.log도 실행 안 됨!

---

## ✅ 해결 방법

### 방법 1: 임시로 Dynamic 모드 (디버깅용)

```typescript
// 성능 측정 시에만 사용
export const dynamic = 'force-dynamic'  // 매번 실행
// export const revalidate = 10          // 캐싱 비활성화
```

**장점:**
- ✅ 매번 로그 출력
- ✅ 성능 측정 정확

**단점:**
- ❌ 캐시 없음 (느림)
- ❌ 서버 부하 증가

**사용 후 반드시 원복:**
```typescript
// 측정 완료 후:
// export const dynamic = 'force-dynamic'
export const revalidate = 10  // ← 다시 활성화!
```

---

### 방법 2: 캐시 무효화 후 확인

**Vercel Dashboard:**
1. Deployments → 최신 배포
2. "..." → "Redeploy"
3. ☑️ "Use existing Build Cache" 체크 해제
4. Redeploy 클릭
5. **첫 방문자로 접속** → 로그 확인!

---

### 방법 3: URL에 고유 파라미터 추가

```
https://your-app.vercel.app/admin/business-objects?debug=123

매번 다른 값:
?debug=456
?debug=789
```

**효과:**
- 다른 URL = 다른 캐시 키
- 매번 새로 렌더링
- 로그 출력됨

**단점:**
- 캐시 확인 안 됨

---

### 방법 4: Middleware 로그 활용

**Middleware는 캐시와 무관하게 항상 실행됨!**

```typescript
// middleware.ts
export async function middleware(req: NextRequest) {
  const start = performance.now()
  
  // ... 인증 로직 ...
  
  const duration = performance.now() - start
  console.log(`⏱️  [Middleware] ${req.nextUrl.pathname}: ${duration.toFixed(2)}ms`)
  
  return res
}
```

**장점:**
- ✅ ISR 캐싱 중에도 로그 출력
- ✅ 네트워크 성능 측정 가능

---

## 🎯 권장 방법

### 성능 측정 단계:

**1. 디버깅 모드 활성화 (임시)**
```typescript
// src/app/admin/business-objects/page.tsx
export const dynamic = 'force-dynamic'  // 임시!
```

**2. 배포 & 로그 확인**
```bash
git add .
git commit -m "temp: Enable dynamic mode for performance debugging"
git push

# Vercel Logs 확인:
# 📊 [BusinessObjects Page] 시작
# 🔍 [DB Query] 완료: XXms
```

**3. 성능 확인 후 원복**
```typescript
// src/app/admin/business-objects/page.tsx
// export const dynamic = 'force-dynamic'
export const revalidate = 10  // ← 원복!
```

**4. 재배포**
```bash
git add .
git commit -m "perf: Restore ISR caching after performance check"
git push
```

---

## 📊 예상 로그 (Dynamic 모드)

### Vercel Logs (Real-time):

```
2025-11-03 21:10:15.123 [info] 📊 [BusinessObjects Page] 시작
2025-11-03 21:10:15.123 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-11-03 21:10:15.123 [info] 🔍 [DB Query] 시작...

2025-11-03 21:10:15.173 [info] ✅ [DB Query] 완료: 50.23ms
2025-11-03 21:10:15.173 [info]    - 조회 개수: 50개
2025-11-03 21:10:15.173 [info]    - 평균: 1.00ms/item

2025-11-03 21:10:15.173 [info] 📦 [Data Size] 8.45 KB

2025-11-03 21:10:15.173 [info] ⏱️  [Total] 52.18ms
2025-11-03 21:10:15.173 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🎨 대안: 로컬에서 확인

**로컬 개발 서버:**
```bash
npm run dev

# BusinessObject 페이지 방문
# 터미널에 로그 출력됨:
```

**로컬 로그:**
```
📊 [BusinessObjects Page] 시작
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 [DB Query] 시작...
✅ [DB Query] 완료: 123.45ms
   - 조회 개수: 45개
   - 평균: 2.74ms/item
📦 [Data Size] 12.34 KB
⏱️  [Total] 125.67ms
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🚀 빠른 해결

**지금 바로 확인:**
1. 임시로 `dynamic = 'force-dynamic'` 적용
2. 배포
3. Vercel Logs 확인
4. 성능 파악
5. 다시 `revalidate = 10`으로 원복

임시로 Dynamic 모드로 변경해드릴까요? 🔍

