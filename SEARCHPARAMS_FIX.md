# 🔧 searchParams 문제 및 해결

## ❌ 문제 원인

**Next.js 15+에서 `searchParams`를 사용하면 페이지가 자동으로 Dynamic으로 처리됩니다!**

```typescript
// ❌ 이 코드는 페이지를 Dynamic으로 만듦!
type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function MyPage({ searchParams }: Props) {
  const params = await searchParams  // ← Dynamic!
  const page = params.page
  // ...
}
```

**결과:**
- `revalidate` 설정이 무시됨 ❌
- 매번 서버 렌더링 (캐시 없음!) ❌
- 매번 다른 `_rsc` 파라미터 ❌
- 2-3초 소요 ❌

---

## 📊 영향받는 페이지

### ✅ 수정 완료:
- [x] **BusinessObjects** - 클라이언트 사이드 페이징으로 전환

### ⚠️ 아직 Dynamic (수정 필요):
- [ ] **Types** - `searchParams` 사용 중
- [ ] **Attributes** - `searchParams` 사용 중
- [ ] **Policies** - `searchParams` 사용 중
- [ ] **States** - `searchParams` 사용 중
- [ ] **Roles** - `searchParams` 사용 중
- [ ] **Groups** - `searchParams` 사용 중

### ✅ 문제 없음:
- [x] **Permissions** - `searchParams` 없음 (이미 수정됨)
- [x] **Transitions** - `searchParams` 없음 (이미 수정됨)

---

## ✅ 해결 방법

### 옵션 1: 클라이언트 사이드 페이징 (권장)

**장점:**
- ✅ 완벽한 ISR 캐싱 (revalidate 작동)
- ✅ 페이지 전환 즉시 (클라이언트 사이드)
- ✅ 검색/필터 빠름 (메모리에서 처리)

**단점:**
- ⚠️ 데이터 많으면 초기 로딩 시간 증가 (하지만 캐시 후 빠름!)

**예시:** BusinessObjects 페이지 참고

---

### 옵션 2: Dynamic Segments

**Before:**
```
/admin/policies?page=2  ← searchParams 사용 (Dynamic!)
```

**After:**
```
/admin/policies/2  ← Dynamic Segments (ISR 가능!)
```

**장점:**
- ✅ ISR 캐싱 가능
- ✅ 서버 사이드 페이징

**단점:**
- ⚠️ URL 구조 변경 필요
- ⚠️ 기존 북마크 깨짐

---

### 옵션 3: `unstable_cache` (복잡함)

```typescript
import { unstable_cache } from 'next/cache'

const getCachedData = unstable_cache(
  async (page: number) => {
    return await prisma.model.findMany({ ... })
  },
  ['cache-key'],
  { revalidate: 30 }
)

export default async function MyPage({ searchParams }: Props) {
  const params = await searchParams
  const data = await getCachedData(params.page || 1)
  // ...
}
```

**장점:**
- ✅ 기존 URL 구조 유지
- ✅ 캐싱 가능

**단점:**
- ⚠️ 복잡한 구현
- ⚠️ `unstable_` prefix (불안정)

---

## 🚀 권장 전략

### 데이터 양에 따라 선택:

| 페이지 | 예상 데이터 수 | 권장 방법 |
|--------|---------------|----------|
| Types | < 100 | ✅ 클라이언트 페이징 |
| Attributes | < 100 | ✅ 클라이언트 페이징 |
| Policies | < 50 | ✅ 클라이언트 페이징 |
| States | < 200 | ✅ 클라이언트 페이징 |
| Roles | < 50 | ✅ 클라이언트 페이징 |
| Groups | < 50 | ✅ 클라이언트 페이징 |
| BusinessObjects | 1000+ | ✅ 클라이언트 페이징 (already done) |

**결론:** 대부분의 Admin 페이지는 데이터가 많지 않으므로 **클라이언트 페이징이 최적!**

---

## 📝 구현 가이드 (클라이언트 페이징)

### 1. 서버 페이지 수정

**Before:**
```typescript
// ❌ searchParams 사용
export default async function MyPage({ searchParams }: Props) {
  const params = await searchParams
  const page = params.page || 1
  const { data, total } = await getData(page, 20)
  
  return (
    <>
      <MyList data={data} />
      <Pagination page={page} total={total} />
    </>
  )
}
```

**After:**
```typescript
// ✅ searchParams 제거
export const revalidate = 30  // 이제 작동함!

export default async function MyPage() {
  const data = await getAllData()  // 모든 데이터
  
  return <MyList data={data} />  // 클라이언트에서 페이징
}
```

---

### 2. 클라이언트 컴포넌트 수정

```typescript
'use client'

import { useState, useMemo } from 'react'

export function MyList({ data }: { data: Item[] }) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // 페이징 처리 (클라이언트)
  const { paginatedData, totalPages } = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    const paginated = data.slice(start, end)
    const total = Math.ceil(data.length / pageSize)
    return { paginatedData: paginated, totalPages: total }
  }, [data, currentPage, pageSize])

  return (
    <>
      <Table>
        {paginatedData.map(item => (
          <TableRow key={item.id}>
            {/* ... */}
          </TableRow>
        ))}
      </Table>

      {/* 페이징 UI */}
      <div className="flex justify-between">
        <Button onClick={() => setCurrentPage(p => p - 1)}>이전</Button>
        <span>{currentPage} / {totalPages}</span>
        <Button onClick={() => setCurrentPage(p => p + 1)}>다음</Button>
      </div>
    </>
  )
}
```

---

## 🎯 예상 성능 개선

### Before (searchParams + Dynamic):
```
Types 페이지:
- 첫 방문: 500ms
- 재방문: 500ms (캐시 없음!)
- 매번 다른 _rsc 파라미터
```

### After (클라이언트 페이징 + ISR):
```
Types 페이지:
- 첫 방문: 500ms
- 재방문 (60초 내): 50ms ⚡
- 동일한 _rsc 파라미터 (캐시!)
- 페이지 전환: 즉시 (클라이언트)

10배 빠름! 🚀
```

---

## 🔍 디버깅 팁

### Vercel 빌드 로그 확인:

```
Route (app)                    Size     First Load JS
┌ ○ /admin/types              xxx kB        xxx kB    ✅ ISR!
├ ● /admin/policies            xxx kB        xxx kB    ❌ Dynamic!
└ ○ /admin/business-objects    xxx kB        xxx kB    ✅ ISR!

기호 설명:
○  (Static)   - ISR 캐싱 가능 ✅
●  (Dynamic)  - 캐시 없음 ❌
```

### Network 탭 확인:

```
✅ ISR 캐싱 작동:
- policies?_rsc=abc123: 500ms
- policies?_rsc=abc123: 50ms (같은 파라미터!)

❌ Dynamic (캐시 없음):
- policies?_rsc=abc123: 500ms
- policies?_rsc=xyz789: 500ms (다른 파라미터!)
```

---

## ✅ 체크리스트

### 수정 완료:
- [x] BusinessObjects - 클라이언트 페이징 적용

### 수정 필요:
- [ ] Types
- [ ] Attributes
- [ ] Policies
- [ ] States
- [ ] Roles
- [ ] Groups

**다음 단계:** 나머지 6개 페이지도 클라이언트 페이징으로 전환?

---

## 📚 참고 자료

- [Next.js 15 Dynamic Rendering](https://nextjs.org/docs/app/building-your-application/rendering/server-components#dynamic-rendering)
- [searchParams and Dynamic Rendering](https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional)

**핵심:** `searchParams`를 사용하면 **무조건 Dynamic!**

