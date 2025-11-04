# 🎯 스크롤바 위치 최적화 - 헤더 제외

## ✅ 구현 완료

**스크롤바가 테이블 바디 영역에만 표시되고, 헤더 영역에는 표시되지 않도록 수정했습니다!**

---

## 🔧 해결 방법

### 핵심 아이디어
**헤더와 바디를 별도의 테이블로 분리**

```
┌─────────────────────────────────────┐
│ 헤더 테이블 (고정)                  │ ← 스크롤바 없음
├─────────────────────────────────────┤
│ 바디 테이블 (스크롤)           ┃   │ ← 스크롤바 여기만!
│ Row 1                          ┃   │
│ Row 2                          ┃   │
│ ...                            ┃   │
└─────────────────────────────────────┘
```

---

## 📁 구조 변경

### 1. CSS 클래스 추가 (`globals.css`)

```css
/* 헤더 영역 (고정, 스크롤바 없음) */
.table-header-wrapper {
  flex-shrink: 0;
  overflow: hidden;  /* 스크롤바 차단 */
}

.table-header-wrapper table {
  width: 100%;
  table-layout: fixed;  /* 컬럼 너비 고정 */
}

/* 바디 영역 (스크롤) */
.scrollable-table-wrapper {
  overflow-y: auto;  /* 여기만 스크롤! */
  flex: 1;
}

.scrollable-table-wrapper table {
  width: 100%;
  table-layout: fixed;  /* 헤더와 동일한 너비 */
}

/* 바디 테이블의 헤더는 숨김 (컬럼 정렬 유지용) */
.scrollable-table-wrapper thead {
  visibility: hidden;
  height: 0;
}
```

### 2. List 컴포넌트 구조

```tsx
<div className="scrollable-table-container">
  {/* 1. 헤더 테이블 (고정) */}
  <div className="table-header-wrapper">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>이름</TableHead>
          <TableHead className="w-20">버전</TableHead>
          {/* ... */}
        </TableRow>
      </TableHeader>
    </Table>
  </div>

  {/* 2. 바디 테이블 (스크롤) */}
  <div className="scrollable-table-wrapper">
    <Table>
      <TableHeader>
        {/* 동일한 헤더 구조 (숨김 처리) */}
        <TableRow>
          <TableHead>이름</TableHead>
          <TableHead className="w-20">버전</TableHead>
          {/* ... */}
        </TableRow>
      </TableHeader>
      <TableBody>
        {/* 데이터 */}
      </TableBody>
    </Table>
  </div>
</div>
```

---

## 🎨 작동 방식

### 헤더 테이블
- ✅ `overflow: hidden` - 스크롤바 없음
- ✅ `flex-shrink: 0` - 고정된 높이
- ✅ `table-layout: fixed` - 컬럼 너비 고정

### 바디 테이블
- ✅ `overflow-y: auto` - 세로 스크롤
- ✅ `flex: 1` - 남은 공간 차지
- ✅ `table-layout: fixed` - 헤더와 동일한 컬럼 너비
- ✅ `thead` 숨김 - 컬럼 정렬 유지용

### 컬럼 정렬
**두 테이블이 동일한 헤더 구조를 가져야 합니다:**
- 헤더 테이블: 실제 표시용
- 바디 테이블: 숨겨진 헤더 (컬럼 너비 맞추기용)

---

## ✅ 수정된 컴포넌트 (6개)

1. ✅ **PolicyList**
2. ✅ **StateList**
3. ✅ **RoleList**
4. ✅ **GroupList**
5. ✅ **TypeList**
6. ✅ **AttributeList**

---

## 📊 개선 효과

### Before
```
┌─────────────────────────────────┐
│ 헤더                        ┃  │ ← 스크롤바가 여기도!
├─────────────────────────────────┤
│ Row 1                       ┃  │
│ Row 2                       ┃  │
│ ...                         ┃  │
└─────────────────────────────────┘
```

### After
```
┌─────────────────────────────────┐
│ 헤더                            │ ← 스크롤바 없음!
├─────────────────────────────────┤
│ Row 1                       ┃  │ ← 스크롤바 여기만
│ Row 2                       ┃  │
│ ...                         ┃  │
└─────────────────────────────────┘
```

---

## 🧪 테스트 방법

1. **Policy 페이지 접속**
   ```
   http://localhost:3000/admin/policies
   ```

2. **스크롤바 위치 확인**
   - ✅ 헤더 영역에 **스크롤바가 없는지** 확인
   - ✅ 바디 영역에만 **스크롤바가 있는지** 확인
   - ✅ 스크롤 시 **헤더가 고정**되는지 확인

3. **컬럼 정렬 확인**
   - ✅ 헤더와 바디의 **컬럼 너비가 일치**하는지 확인
   - ✅ 수직선이 **정확히 정렬**되는지 확인

---

## 💡 주의사항

### 헤더 중복
헤더 구조가 두 번 정의됩니다:
1. **헤더 테이블**: 실제 표시용
2. **바디 테이블**: 숨김 처리 (컬럼 정렬용)

**⚠️ 두 헤더의 구조가 정확히 동일해야 합니다!**
- 컬럼 순서
- 컬럼 너비 (`w-20`, `w-32` 등)
- 컬럼 개수

### 컬럼 너비 변경 시
두 곳 모두 수정해야 합니다:
```tsx
{/* 헤더 테이블 */}
<TableHead className="w-32">State 수</TableHead>

{/* 바디 테이블 */}
<TableHead className="w-32">State 수</TableHead>
```

---

## 🎨 스크롤바 스타일

```css
/* 너비 */
::-webkit-scrollbar {
  width: 10px;
}

/* 트랙 */
::-webkit-scrollbar-track {
  background: 연한 회색;
}

/* 썸 */
::-webkit-scrollbar-thumb {
  background: 회색;
  border-radius: 5px;
}

/* 호버 */
::-webkit-scrollbar-thumb:hover {
  background: 진한 회색;
}
```

---

## ✨ 완성!

**이제 스크롤바가 바디 영역에만 표시되고, 헤더는 항상 깔끔하게 고정됩니다!** 🎉

- ✅ 헤더와 바디 완전 분리
- ✅ 스크롤바 위치 최적화
- ✅ 컬럼 정렬 유지
- ✅ 모든 List 컴포넌트 적용

