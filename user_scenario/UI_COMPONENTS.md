# Team Workflow UI 컴포넌트 가이드

> **버전**: 2.0  
> **작성일**: 2025-11-02

---

## 📦 설치된 shadcn/ui 컴포넌트

### 기본 컴포넌트
- ✅ **Button** - 모든 variants (default, secondary, outline, ghost, destructive, link)
- ✅ **Input** - 텍스트 입력
- ✅ **Label** - 폼 라벨
- ✅ **Textarea** - 여러 줄 텍스트
- ✅ **Checkbox** - 체크박스

### 선택 및 메뉴
- ✅ **Select** - 드롭다운 선택
- ✅ **DropdownMenu** - 컨텍스트 메뉴
- ✅ **Tabs** - 탭 네비게이션

### 피드백 및 알림
- ✅ **Badge** - 상태 표시 (default, secondary, outline, destructive)
- ✅ **Alert** - 알림 메시지 (default, destructive)

### 레이아웃
- ✅ **Card** - 카드 레이아웃 (Header, Content, Footer)
- ✅ **Dialog** - 모달 대화상자 (삭제 확인 등)
- ✅ **Drawer** - 슬라이드 패널 (오른쪽, 500-700px)

### 데이터 표시
- ✅ **Table** - 기본 테이블
- ✅ **ScrollableTable** - 커스텀 (헤더 고정, 리사이즈, ellipsis)
- ✅ **Pagination** - 페이지네이션

---

## 🎨 커스텀 컴포넌트

### ScrollableTable
**위치**: `src/components/ui/scrollable-table.tsx`

**기능**:
- 단일 테이블 + Sticky 헤더
- 컬럼 리사이즈 (드래그)
- 텍스트 ellipsis (자동 말줄임표)
- Hover 시 전체 텍스트 (title 속성)
- 중첩 요소 ellipsis 지원 (div, code, span)

**사용법**:
```tsx
<ScrollableTable>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="w-48">컬럼1</TableHead>
        <TableHead className="w-32">컬럼2</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.map(item => (
        <TableRow key={item.id}>
          <TableCell>{item.name}</TableCell>
          <TableCell>{item.value}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</ScrollableTable>
```

### NavTooltip
**위치**: `src/components/admin/NavTooltip.tsx`

**기능**:
- 사이드바 접힌 상태에서 툴팁 표시
- 메뉴 아이템 hover 시 제목 + 설명 표시

### ThemeProvider
**위치**: `src/components/theme-provider.tsx`

**기능**:
- next-themes 래퍼
- 다크모드 전환
- System 테마 감지

---

## 🎭 컴포넌트별 Props

### Button
```tsx
variant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "link"
size?: "default" | "sm" | "lg" | "icon"
disabled?: boolean
```

### Badge
```tsx
variant?: "default" | "secondary" | "outline" | "destructive"
```

### Drawer
```tsx
open: boolean
onOpenChange: (open: boolean) => void
direction?: "top" | "bottom" | "left" | "right"  // 기본값: right

// DrawerContent
className?: string  // 예: "h-screen w-[600px] max-w-[90vw]"
```

### ScrollableTable
```tsx
children: React.ReactNode  // <Table> 컴포넌트
```

### Pagination
```tsx
currentPage: number
totalPages: number
totalCount: number
pageSize: number | 'all'
baseUrl: string
```

---

## 🎨 컬러 시스템

### CSS 변수 (Tailwind)
```css
/* Light Mode */
--background: 0 0% 100%;
--foreground: 240 10% 3.9%;
--primary: 240 5.9% 10%;
--secondary: 240 4.8% 95.9%;
--muted: 240 4.8% 95.9%;
--accent: 240 4.8% 95.9%;
--destructive: 0 84.2% 60.2%;
--border: 240 5.9% 90%;

/* Dark Mode */
--background: 240 10% 3.9%;
--foreground: 0 0% 98%;
--primary: 0 0% 98%;
--secondary: 240 3.7% 15.9%;
--muted: 240 3.7% 15.9%;
--accent: 240 3.7% 15.9%;
--destructive: 0 62.8% 30.6%;
--border: 240 3.7% 15.9%;
```

### 사용 예시
```tsx
<div className="bg-background text-foreground">
  <Button variant="default">Primary 색상</Button>
  <Badge variant="secondary">Secondary 색상</Badge>
  <Alert variant="destructive">Destructive 색상</Alert>
</div>
```

---

## 📐 레이아웃 시스템

### 페이지 높이 계산
```tsx
// AdminLayout 구조
h-screen (전체)
  ├─ 사이드바 (w-64 or w-16)
  └─ 메인 영역
      ├─ 상단 헤더 (h-16)          // 4rem
      └─ 페이지 콘텐츠
          └─ 컨테이너 padding (p-6)  // 1.5rem × 2 = 3rem

// 페이지 컨텐츠 높이
h-[calc(100vh-10rem)]
  = 100vh - 4rem(헤더) - 3rem(패딩상) - 3rem(패딩하)
```

### 테이블 레이아웃
```tsx
<div className="flex flex-col h-[calc(100vh-10rem)]">
  <div className="flex-shrink-0 mb-3">
    {/* 제목 */}
  </div>

  <div className="flex-1 min-h-0">
    <ScrollableTable>
      {/* 테이블 */}
    </ScrollableTable>
  </div>

  <div className="flex-shrink-0 mt-1 mb-1">
    <Pagination {...} />
  </div>
</div>
```

---

## 🎯 스타일 가이드

### Typography
```tsx
// Headings
<h1 className="text-3xl font-bold tracking-tight">제목 1</h1>
<h2 className="text-2xl font-bold tracking-tight">제목 2</h2>
<h3 className="text-xl font-semibold">제목 3</h3>
<h4 className="text-lg font-semibold">제목 4</h4>

// Body
<p className="text-base">본문 텍스트</p>
<p className="text-sm text-muted-foreground">작은 텍스트</p>
<p className="text-xs text-muted-foreground">매우 작은 텍스트</p>

// Code
<code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
  코드
</code>
```

### Spacing
```tsx
// 간격
gap-2     // 0.5rem (8px)
gap-3     // 0.75rem (12px)
gap-4     // 1rem (16px)

// Padding
p-2       // 0.5rem
p-4       // 1rem
p-6       // 1.5rem
px-4 py-2 // 좌우 1rem, 상하 0.5rem

// Margin
mb-3      // margin-bottom: 0.75rem
mt-1      // margin-top: 0.25rem
```

### Border & Shadow
```tsx
// Border
border              // 1px solid
border-t, border-b  // 상단/하단만
rounded-md          // 6px
rounded-lg          // 8px
rounded-xl          // 12px

// Shadow
shadow-sm           // 작은 그림자
shadow              // 기본 그림자
shadow-lg           // 큰 그림자
```

---

## 🔧 개발자 가이드

### 새 Dialog/Drawer 추가
```tsx
'use client'

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'

export function MyDrawer({ open, onOpenChange }: Props) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="h-screen w-[500px] max-w-[90vw]">
        <form className="flex flex-col h-full">
          <DrawerHeader className="flex-shrink-0 border-b">
            <DrawerTitle>제목</DrawerTitle>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-4">
            {/* 폼 필드 */}
          </div>

          <DrawerFooter className="flex-shrink-0 border-t">
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">취소</Button>
              <Button type="submit" className="flex-1">저장</Button>
            </div>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}
```

### 새 테이블 페이지 추가
```tsx
// page.tsx
export default async function MyPage({ searchParams }: Props) {
  const params = await searchParams
  const page = typeof params.page === 'string' ? parseInt(params.page, 10) : 1
  const pageSize = typeof params.pageSize === 'string' ? parseInt(params.pageSize, 10) : 20
  
  const { data, total } = await getData(page, pageSize)
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      <div className="flex-shrink-0 mb-3">
        <h1 className="text-2xl font-bold tracking-tight">제목</h1>
      </div>

      <div className="flex-1 min-h-0">
        <MyList initialData={data} />
      </div>

      <div className="flex-shrink-0 mt-1 mb-1">
        <Pagination {...} />
      </div>
    </div>
  )
}

// List.tsx (Client Component)
'use client'

export function MyList({ initialData }: Props) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 mb-2">
        <Button onClick={handleCreate}>새 항목 생성</Button>
      </div>

      <ScrollableTable>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-48">컬럼1</TableHead>
              {/* ... */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialData.map(item => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollableTable>
    </div>
  )
}
```

---

## 📚 참고 문서

- **Prisma Schema**: `prisma/schema.prisma`
- **SQL 초기화**: `prisma/init-v2.sql`
- **테이블 가이드**: `TABLE_COMPLETE_GUIDE.md`
- **리비전 시스템**: `BUSINESS_OBJECT_REVISION.md`
- **EAV 패턴**: `.cursorrules` (EAV 패턴 섹션)

---

**문서 버전**: 1.0  
**마지막 업데이트**: 2025-11-02

