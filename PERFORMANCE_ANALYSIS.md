# 성능 분석 및 최적화 가이드

## 🔍 현재 문제 분석

### 네트워크 로그 분석 결과:

**요청 속도:**
- 평균: 300-600ms per request
- 최대: 1.69s (obj1)
- 데이터 크기: 0.1-2.0 kB (매우 작음)

**문제점:**
```
메뉴 클릭 시:
1. business-objects fetch: 391ms
2. attributes fetch: 568ms  
3. types fetch: 502ms
4. groups fetch: 501ms
5. roles fetch: 513ms
6. permissions fetch: 515ms
7. transitions fetch: 491ms
8. states fetch: 377ms
9. policies fetch: 308ms
10. admin fetch: 561ms

총 소요 시간: 약 4-5초! 😱
```

**왜 느린가:**
1. ❌ 요청이 **순차적으로** 실행됨
2. ❌ 각 요청마다 Vercel → Supabase 왕복 (Latency)
3. ❌ 캐싱 안 됨 (`dynamic = 'force-dynamic'`)
4. ❌ 매번 서버에서 새로 렌더링

---

## 📊 성능 측정 방법

### 1. Chrome DevTools - Network 탭

**현재 보고 계신 방법! ✅**

```
F12 → Network 탭
- 메뉴 클릭
- Waterfall 확인
- Time 컬럼 확인
```

**확인 사항:**
- 요청이 순차적? 병렬적?
- 각 요청 소요 시간
- Total 시간

---

### 2. Chrome DevTools - Performance 탭

```
1. F12 → Performance 탭
2. 🔴 Record 버튼 클릭
3. 메뉴 클릭 (화면 전환)
4. ⏹️ Stop
5. 분석:
   - Loading, Scripting, Rendering 시간
   - Long Tasks (50ms 이상)
   - Layout Shift
```

---

### 3. Lighthouse

```
F12 → Lighthouse 탭
- Performance 체크
- Analyze page load

점수:
- 90-100: Excellent
- 50-89: Needs improvement
- 0-49: Poor
```

**주요 지표:**
- FCP (First Contentful Paint): 첫 콘텐츠 표시 시간
- LCP (Largest Contentful Paint): 주요 콘텐츠 표시 시간
- TBT (Total Blocking Time): 블로킹 시간
- CLS (Cumulative Layout Shift): 레이아웃 이동

---

### 4. Next.js 빌드 분석

```bash
# 로컬에서
npm run build

# 결과:
# ┌ ○ /admin/types     1.2 kB    150 ms
# ├ ƒ /admin/policies  2.3 kB    250 ms
```

**확인:**
- 번들 크기
- 렌더링 시간
- Static vs Dynamic

---

### 5. Vercel Analytics (프로덕션)

**Vercel Dashboard:**
```
프로젝트 → Analytics 탭

확인 가능:
- Real User Monitoring (RUM)
- Core Web Vitals
- 실제 사용자 경험 데이터
```

---

## 🚀 최적화 방법

### 1. 병렬 데이터 Fetching ⭐

**현재 (느림):**
```typescript
// 순차 실행
const policies = await prisma.policy.findMany()
const states = await prisma.state.findMany()
const permissions = await prisma.permission.findMany()
```

**개선 (빠름):**
```typescript
// 병렬 실행
const [policies, states, permissions] = await Promise.all([
  prisma.policy.findMany(),
  prisma.state.findMany(),
  prisma.permission.findMany(),
])
```

**효과:**
- 3개 요청 순차: 300ms × 3 = 900ms
- 3개 요청 병렬: max(300ms) = 300ms
- **3배 빠름!** 🚀

---

### 2. 데이터베이스 쿼리 최적화

**현재 문제:**
- Vercel (미국) ↔️ Supabase (싱가포르?)
- Latency: 300-600ms

**해결 A: Connection Pooling (이미 사용 중)**
```
DATABASE_URL=...pooler.supabase.com:6543
```

**해결 B: 인덱스 확인**
```sql
-- 자주 조회하는 컬럼에 인덱스
CREATE INDEX idx_policy_active ON "Policy"("isActive");
CREATE INDEX idx_type_policy ON "Type"("policyId");
```

**해결 C: Select 최소화**
```typescript
// ❌ 모든 필드
const types = await prisma.type.findMany()

// ✅ 필요한 필드만
const types = await prisma.type.findMany({
  select: {
    id: true,
    name: true,
    // 필요한 것만
  }
})
```

---

### 3. 캐싱 전략 ⭐⭐⭐

**현재:**
```typescript
export const dynamic = 'force-dynamic'  // ❌ 캐싱 없음
export const revalidate = 0             // ❌ 항상 새로 가져옴
```

**개선:**
```typescript
// 정적 데이터 (자주 안 바뀜)
export const revalidate = 60  // 60초 캐싱

// 또는 on-demand revalidation
// 데이터 변경 시에만 캐시 무효화
```

**적용 예시:**
```typescript
// src/app/admin/types/page.tsx
export const revalidate = 60  // Types는 자주 안 바뀜

// src/app/admin/business-objects/page.tsx
export const revalidate = 10  // Objects는 자주 바뀜
```

---

### 4. Loading UI 개선

**현재:**
```typescript
<Suspense fallback={<div>로딩 중...</div>}>
```

**개선:**
```typescript
// 스켈레톤 UI
<Suspense fallback={<TableSkeleton />}>
  <DataTable />
</Suspense>
```

**효과:**
- 실제 속도는 같지만
- 체감 속도 향상 (즉각적인 피드백)

---

### 5. Prefetching (App Router)

**Next.js는 자동 Prefetch:**
```typescript
<Link href="/admin/types" prefetch={true}>
  Types
</Link>
```

**현재 문제:**
- Sidebar가 `<a>` 태그 사용 중
- Next.js Link 컴포넌트 사용 필요

**개선:**
```typescript
// ❌ 현재
<a href="/admin/types">Types</a>

// ✅ 개선
<Link href="/admin/types">Types</Link>
```

---

## 🎯 즉시 적용 가능한 최적화

### 1. 캐싱 활성화 (가장 효과적! ⭐⭐⭐)

**파일:** `src/app/admin/types/page.tsx` 등

```typescript
// ❌ 현재
export const dynamic = 'force-dynamic'
export const revalidate = 0

// ✅ 개선
export const revalidate = 60  // 60초 캐싱
// dynamic 제거 (자동 Static/ISR)
```

**적용 대상:**
- Types (거의 안 바뀜) → 60초
- Attributes (거의 안 바뀜) → 60초
- Roles/Groups (가끔 바뀜) → 30초
- Policies (자주 바뀜) → 10초
- BusinessObjects (실시간) → 5초

**효과:**
- 첫 방문: 500ms
- 캐시 적중: 50ms (10배 빠름!) 🚀

---

### 2. Sidebar Link 컴포넌트 변경

**파일:** `src/components/admin/AdminLayout.tsx`

```typescript
// ❌ 현재
<a href={item.href}>

// ✅ 개선
<Link href={item.href} prefetch={true}>
```

**효과:**
- 마우스 호버 시 자동 prefetch
- 클릭 시 즉시 전환

---

### 3. 병렬 데이터 Fetching

**파일:** Dashboard 등

```typescript
// ✅ 이미 사용 중!
const [policies, states, ...] = await Promise.all([
  prisma.policy.count(),
  prisma.state.count(),
  ...
])
```

---

## 📊 최적화 우선순위

### HIGH (즉시 효과):
1. **캐싱 활성화** (revalidate 설정) - 10배 속도 향상
2. **Sidebar Link 변경** (prefetch) - 체감 속도 2배 향상

### MEDIUM (점진적 개선):
3. **로딩 스켈레톤** - UX 개선
4. **데이터베이스 인덱스** - 쿼리 최적화

### LOW (필요 시):
5. **번들 크기 최적화**
6. **이미지 최적화**

---

## 🔧 실전 적용 예시

### Before (느림):
```typescript
// src/app/admin/types/page.tsx
export const dynamic = 'force-dynamic'
export const revalidate = 0

// 매번 500ms 소요
```

### After (빠름):
```typescript
// src/app/admin/types/page.tsx  
export const revalidate = 60

// 첫 방문: 500ms
// 이후 60초간: 50ms (캐시) ⚡
```

---

## 📈 성능 측정 도구 요약

| 도구 | 용도 | 언제 사용 |
|------|------|----------|
| **Network 탭** | 요청 분석 | ✅ 현재 사용 중 |
| **Performance 탭** | 렌더링 분석 | 화면 버벅임 |
| **Lighthouse** | 전체 점수 | 최적화 전후 비교 |
| **Vercel Analytics** | 실제 사용자 | 프로덕션 모니터링 |
| `npm run build` | 번들 크기 | 빌드 최적화 |

---

## 💡 체크리스트

**현재 상황:**
- [x] 서버 렌더링 ✅
- [x] 작은 데이터 크기 ✅
- [ ] 캐싱 ❌ (가장 큰 문제!)
- [ ] Prefetching ❌
- [x] 병렬 fetching ✅ (일부)

**개선 후:**
- [x] 캐싱 (60초)
- [x] Link prefetch
- [x] 스켈레톤 UI
- 예상 체감 속도: **5-10배 향상** 🚀

---

## 🎯 다음 단계

1. **캐싱 추가** (가장 효과적!)
2. **Link 컴포넌트 변경** (Sidebar)
3. **성능 재측정** (Network 탭)

구현해드릴까요? 😊

