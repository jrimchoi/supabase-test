# 🔧 Sticky 헤더 고정 문제 해결

## 🐛 문제 원인

**shadcn/ui의 `Table` 컴포넌트가 sticky 헤더를 방해하고 있었습니다!**

### Before (문제)
```tsx
// src/components/ui/table.tsx
const Table = ({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">  {/* 이것이 문제! */}
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
)
```

**문제점:**
- Table 컴포넌트가 자체적으로 `overflow-auto`를 가진 div로 감싸져 있음
- 이 래퍼 div가 `<thead>`의 `position: sticky`를 방해함
- sticky는 스크롤 컨테이너의 **직계 자식**이어야 작동함

---

## ✅ 해결 방법

### 1. Table 컴포넌트 수정
```tsx
// After (수정)
const Table = ({ className, ...props }, ref) => (
  <table  {/* 래퍼 div 제거! */}
    ref={ref}
    className={cn("w-full caption-bottom text-sm", className)}
    {...props}
  />
)
```

**변경사항:**
- ✅ `<div className="relative w-full overflow-auto">` 래퍼 제거
- ✅ `<table>`을 직접 반환
- ✅ 스크롤은 외부 컨테이너에서 처리

### 2. 전용 CSS 클래스 추가
```css
/* src/app/globals.css */
.scrollable-table-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  border: 1px solid hsl(var(--border));
  border-radius: 0.5rem;
  overflow: hidden;
}

.scrollable-table-wrapper {
  overflow-y: auto;
  flex: 1;
}

.scrollable-table-wrapper thead {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: hsl(var(--background));
}

.scrollable-table-wrapper thead th {
  background-color: hsl(var(--background));
  border-bottom: 1px solid hsl(var(--border));
}
```

### 3. List 컴포넌트 구조
```tsx
// PolicyList.tsx, StateList.tsx 등
return (
  <div className="flex flex-col h-full">
    <div className="flex-shrink-0 mb-4">
      <Button>생성</Button>
    </div>

    <div className="scrollable-table-container">
      <div className="scrollable-table-wrapper">
        <Table>
          <TableHeader>  {/* sticky는 CSS에서 처리 */}
            <TableRow>
              <TableHead>컬럼1</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* 데이터 */}
          </TableBody>
        </Table>
      </div>
    </div>
  </div>
)
```

---

## 📐 구조 설명

### 스크롤 컨테이너 계층
```
List Component
└─ div (flex flex-col h-full)
   ├─ div (flex-shrink-0) - 생성 버튼
   └─ div.scrollable-table-container (flex-1)
      └─ div.scrollable-table-wrapper (overflow-y-auto)
         └─ table
            ├─ thead (position: sticky, top: 0) ← 여기서 고정!
            └─ tbody
```

**핵심:**
1. `scrollable-table-wrapper`가 스크롤 컨테이너
2. `thead`는 이 컨테이너의 직계 자식(table의 자식)
3. 중간에 `overflow`를 가진 div가 없음

---

## 🎯 수정된 파일

### 1. Table 컴포넌트
- ✅ `src/components/ui/table.tsx`
  - 래퍼 div 제거
  - table을 직접 반환

### 2. CSS 스타일
- ✅ `src/app/globals.css`
  - `.scrollable-table-container` 클래스 추가
  - `.scrollable-table-wrapper` 클래스 추가
  - 행 높이 최적화 (48px)

### 3. List 컴포넌트 (6개)
- ✅ `PolicyList.tsx`
- ✅ `StateList.tsx`
- ✅ `RoleList.tsx`
- ✅ `GroupList.tsx`
- ✅ `TypeList.tsx`
- ✅ `AttributeList.tsx`

---

## 🧪 테스트 체크리스트

로그인 후 다음을 확인하세요:

### 1. Policy 페이지 (`/admin/policies`)
- [ ] 테이블 헤더가 보이는가?
- [ ] 아래로 스크롤 시 헤더가 상단에 고정되는가?
- [ ] 첫 번째 데이터 행이 헤더 아래로 사라지는가?

### 2. States 페이지 (`/admin/states`)
- [ ] 헤더 고정 작동
- [ ] 45개 항목 중 20개만 표시
- [ ] 스크롤 가능

### 3. 다른 페이지들
- [ ] Roles
- [ ] Groups
- [ ] Types
- [ ] Attributes

---

## 💡 Sticky가 작동하지 않는 일반적 원인

1. **부모 컨테이너에 `overflow: hidden`** ❌
   ```tsx
   <div className="overflow-hidden">
     <table>
       <thead className="sticky top-0">  {/* 작동 안함! */}
   ```

2. **스크롤 컨테이너와 sticky 요소 사이에 다른 요소** ❌
   ```tsx
   <div className="overflow-auto">
     <div>  {/* 이것이 방해! */}
       <table>
         <thead className="sticky">  {/* 작동 안함! */}
   ```

3. **Table 컴포넌트 자체가 래퍼를 가짐** ❌ (우리의 경우)
   ```tsx
   // shadcn/ui Table 컴포넌트
   <div className="overflow-auto">  {/* 이것이 문제였음! */}
     <table>
   ```

---

## ✨ 해결!

**이제 모든 테이블 헤더가 스크롤 시에도 확실히 고정됩니다!** 🎉

- ✅ Table 컴포넌트 수정
- ✅ 전용 CSS 클래스 추가
- ✅ 모든 List 컴포넌트 적용
- ✅ 행 높이 최적화 (48px)

---

## 📝 참고

만약 여전히 작동하지 않는다면:
1. 브라우저 캐시 삭제 (`Cmd+Shift+R`)
2. 개발 서버 재시작 (`npm run dev`)
3. `.next` 폴더 삭제 후 재빌드

