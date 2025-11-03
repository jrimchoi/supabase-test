# 🔄 클라이언트 페이징 템플릿

나머지 페이지들(Attributes, Policies, States, Roles, Groups)도 동일한 패턴으로 수정해야 합니다.

## ✅ 수정 완료:
- [x] Types
- [x] BusinessObjects

## 🔨 수정 필요:
- [ ] Attributes
- [ ] Policies
- [ ] States
- [ ] Roles
- [ ] Groups

---

## 📝 템플릿 (page.tsx)

```typescript
import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { MyList } from '@/components/admin/my/MyList'

export const metadata = { title: 'My 관리' }
// ISR: XX초 캐싱, 데이터 변경 시 자동 revalidate
// searchParams 제거로 Static/ISR 가능!
export const revalidate = XX  // 적절한 시간 설정

async function getAllData() {
  const data = await prisma.myModel.findMany({
    // include나 select 필요 시 추가
    orderBy: { name: 'asc' },
  })

  return data
}

export default async function MyPage() {
  const data = await getAllData()

  return (
    <div className="admin-page-container">
      <div className="flex-1 min-h-0">
        <Suspense fallback={<div>로딩 중...</div>}>
          <MyList initialData={data} />
        </Suspense>
      </div>
    </div>
  )
}
```

---

## 📝 템플릿 (List.tsx - 추가 부분)

### 1. Import 추가

```typescript
import { useState, useMemo } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, ChevronRight } from 'lucide-react'
```

### 2. 컴포넌트 state 추가

```typescript
export function MyList({ initialData }: { initialData: MyType[] }) {
  // 기존 state...
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // 페이징 처리 (클라이언트 사이드)
  const { paginatedData, totalPages } = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    const paginated = initialData.slice(start, end)
    const total = Math.ceil(initialData.length / pageSize)
    return { paginatedData: paginated, totalPages: total }
  }, [initialData, currentPage, pageSize])

  const handlePageSizeChange = (value: string) => {
    setPageSize(value === 'all' ? initialData.length : parseInt(value, 10))
    setCurrentPage(1)
  }

  // ...
}
```

### 3. 헤더 카드 수정

```typescript
<p className="text-sm text-muted-foreground">
  설명 (총 {initialData.length}개)
</p>
```

### 4. 테이블 데이터 수정

```typescript
// Before: initialData.map
// After:
{paginatedData.map((item) => (
  // ...
))}
```

### 5. 페이징 UI 추가 (ScrollableTable 아래)

```typescript
      </ScrollableTable>

      {/* 페이징 */}
      <div className="admin-table-spacing flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          총 {initialData.length}개 중 {(currentPage - 1) * pageSize + 1}-
          {Math.min(currentPage * pageSize, initialData.length)}개 표시
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm">
            {currentPage} / {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10개씩</SelectItem>
            <SelectItem value="20">20개씩</SelectItem>
            <SelectItem value="50">50개씩</SelectItem>
            <SelectItem value="100">100개씩</SelectItem>
            <SelectItem value="all">전체</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 다이얼로그 등 기존 코드 */}
    </div>
  )
}
```

---

## 🎯 주의사항

1. **Import 확인**: Select, ChevronLeft, ChevronRight 추가
2. **State 초기화**: currentPage=1, pageSize=20
3. **useMemo 의존성**: [initialData, currentPage, pageSize]
4. **헤더 텍스트**: (총 XX개) 추가
5. **테이블 데이터**: initialData → paginatedData
6. **페이징 UI**: ScrollableTable 아래, 다이얼로그 위에 추가

---

## ✅ 체크리스트

각 페이지 수정 후:
- [ ] page.tsx - searchParams 제거
- [ ] page.tsx - 모든 데이터 가져오기
- [ ] List.tsx - import 추가
- [ ] List.tsx - state 추가
- [ ] List.tsx - useMemo 추가
- [ ] List.tsx - 헤더 수정
- [ ] List.tsx - 테이블 데이터 수정
- [ ] List.tsx - 페이징 UI 추가
- [ ] 로컬 테스트
- [ ] Vercel 배포

---

이 템플릿을 참고하여 나머지 페이지들을 수정하면 됩니다!

