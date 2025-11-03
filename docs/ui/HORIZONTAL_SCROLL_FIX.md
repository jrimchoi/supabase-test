# 🔄 테이블 가로 스크롤 추가

## ✅ 구현 완료

**긴 텍스트가 잘리지 않고 가로 스크롤로 볼 수 있도록 수정했습니다!**

---

## 🔧 핵심 변경사항

### 1. CSS 수정 (`globals.css`)

```css
/* Before: table-layout: fixed - 고정 너비, 텍스트 잘림 */
.table-header-wrapper table {
  width: 100%;
  table-layout: fixed;
}

/* After: table-layout: auto - 내용에 맞게 자동 조정 */
.table-header-wrapper {
  overflow-x: auto;  /* 가로 스크롤 추가 */
}

.table-header-wrapper table {
  min-width: 100%;
  table-layout: auto;  /* 내용 길이에 맞게 */
}

.scrollable-table-wrapper {
  overflow-x: auto;  /* 가로 스크롤 추가 */
  overflow-y: auto;  /* 세로 스크롤 유지 */
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
```

### 2. ScrollableTable 컴포넌트 추가

**파일**: `src/components/ui/scrollable-table.tsx`

```tsx
'use client'

export function ScrollableTable({ header, children }) {
  const headerRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 바디 스크롤 시 헤더 가로 스크롤 동기화
    const handleBodyScroll = () => {
      headerRef.current.scrollLeft = bodyRef.current.scrollLeft
    }

    bodyRef.current.addEventListener('scroll', handleBodyScroll)
    return () => bodyRef.current.removeEventListener('scroll', handleBodyScroll)
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

### 3. List 컴포넌트 사용법

```tsx
import { ScrollableTable } from '@/components/ui/scrollable-table'

export function PolicyList({ initialPolicies }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 mb-2">
        <Button>새 Policy 생성</Button>
      </div>

      <ScrollableTable
        header={
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>버전</TableHead>
                {/* ... */}
              </TableRow>
            </TableHeader>
          </Table>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이름</TableHead>
              <TableHead>버전</TableHead>
              {/* 헤더와 동일한 구조 */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* 데이터 */}
          </TableBody>
        </Table>
      </ScrollableTable>
    </div>
  )
}
```

---

## 🎯 주요 기능

### 1. **가로 스크롤**
```
테이블 너비 > 화면 너비
  ↓
자동으로 가로 스크롤바 생성
```

### 2. **스크롤 동기화**
```
바디 영역 가로 스크롤
  ↓
헤더도 동일하게 스크롤
  ↓
헤더와 바디 항상 정렬됨
```

### 3. **텍스트 줄바꿈 방지**
```css
white-space: nowrap;
```
- 긴 텍스트가 줄바꿈되지 않음
- 가로 스크롤로 전체 내용 확인 가능

---

## 📊 작동 방식

### Before (텍스트 잘림)
```
┌───────────────────────┐
│ Test_문서_결재_정책... │ ← 잘림!
│ Test_Invoice_Poli...  │
└───────────────────────┘
```

### After (가로 스크롤)
```
┌───────────────────────────────────────────┐
│ Test_문서_결재_정책_1762010094742 v1   ┃ │ ← 전체 표시
│ Test_Invoice_Policy_1762010714962 v1   ┃ │
└───────────────────────────────────────────┘
  ← 가로 스크롤 →
```

---

## 🎨 스크롤바

### 세로 스크롤바
- 위치: 바디 영역 오른쪽
- 크기: 10px

### 가로 스크롤바
- 위치: 테이블 하단
- 크기: 10px
- 헤더와 바디 동기화됨

---

## ✅ 적용 완료

- ✅ **PolicyList** - ScrollableTable 적용

---

## 🔄 나머지 페이지 업데이트 방법

다른 List 컴포넌트도 동일하게 수정:

1. **Import 추가**
   ```tsx
   import { ScrollableTable } from '@/components/ui/scrollable-table'
   ```

2. **구조 변경**
   ```tsx
   // Before
   <div className="scrollable-table-container">
     <div className="table-header-wrapper">...</div>
     <div className="scrollable-table-wrapper">...</div>
   </div>

   // After
   <ScrollableTable
     header={<Table>헤더</Table>}
   >
     <Table>바디</Table>
   </ScrollableTable>
   ```

---

## 🧪 테스트 방법

1. **Policy 페이지 접속**
   ```
   http://localhost:3000/admin/policies
   ```

2. **가로 스크롤 확인**
   - 테이블 하단에 **가로 스크롤바**가 보이는지 확인
   - 가로 스크롤 시 **긴 이름이 잘리지 않고** 전체 표시되는지 확인
   - 가로 스크롤 시 **헤더도 함께 스크롤**되는지 확인

3. **세로 스크롤 확인**
   - 오른쪽에 **세로 스크롤바** 있는지 확인
   - 세로 스크롤 시 **헤더는 고정**되는지 확인

---

## 📋 적용 필요한 컴포넌트

- ✅ PolicyList (완료)
- ⏳ StateList
- ⏳ RoleList
- ⏳ GroupList
- ⏳ TypeList
- ⏳ AttributeList

---

**이제 PolicyList에서 긴 텍스트가 가로 스크롤로 전체 표시됩니다!** 🎉

브라우저에서 확인해보시고, 나머지 페이지도 동일하게 적용할까요?

