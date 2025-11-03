# 📱 반응형 Navbar 완성 가이드

## ✅ 구현 완료

**화면 크기에 따라 사이드바가 자동으로 접히고 모바일 메뉴로 전환됩니다!**

---

## 🎯 반응형 동작

### Desktop (≥ 1024px)
```
┌─────────────────────────────────────┐
│ [Policy Admin]              [X]     │ ← 사이드바 (고정)
├─────────────────────────────────────┤
│ Dashboard                           │
│ Policies                            │
│ States                              │
│ ...                                 │
└─────────────────────────────────────┘

OR

┌───┐
│ ☰ │ ← 접힌 상태 (64px)
├───┤
│ 🏠 │
│ 🛡️ │
│ 🔗 │
└───┘
```

### Mobile (< 1024px)
```
┌─────────────────────────────────────┐
│                              [☰]    │ ← 플로팅 메뉴 버튼
│                                     │
│   페이지 내용                       │
│                                     │
└─────────────────────────────────────┘

클릭 시:
┌─────────────────────┐┌─────────────┐
│ [Policy Admin]  [X] ││ (어두운     │
├─────────────────────┤│  오버레이)  │
│ Dashboard           ││             │
│ Policies            ││             │
│ ...                 ││             │
└─────────────────────┘└─────────────┘
```

---

## 🔧 구현 내용

### 1. AdminLayout (`src/components/admin/AdminLayout.tsx`)

#### 화면 크기 감지
```tsx
const [isMobile, setIsMobile] = useState(false)

useEffect(() => {
  const checkScreenSize = () => {
    const mobile = window.innerWidth < 1024
    setIsMobile(mobile)
    if (mobile) {
      setSidebarOpen(false)  // 모바일에서는 자동으로 닫힘
    }
  }

  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
  return () => window.removeEventListener('resize', checkScreenSize)
}, [])
```

#### 사이드바 스타일
```tsx
<aside
  className={cn(
    'bg-card border-r transition-all duration-300',
    isMobile
      ? cn(
          'fixed top-0 left-0 h-screen w-64 z-50',
          !sidebarOpen && '-translate-x-full'  // 화면 밖으로
        )
      : cn(
          'relative z-0',
          sidebarOpen ? 'w-64' : 'w-16'  // 데스크탑 토글
        )
  )}
>
```

#### 모바일 오버레이
```tsx
{isMobile && sidebarOpen && (
  <div
    className="fixed inset-0 bg-black/50 z-40"
    onClick={() => setSidebarOpen(false)}
  />
)}
```

#### 플로팅 메뉴 버튼
```tsx
{isMobile && !sidebarOpen && (
  <div className="fixed top-20 left-4 z-30">
    <Button onClick={() => setSidebarOpen(true)}>
      <Menu className="h-4 w-4" />
    </Button>
  </div>
)}
```

#### 메뉴 클릭 시 자동 닫기
```tsx
<Link
  href={item.href}
  onClick={() => {
    if (isMobile) {
      setSidebarOpen(false)  // 모바일에서 자동 닫힘
    }
  }}
>
```

---

## 📊 반응형 브레이크포인트

| 화면 크기 | 사이드바 상태 | 동작 |
|----------|--------------|------|
| ≥ 1024px | 열림 (기본) | 수동 토글 가능 |
| < 1024px | 닫힘 (자동) | 플로팅 버튼으로 열기 |

**Tailwind CSS 브레이크포인트**:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px ← 사용
- `xl`: 1280px
- `2xl`: 1536px

---

## 🎨 모바일 UX

### 1. **초기 상태**
- 사이드바 숨김
- 플로팅 햄버거 버튼 표시

### 2. **메뉴 열기**
- 플로팅 버튼 클릭
- 사이드바 왼쪽에서 슬라이드 인
- 배경 오버레이 표시

### 3. **메뉴 닫기**
- X 버튼 클릭
- 오버레이 클릭
- 메뉴 항목 클릭 (자동)
- 사이드바 왼쪽으로 슬라이드 아웃

---

## 🎯 데스크탑 UX

### 1. **초기 상태**
- 사이드바 열림 (256px)
- 모든 메뉴 항목 보임

### 2. **접기**
- X 버튼 클릭
- 사이드바 좁아짐 (64px)
- 아이콘만 표시

### 3. **펼치기**
- Menu 버튼 클릭
- 사이드바 넓어짐 (256px)
- 텍스트 다시 표시

---

## ✅ 수정된 파일

1. ✅ `src/components/admin/AdminLayout.tsx`
   - 화면 크기 감지 추가
   - 모바일 오버레이 추가
   - 플로팅 메뉴 버튼 추가
   - 반응형 스타일 적용

2. ✅ `.cursorrules`
   - ScrollableTable 사용법 추가
   - 반응형 규칙 추가

---

## 🧪 테스트 방법

### 1. Desktop 테스트
```
브라우저 창 크기: > 1024px

1. Policy 페이지 접속
2. 사이드바 X 버튼 클릭 → 좁아짐 (아이콘만)
3. Menu 버튼 클릭 → 넓어짐 (텍스트 표시)
```

### 2. Mobile 테스트
```
브라우저 창 크기: < 1024px (개발자 도구에서 조정)

1. Policy 페이지 접속
2. 사이드바 자동으로 숨겨짐
3. 플로팅 햄버거 버튼 보임 (왼쪽 상단)
4. 햄버거 버튼 클릭 → 사이드바 슬라이드 인
5. 오버레이 클릭 또는 메뉴 선택 → 자동 닫힘
```

### 3. 반응형 테스트
```
1. 데스크탑 크기에서 시작 (사이드바 열림)
2. 브라우저 창을 천천히 좁힘
3. 1024px 이하가 되면 사이드바 자동으로 숨김
4. 다시 넓히면 데스크탑 모드로 복귀
```

---

## 📐 CSS 클래스 설명

### Desktop
```tsx
className="relative z-0 w-64"  // 고정, 열림
className="relative z-0 w-16"  // 고정, 접힘
```

### Mobile
```tsx
// 닫힘
className="fixed top-0 left-0 h-screen w-64 z-50 -translate-x-full"

// 열림
className="fixed top-0 left-0 h-screen w-64 z-50 translate-x-0"
```

### 오버레이
```tsx
className="fixed inset-0 bg-black/50 z-40"
```

---

## ✨ 완성!

**모든 화면 크기에서 최적화된 사이드바 경험을 제공합니다!** 🎉

- ✅ Desktop: 토글 가능한 사이드바
- ✅ Mobile: 슬라이드 메뉴 + 오버레이
- ✅ 자동 감지: 화면 크기에 따라 자동 전환
- ✅ 부드러운 애니메이션: transition-all duration-300

---

## 🎨 추가 커스터마이징 (선택사항)

### 브레이크포인트 변경
```tsx
// 768px (md)로 변경
const mobile = window.innerWidth < 768
```

### 애니메이션 속도 조정
```tsx
// 더 빠르게: duration-150
// 더 느리게: duration-500
className="transition-all duration-300"
```

### 플로팅 버튼 위치 조정
```tsx
// 왼쪽 상단
className="fixed top-20 left-4"

// 오른쪽 하단
className="fixed bottom-4 right-4"
```

