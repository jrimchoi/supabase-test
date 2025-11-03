# 🎨 클라이언트 렌더링 성능 문제

## ❌ 문제

**네트워크는 빠른데 렌더링이 느림:**

```
네트워크 (Server → Client): 500ms ✅
클라이언트 렌더링 (React): 3-4초 ❌
총: 3.5-4.5초
```

**타임라인:**
```
0ms    : 메뉴 클릭
500ms  : 데이터 도착 (Network 탭에서 확인)
500ms  : React 컴포넌트 시작
4000ms : 화면 렌더링 완료 (3.5초 소요!)
```

---

## 🔍 원인

### 1. 대량의 DOM 렌더링
```typescript
// 50개 × 7개 컬럼 = 350개 DOM 노드
{initialObjects.map(obj => (
  <TableRow>
    <TableCell>...</TableCell>  // × 7
  </TableRow>
))}
```

### 2. 복잡한 렌더링 로직
- Badge 컴포넌트
- format() 날짜 포맷팅
- 조건부 렌더링
- Link 컴포넌트

### 3. 불필요한 재렌더링
- useMemo 의존성
- State 변경

---

## 🔍 성능 측정 방법

### 1. 브라우저 콘솔

**현재 추가됨:**
```typescript
console.log(`🎨 [BusinessObjectList] Render: XXms`)
```

**확인:**
1. F12 → Console 탭
2. 메뉴 클릭
3. "🎨 [BusinessObjectList]" 검색
4. 렌더링 시간 확인

---

### 2. React DevTools Profiler

**사용 방법:**
1. React DevTools 설치
2. F12 → "Profiler" 탭
3. 녹화 시작 (Record 버튼)
4. 메뉴 클릭
5. 녹화 중지
6. **렌더링 시간 분석**

**확인 사항:**
- BusinessObjectList 렌더링 시간
- ScrollableTable 렌더링 시간
- Badge, format() 등 개별 컴포넌트

---

### 3. Performance API

```typescript
// 메뉴 클릭 → 렌더링 완료까지 측정
performance.mark('menu-click')
// ... 렌더링 ...
performance.mark('render-complete')
performance.measure('total', 'menu-click', 'render-complete')

console.log(performance.getEntriesByName('total'))
```

---

## ✅ 해결 방법

### 1. 가상화 (Virtualization) - 가장 효과적!

**라이브러리:** `react-virtual` 또는 `react-window`

```bash
npm install @tanstack/react-virtual
```

```typescript
import { useVirtualizer } from '@tanstack/react-virtual'

export function BusinessObjectList({ initialObjects }) {
  const parentRef = useRef<HTMLDivElement>(null)
  
  const virtualizer = useVirtualizer({
    count: initialObjects.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48, // 행 높이 48px
  })

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(virtualRow => (
          <TableRow key={virtualRow.index}>
            {/* 보이는 행만 렌더링! */}
          </TableRow>
        ))}
      </div>
    </div>
  )
}
```

**효과:**
- Before: 50개 모두 렌더링 (3-4초)
- After: 화면에 보이는 10개만 렌더링 (100ms)
- **40배 빠름!**

---

### 2. Memo 최적화

```typescript
import { memo } from 'react'

// 각 행을 memoization
const BusinessObjectRow = memo(({ obj }: { obj: BusinessObject }) => {
  return (
    <TableRow>
      {/* ... */}
    </TableRow>
  )
})

// 사용:
{initialObjects.map(obj => (
  <BusinessObjectRow key={obj.id} obj={obj} />
))}
```

**효과:**
- 재렌더링 시 변경된 행만 업데이트
- 페이징 전환 빠름

---

### 3. 날짜 포맷팅 최적화

```typescript
// Before: 매번 format() 호출 (느림!)
{format(new Date(obj.createdAt), 'yyyy-MM-dd HH:mm', { locale: ko })}

// After: useMemo로 캐싱
const formattedDate = useMemo(() => 
  format(new Date(obj.createdAt), 'yyyy-MM-dd HH:mm', { locale: ko }),
  [obj.createdAt]
)
```

**효과:**
- 50개 × format() 호출 제거
- 렌더링 시간 단축

---

### 4. 초기 페이지 크기 줄이기

```typescript
// Before:
const pagination = useClientPagination(initialObjects, { initialPageSize: 20 })

// After:
const pagination = useClientPagination(initialObjects, { initialPageSize: 10 })
```

**효과:**
- 20개 → 10개 렌더링
- 렌더링 시간 50% 감소

---

## 🎯 즉시 적용 가능한 최적화

### 옵션 1: 초기 페이지 크기 줄이기 (빠름)

```typescript
initialPageSize: 10  // 20 → 10
```

### 옵션 2: 가상화 적용 (최고 성능)

react-virtual 설치 및 적용

---

## 📊 예상 개선

| 방법 | Before | After | 개선 |
|------|--------|-------|------|
| **페이지 크기 10** | 3-4초 | 1.5-2초 | 2배 |
| **날짜 Memo** | 3-4초 | 2-3초 | 1.5배 |
| **행 Memo** | 3-4초 | 2-3초 | 1.5배 |
| **가상화** | 3-4초 | **100ms** | **40배!** 🚀 |

---

## 🚀 빠른 해결

**지금 바로 적용:**
1. 초기 페이지 크기 10으로 줄이기
2. 날짜 포맷팅 최적화

**나중에 적용:**
1. 가상화 (react-virtual)

어떤 것을 먼저 적용해드릴까요?

