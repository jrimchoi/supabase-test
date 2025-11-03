# 성능 최적화 적용 가이드

## 📊 현재 성능 문제

### 메뉴 클릭 시:
```
Types 메뉴 클릭:
- types?_rsc=10h84: 502ms
- types?_rsc=18m1u: 380ms
총: 882ms (약 1초!)
```

### 원인:
1. **캐싱 없음** - 매번 서버에서 새로 가져옴
2. **RSC (React Server Components)** - 2번씩 요청
3. **데이터베이스 Latency** - Vercel(미국) ↔ Supabase(싱가포르)

---

## 🚀 즉시 적용 가능한 최적화

### 1. 캐싱 활성화 (90% 속도 향상! ⭐⭐⭐)

#### 적용 대상 파일:

**거의 안 바뀌는 데이터 (60초 캐싱):**
```typescript
// src/app/admin/types/page.tsx
export const revalidate = 60
// export const dynamic = 'force-dynamic' ← 제거!

// src/app/admin/attributes/page.tsx
export const revalidate = 60

// src/app/admin/roles/page.tsx
export const revalidate = 60

// src/app/admin/groups/page.tsx
export const revalidate = 60
```

**가끔 바뀌는 데이터 (30초 캐싱):**
```typescript
// src/app/admin/policies/page.tsx
export const revalidate = 30

// src/app/admin/states/page.tsx
export const revalidate = 30

// src/app/admin/permissions/page.tsx
export const revalidate = 30

// src/app/admin/transitions/page.tsx
export const revalidate = 30
```

**자주 바뀌는 데이터 (10초 캐싱):**
```typescript
// src/app/admin/business-objects/page.tsx
export const revalidate = 10
```

**효과:**
```
첫 방문: 500ms
이후 캐시 적중: 50ms (10배 빠름!) ⚡
```

---

### 2. Sidebar Link 최적화

**파일:** `src/components/admin/AdminLayout.tsx`

#### Before (느림):
```typescript
<a href={item.href} className="...">
  {/* ... */}
</a>
```

#### After (빠름):
```typescript
import Link from 'next/link'

<Link href={item.href} prefetch={true} className="...">
  {/* ... */}
</Link>
```

**효과:**
- 마우스 호버 시 자동 prefetch
- 클릭 즉시 전환
- 체감 속도 2-3배 향상

---

### 3. Loading Skeleton

**파일:** 각 List 컴포넌트

#### Before:
```typescript
<Suspense fallback={<div>로딩 중...</div>}>
  <TypeList />
</Suspense>
```

#### After:
```typescript
<Suspense fallback={<TableSkeleton rows={5} cols={7} />}>
  <TypeList />
</Suspense>
```

**새 컴포넌트:** `src/components/ui/table-skeleton.tsx`
```typescript
export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <div 
              key={j} 
              className="h-12 bg-muted animate-pulse rounded"
              style={{ width: `${100 / cols}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
```

**효과:**
- 실제 속도는 같음
- 체감 속도 향상 (즉각적 피드백)
- 전문적인 UX

---

### 4. 데이터베이스 쿼리 최적화

#### 인덱스 확인:
```sql
-- Supabase SQL Editor
-- 현재 인덱스 확인
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

#### 필요한 인덱스:
```sql
-- 이미 schema.prisma에 있지만 확인
CREATE INDEX IF NOT EXISTS "Policy_isActive_idx" ON "Policy"("isActive");
CREATE INDEX IF NOT EXISTS "Type_policyId_idx" ON "Type"("policyId");
CREATE INDEX IF NOT EXISTS "State_policyId_idx" ON "State"("policyId");
```

---

## 📊 최적화 전후 비교

### Before (현재):
```
Types 메뉴 클릭:
- 첫 방문: 500ms
- 재방문: 500ms (캐시 없음)
- 10번 클릭: 5000ms (5초)
```

### After (최적화):
```
Types 메뉴 클릭:
- 첫 방문: 500ms
- 재방문: 50ms (캐시 적중!)
- 10번 클릭: 500ms + 450ms = 950ms (0.95초)

10배 빠름! 🚀
```

---

## 🎯 우선순위별 적용

### Phase 1 (즉시, 10분):
1. ✅ 캐싱 활성화 (`revalidate` 설정)
2. ✅ `dynamic = 'force-dynamic'` 제거

**효과:** 90% 속도 향상

### Phase 2 (30분):
3. ✅ Sidebar Link 컴포넌트 변경
4. ✅ Loading Skeleton 추가

**효과:** 체감 속도 2배 향상

### Phase 3 (선택):
5. ✅ 데이터베이스 인덱스 최적화
6. ✅ 번들 크기 최적화

---

## 🔍 성능 측정 스크립트

### 브라우저 콘솔에서:
```javascript
// 페이지 로드 시간 측정
performance.measure('page-load', 'navigationStart')
console.log(performance.getEntriesByType('measure'))

// Navigation Timing
const navTiming = performance.getEntriesByType('navigation')[0]
console.log({
  DNS: navTiming.domainLookupEnd - navTiming.domainLookupStart,
  TCP: navTiming.connectEnd - navTiming.connectStart,
  Request: navTiming.responseStart - navTiming.requestStart,
  Response: navTiming.responseEnd - navTiming.responseStart,
  DOM: navTiming.domContentLoadedEventEnd - navTiming.responseEnd,
})
```

---

## 💡 Vercel 지역 최적화

**현재:**
- Vercel: Washington DC (iad1)
- Supabase: 싱가포르? (확인 필요)
- Latency: 300-600ms

**개선 (선택):**
1. Supabase 지역 변경 (불가능한 경우 많음)
2. Vercel Edge Functions 사용
3. 캐싱으로 Latency 우회

---

## 🎊 예상 결과

**최적화 적용 후:**

```
메뉴 클릭 (첫 방문):
- 500ms ← 변화 없음

메뉴 클릭 (캐시 적중):
- 50ms ← 10배 빠름! 🚀

메뉴 간 전환:
- Prefetch 덕분에 즉시 전환
- 체감 속도: 거의 즉시!
```

---

## 🚀 빠른 시작

적용해드릴까요?

1. **캐싱만 활성화** (10분, 90% 개선)
2. **캐싱 + Sidebar Link** (30분, 95% 개선)  
3. **전체 최적화** (1시간, 완벽!)

선택해주세요! 😊

