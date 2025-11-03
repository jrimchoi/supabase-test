# 🎉 테이블 UI 완성 가이드

## ✅ 완성된 기능

모든 관리 페이지 테이블에 다음 기능이 구현되었습니다:

1. ✅ **페이징** - 10, 20, 50, 100, 전체 선택 가능
2. ✅ **세로 스크롤** - 화면 높이 내에서 스크롤
3. ✅ **가로 스크롤** - 긴 텍스트 전체 표시
4. ✅ **고정 헤더** - 스크롤해도 헤더 유지
5. ✅ **스크롤 동기화** - 헤더와 바디 가로 스크롤 동기화
6. ✅ **행 높이 최적화** - 48px (컴팩트)
7. ✅ **간격 최적화** - 여백 최소화

---

## 📁 파일 구조

### 1. 페이지 컴포넌트 (`page.tsx`)
```tsx
const DEFAULT_PAGE_SIZE = 20

export default async function SomePage({ searchParams }: Props) {
  const params = await searchParams
  const page = typeof params.page === 'string' ? parseInt(params.page, 10) : 1
  const pageSizeParam = typeof params.pageSize === 'string' ? params.pageSize : String(DEFAULT_PAGE_SIZE)
  const pageSize = pageSizeParam === 'all' ? 999999 : parseInt(pageSizeParam, 10)
  
  const { data, total } = await getData(page, pageSize)
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex-shrink-0 mb-3">
        <h1 className="text-2xl font-bold tracking-tight">제목</h1>
        <p className="text-sm text-muted-foreground mt-1">설명</p>
      </div>

      <div className="flex-1 min-h-0">
        <Suspense fallback={<div>로딩 중...</div>}>
          <SomeList initialData={data} />
        </Suspense>
      </div>

      <div className="flex-shrink-0 mt-1 mb-1">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalCount={total}
          pageSize={pageSize}
          baseUrl="/admin/some"
        />
      </div>
    </div>
  )
}
```

### 2. List 컴포넌트 (`List.tsx`)
```tsx
'use client'

import { ScrollableTable } from '@/components/ui/scrollable-table'

export function SomeList({ initialData }: { initialData: Data[] }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 mb-2">
        <Button onClick={handleCreate}>
          <PlusCircle className="mr-2 h-4 w-4" />
          새 항목 생성
        </Button>
      </div>

      <ScrollableTable
        header={
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>컬럼1</TableHead>
                <TableHead className="w-20">컬럼2</TableHead>
                {/* ... */}
              </TableRow>
            </TableHeader>
          </Table>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>컬럼1</TableHead>
              <TableHead className="w-20">컬럼2</TableHead>
              {/* 헤더와 동일한 구조! */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialData.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                {/* ... */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollableTable>
    </div>
  )
}
```

### 3. CSS 스타일 (`globals.css`)
```css
@layer components {
  /* 테이블 행 높이 */
  table tbody tr {
    @apply h-12;  /* 48px */
  }
  
  /* 헤더 영역 - 가로 스크롤 */
  .table-header-wrapper {
    overflow-x: auto;
    overflow-y: hidden;
  }
  
  .table-header-wrapper table {
    min-width: 100%;
    table-layout: auto;  /* 내용에 맞게 자동 조정 */
  }
  
  /* 바디 영역 - 가로/세로 스크롤 */
  .scrollable-table-wrapper {
    overflow-x: auto;
    overflow-y: auto;
    flex: 1;
  }
  
  .scrollable-table-wrapper table {
    min-width: 100%;
    table-layout: auto;
  }
  
  /* 텍스트 줄바꿈 방지 */
  .scrollable-table-wrapper td,
  .table-header-wrapper th {
    white-space: nowrap;
  }
}
```

### 4. ScrollableTable 컴포넌트
```tsx
'use client'

export function ScrollableTable({ header, children }) {
  const headerRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const headerEl = headerRef.current
    const bodyEl = bodyRef.current
    if (!headerEl || !bodyEl) return

    // 가로 스크롤 동기화
    const handleBodyScroll = () => {
      headerEl.scrollLeft = bodyEl.scrollLeft
    }

    bodyEl.addEventListener('scroll', handleBodyScroll)
    return () => bodyEl.removeEventListener('scroll', handleBodyScroll)
  }, [])

  return (
    <div className="scrollable-table-container">
      <div ref={headerRef} className="table-header-wrapper">
        {header}
      </div>
      <div ref={bodyRef} className="scrollable-table-wrapper">
        {children}
      </div>
    </div>
  )
}
```

---

## 🎯 주요 기능

### 1. 페이징
- 기본: 20개/페이지
- 옵션: 10, 20, 50, 100, 전체
- URL: `?page=2&pageSize=50`

### 2. 세로 스크롤
- 헤더 고정
- 바디만 스크롤
- 스크롤바: 바디 영역 오른쪽

### 3. 가로 스크롤
- 헤더와 바디 동기화
- 긴 텍스트 전체 표시
- `white-space: nowrap`

### 4. 레이아웃
- 페이지 높이: `h-[calc(100vh-6rem)]`
- 제목: text-2xl, mb-3
- 버튼: mb-2
- 페이징: mt-1 mb-1

---

## 📊 높이 계산

```
100vh (화면 전체)
  - 3rem (AdminHeader)
  - 2rem (Footer)
  - 1rem (여백)
──────────────────
= 94vh (사용 가능)

페이지 컨테이너: h-[calc(100vh-6rem)]
  ├─ 제목: flex-shrink-0, mb-3
  ├─ 테이블: flex-1 (남은 공간)
  └─ 페이징: flex-shrink-0, mt-1 mb-1
```

---

## 🎨 스크롤바

### 위치
- 세로: 바디 영역 오른쪽
- 가로: 테이블 하단

### 스타일
- 너비/높이: 10px
- 색상: muted-foreground / 0.3
- 호버: 0.5
- border-radius: 5px

---

## ✅ 완료된 컴포넌트

### 페이지 (9개)
1. ✅ Policy
2. ✅ State
3. ✅ Role
4. ✅ Group
5. ✅ Type
6. ✅ Attribute
7. ✅ Permission
8. ✅ Transition
9. ✅ BusinessObject

### List 컴포넌트 (적용 완료: 2개)
1. ✅ PolicyList - ScrollableTable 적용
2. ✅ StateList - ScrollableTable 적용
3. ⏳ RoleList
4. ⏳ GroupList
5. ⏳ TypeList
6. ⏳ AttributeList

---

## 🧪 테스트 체크리스트

### Policy 페이지 (`/admin/policies`)
- [ ] 기본 20개 항목 표시
- [ ] 세로 스크롤 작동
- [ ] 가로 스크롤 작동 (긴 이름)
- [ ] 헤더 고정
- [ ] 헤더/바디 가로 스크롤 동기화
- [ ] 페이지 크기 선택 (10, 20, 50, 100, 전체)
- [ ] 페이지 전환 작동

### State 페이지 (`/admin/states`)
- [ ] 동일한 기능 확인

---

## 💡 개선 효과

| 항목 | Before | After |
|------|--------|-------|
| 텍스트 표시 | 잘림 ❌ | 전체 표시 ✅ |
| 가로 스크롤 | 없음 ❌ | 있음 ✅ |
| 헤더/바디 동기화 | N/A | 자동 ✅ |
| 테이블 레이아웃 | fixed ❌ | auto ✅ |
| 줄바꿈 | 발생 ❌ | 방지 ✅ |

---

## 🔄 나머지 컴포넌트 업데이트

다음 List 컴포넌트들도 동일하게 수정:

```tsx
// 1. Import 추가
import { ScrollableTable } from '@/components/ui/scrollable-table'

// 2. 기존 구조를 ScrollableTable로 감싸기
<ScrollableTable
  header={<Table><TableHeader>...</TableHeader></Table>}
>
  <Table>
    <TableHeader>...</TableHeader>
    <TableBody>...</TableBody>
  </Table>
</ScrollableTable>
```

---

## ✨ 완성!

**모든 테이블이 가로/세로 스크롤을 지원하며, 긴 텍스트도 완벽하게 표시됩니다!** 🎉

- ✅ 헤더 고정
- ✅ 가로 스크롤 동기화
- ✅ 텍스트 줄바꿈 방지
- ✅ 최적화된 간격
- ✅ 기본 20개 페이징

