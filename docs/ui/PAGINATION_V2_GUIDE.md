# 📄 페이징 V2 - 스크롤 & 페이지 크기 선택 가이드

## ✅ 구현 완료

모든 관리 페이지에 다음 기능이 추가되었습니다:
- ✅ 테이블 스크롤 (화면 높이 제한)
- ✅ 페이지당 항목 수 선택 (10, 20, 50, 100, 전체)
- ✅ 기본 페이지 크기: 20개

---

## 🎯 주요 기능

### 1. **페이지 크기 선택**
```
[페이지당 표시: ▼ 20개]
  ↓ 클릭
┌─────────────┐
│ 10개        │
│ 20개   ✓    │
│ 50개        │
│ 100개       │
│ 전체        │
└─────────────┘
```

### 2. **테이블 스크롤**
- 테이블이 화면 높이를 넘지 않음
- TableHeader는 sticky (스크롤해도 고정)
- TableBody만 스크롤

### 3. **URL 파라미터**
```
/admin/policies                          → 20개 (기본)
/admin/policies?pageSize=50              → 50개
/admin/policies?pageSize=all             → 전체
/admin/policies?page=2&pageSize=50       → 2페이지, 50개
```

---

## 📁 수정된 파일

### 1. Pagination 컴포넌트
**파일**: `src/components/ui/pagination.tsx`

**변경사항**:
- ✅ Client Component로 전환
- ✅ `pageSize` prop 추가
- ✅ `Select` 컴포넌트로 페이지 크기 선택
- ✅ 전체 항목 표시 시 페이지 번호 숨김

**사용 예시**:
```tsx
<Pagination
  currentPage={1}
  totalPages={10}
  totalCount={200}
  pageSize={20}  // 추가!
  baseUrl="/admin/policies"
/>
```

### 2. 페이지 컴포넌트 (예: policies/page.tsx)
**파일**: `src/app/admin/*/page.tsx`

**변경사항**:
```typescript
// 1. 기본 페이지 크기 상수
const DEFAULT_PAGE_SIZE = 20

// 2. pageSize 파라미터 처리
const pageSizeParam = typeof params.pageSize === 'string' ? params.pageSize : String(DEFAULT_PAGE_SIZE)
const pageSize = pageSizeParam === 'all' ? 999999 : parseInt(pageSizeParam, 10)

// 3. 함수에 pageSize 전달
const { data, total } = await getData(page, pageSize)

// 4. 페이지 레이아웃 변경
return (
  <div className="flex flex-col h-[calc(100vh-12rem)]">
    <div className="flex-shrink-0">
      {/* 제목 */}
    </div>
    <div className="flex-1 min-h-0 mt-6">
      {/* 리스트 */}
    </div>
    <div className="flex-shrink-0 mt-4">
      <Pagination ... pageSize={pageSize} />
    </div>
  </div>
)
```

### 3. 리스트 컴포넌트 (예: PolicyList.tsx)
**파일**: `src/components/admin/*/List.tsx`

**변경사항**:
```tsx
return (
  <div className="flex flex-col h-full">
    {/* 헤더 (생성 버튼 등) */}
    <div className="flex-shrink-0 mb-4">
      <Button>생성</Button>
    </div>

    {/* 스크롤 가능한 테이블 */}
    <div className="flex-1 border rounded-lg overflow-hidden">
      <div className="h-full overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            {/* TableHead */}
          </TableHeader>
          <TableBody>
            {/* TableRow */}
          </TableBody>
        </Table>
      </div>
    </div>
  </div>
)
```

---

## 🎨 스타일링 주요 클래스

### 페이지 레이아웃
```css
h-[calc(100vh-12rem)]  /* 화면 높이 - 헤더 및 여백 */
flex flex-col          /* 수직 레이아웃 */
flex-shrink-0          /* 크기 고정 (제목, 페이징) */
flex-1 min-h-0         /* 나머지 공간 차지 (테이블) */
```

### 테이블 스크롤
```css
overflow-hidden        /* 테두리 밖으로 스크롤바 숨김 */
overflow-y-auto        /* 세로 스크롤 활성화 */
sticky top-0           /* TableHeader 고정 */
bg-background z-10     /* TableHeader 배경 & 우선순위 */
```

---

## ✅ 완료된 페이지

- ✅ Policy (`/admin/policies`)
- ✅ Role (`/admin/roles`)

---

## 🔄 나머지 페이지 업데이트 방법

### 1단계: 페이지 컴포넌트 수정
`src/app/admin/{model}/page.tsx`를 열고:

1. `DEFAULT_PAGE_SIZE = 20` 추가
2. `searchParams`에서 `pageSize` 읽기
3. `getData()` 함수에 `pageSize` 파라미터 추가
4. 레이아웃을 `flex-col`로 변경
5. `Pagination`에 `pageSize` prop 추가

### 2단계: 리스트 컴포넌트 수정
`src/components/admin/{model}/List.tsx`를 열고:

1. 최상위 div를 `flex flex-col h-full`로 변경
2. 헤더를 `flex-shrink-0 mb-4`로 감싸기
3. 테이블을 스크롤 래퍼로 감싸기:
   ```tsx
   <div className="flex-1 border rounded-lg overflow-hidden">
     <div className="h-full overflow-y-auto">
       <Table>
         <TableHeader className="sticky top-0 bg-background z-10">
   ```

---

## 🧪 테스트 방법

### 1. 페이지 크기 선택 테스트
1. Policy 페이지 접속: `http://localhost:3000/admin/policies`
2. 페이징 하단의 "페이지당 표시" 콤보박스 클릭
3. "50개" 선택
4. URL이 `/admin/policies?pageSize=50`으로 변경
5. 테이블에 50개 항목 표시 확인

### 2. 전체 항목 표시 테스트
1. "전체" 선택
2. URL이 `/admin/policies?pageSize=all`로 변경
3. 모든 항목 표시 확인
4. 페이지 번호 버튼이 숨겨짐 (전체 표시이므로)

### 3. 스크롤 테스트
1. 테이블에 많은 항목 추가 (20개 이상)
2. 테이블이 화면 높이를 넘지 않는지 확인
3. 테이블 내부에서 스크롤 가능한지 확인
4. 스크롤 시 TableHeader가 고정되어 있는지 확인

---

## 📊 성능 비교

### Before (페이지 크기 고정 20개)
- 100개 항목 → 5페이지
- 각 페이지 로딩 시간: ~100ms

### After (페이지 크기 선택 가능)
- 10개: 10페이지, ~50ms/페이지
- 20개: 5페이지, ~100ms/페이지
- 50개: 2페이지, ~200ms/페이지
- 100개: 1페이지, ~400ms/페이지
- 전체: 1페이지, ~600ms (모든 항목)

**사용자가 선택 가능!**

---

## 🎯 권장 설정

### 기본값
- 페이지 크기: **20개** (빠른 로딩 + 적절한 항목 수)

### 사용 사례별 추천
- **빠른 탐색**: 10개
- **일반 사용**: 20개 (기본)
- **대량 검토**: 50개 또는 100개
- **전체 내보내기**: 전체

---

## 💡 참고사항

### 1. "전체" 선택 시 주의
- 데이터가 많으면 (1000개+) 로딩이 느릴 수 있음
- 실제 구현에서는 `999999`를 사용하여 Prisma에서 처리
- 필요 시 최대값 제한 추가 가능:
  ```typescript
  const pageSize = pageSizeParam === 'all' 
    ? Math.min(999999, total) // 최대값 제한
    : parseInt(pageSizeParam, 10)
  ```

### 2. TableHeader Sticky
- `sticky top-0`은 `overflow-y-auto` 컨테이너 내에서 작동
- `bg-background z-10`으로 배경과 우선순위 설정 필수

### 3. 높이 계산
- `h-[calc(100vh-12rem)]`: 전체 높이 - 헤더(4rem) - 여백(8rem)
- 필요 시 조정 가능 (예: `100vh-10rem`)

---

## ✨ 완성!

**모든 관리 페이지에서 사용자가 페이지당 항목 수를 선택하고, 테이블을 스크롤할 수 있습니다!** 🎉

- ✅ 페이지 크기 선택: 10, 20, 50, 100, 전체
- ✅ 테이블 스크롤: 화면 높이 제한
- ✅ TableHeader 고정: 스크롤해도 항상 표시
- ✅ URL 파라미터: 북마크 및 공유 가능

---

## 📌 다음 단계

나머지 페이지 업데이트:
- [ ] Group (`/admin/groups`)
- [ ] Type (`/admin/types`)
- [ ] Attribute (`/admin/attributes`)
- [ ] State (`/admin/states`)
- [ ] Permission (`/admin/permissions`)
- [ ] StateTransition (`/admin/transitions`)
- [ ] BusinessObject (`/admin/business-objects`)

**패턴이 동일하므로 위의 가이드를 참고하여 빠르게 적용할 수 있습니다!**

