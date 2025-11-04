# Next.js 캐싱 및 데이터 갱신 완벽 가이드

## 📚 목차
1. [Next.js Server Actions](#1-nextjs-server-actions)
2. [Revalidating Data (캐시 무효화)](#2-revalidating-data-캐시-무효화)
3. [useTransition Hook](#3-usetransition-hook)
4. [실전 예제](#4-실전-예제)
5. [안티패턴](#5-안티패턴)

---

## 1. Next.js Server Actions

### 🎯 개념

**Server Actions**는 서버에서 실행되는 비동기 함수로, 클라이언트에서 직접 호출할 수 있습니다.

### 📝 기본 문법

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function createPolicy(data: {
  name: string
  version: number
  isActive: boolean
}) {
  // 1. 서버에서 DB 작업 수행
  const policy = await prisma.policy.create({ data })

  // 2. 캐시 무효화 (중요!)
  revalidatePath('/admin/policies')

  // 3. 결과 반환
  return { success: true, data: policy }
}
```

### ✅ 장점

| 장점 | 설명 |
|------|------|
| **타입 안전성** | TypeScript로 완벽한 타입 체크 |
| **자동 직렬화** | 복잡한 객체도 자동으로 전송 |
| **보안** | 민감한 로직을 서버에서만 실행 |
| **간결함** | API Route 불필요 |
| **캐시 통합** | `revalidatePath()`, `revalidateTag()` 내장 |

### 📖 사용 예제

```typescript
// ✅ Server Action (actions.ts)
'use server'

export async function updatePolicy(id: string, data: any) {
  const policy = await prisma.policy.update({
    where: { id },
    data,
  })
  
  revalidatePath('/admin/policies') // 캐시 무효화!
  return { success: true, data: policy }
}

// ✅ Client Component (PolicyDialog.tsx)
'use client'

import { updatePolicy } from './actions'

function PolicyDialog() {
  const handleSubmit = async () => {
    const result = await updatePolicy(policyId, { name: '새 이름' })
    if (result.success) {
      // ✨ 자동으로 /admin/policies 페이지 데이터 갱신됨!
    }
  }
}
```

---

## 2. Revalidating Data (캐시 무효화)

### 🎯 개념

Next.js는 기본적으로 **모든 것을 캐싱**합니다. 데이터가 변경되면 캐시를 무효화해야 합니다.

### 📊 Next.js 캐싱 레이어

```
┌─────────────────────────────────────────────┐
│ 1. Request Memoization (요청 메모이제이션)    │ ← fetch() 중복 제거
├─────────────────────────────────────────────┤
│ 2. Data Cache (데이터 캐시)                  │ ← fetch() 결과 저장
├─────────────────────────────────────────────┤
│ 3. Full Route Cache (전체 라우트 캐시)       │ ← 렌더링된 HTML/RSC 저장
├─────────────────────────────────────────────┤
│ 4. Router Cache (라우터 캐시)                │ ← 클라이언트 측 페이지 캐시
└─────────────────────────────────────────────┘
```

### 🔧 캐시 무효화 방법

#### 방법 1: `revalidatePath()` (경로 기반)

```typescript
'use server'

import { revalidatePath } from 'next/cache'

export async function createPolicy(data: any) {
  await prisma.policy.create({ data })
  
  // ✅ /admin/policies 페이지의 모든 캐시 무효화
  revalidatePath('/admin/policies')
  
  // ✅ 특정 레이아웃만 무효화
  revalidatePath('/admin/policies', 'layout')
  
  // ✅ 페이지만 무효화 (기본값)
  revalidatePath('/admin/policies', 'page')
}
```

#### 방법 2: `revalidateTag()` (태그 기반)

```typescript
// ✅ 데이터 fetch 시 태그 지정
const policies = await fetch('https://api.example.com/policies', {
  next: { tags: ['policies'] }
})

// ✅ Server Action에서 태그로 무효화
'use server'
import { revalidateTag } from 'next/cache'

export async function createPolicy(data: any) {
  await prisma.policy.create({ data })
  revalidateTag('policies') // 'policies' 태그의 모든 캐시 무효화
}
```

#### 방법 3: `router.refresh()` (클라이언트)

```typescript
'use client'

import { useRouter } from 'next/navigation'

function PolicyList() {
  const router = useRouter()
  
  const handleUpdate = async () => {
    await updatePolicy(...)
    router.refresh() // 현재 페이지의 Server Component 데이터 갱신
  }
}
```

#### 방법 4: 페이지 레벨 캐싱 비활성화

```typescript
// app/admin/policies/page.tsx

export const dynamic = 'force-dynamic' // 항상 동적 렌더링
export const revalidate = 0            // 캐시 사용 안 함

export default async function PoliciesPage() {
  const policies = await getPolicies() // 매번 최신 데이터 조회
}
```

---

## 3. useTransition Hook

### 🎯 개념

**useTransition**은 UI를 차단하지 않고 상태를 업데이트할 수 있게 해주는 React 19 Hook입니다.

### 📝 기본 문법

```typescript
'use client'

import { useTransition } from 'react'

function MyComponent() {
  const [isPending, startTransition] = useTransition()
  
  const handleClick = () => {
    startTransition(async () => {
      // 이 코드는 백그라운드에서 실행됨
      await someSlowAction()
    })
  }
  
  return (
    <button disabled={isPending}>
      {isPending ? '처리 중...' : '클릭'}
    </button>
  )
}
```

### 🎨 상태 값

| 상태 | 설명 |
|------|------|
| **isPending** | `true`: 작업 진행 중, `false`: 완료 |
| **startTransition** | 비동기 작업을 시작하는 함수 |

### ✅ 사용 시나리오

#### 시나리오 1: 로딩 상태 표시

```typescript
const [isPending, startTransition] = useTransition()

const handleSave = () => {
  startTransition(async () => {
    await savePolicy({ ... })
  })
}

<button disabled={isPending}>
  {isPending ? '저장 중...' : '저장'}
</button>
```

#### 시나리오 2: 중복 클릭 방지

```typescript
const [isPending, startTransition] = useTransition()

const handleDelete = () => {
  startTransition(async () => {
    await deletePolicy(id)
    router.refresh()
  })
}

// isPending이 true일 때 버튼 비활성화 → 중복 클릭 방지!
<button disabled={isPending}>삭제</button>
```

#### 시나리오 3: Server Actions + router.refresh()

```typescript
const [isPending, startTransition] = useTransition()
const router = useRouter()

const handleUpdate = () => {
  startTransition(async () => {
    const result = await updatePolicy(id, data)
    
    if (result.success) {
      // ✅ Server Component 데이터 갱신 (부드러운 전환)
      router.refresh()
    }
  })
}
```

### 🔄 작동 원리

```
사용자 클릭
    ↓
startTransition(() => {
    ↓
  isPending = true
    ↓
  async 작업 시작 (백그라운드)
    ↓
  UI는 계속 반응 (차단 안 됨!)
    ↓
  작업 완료
    ↓
  isPending = false
    ↓
  UI 업데이트
})
```

### ⚠️ 주의사항

```typescript
// ❌ 나쁜 예: async가 빠짐
startTransition(() => {
  updatePolicy(...) // Promise를 기다리지 않음!
})

// ✅ 좋은 예: async 사용
startTransition(async () => {
  await updatePolicy(...) // 올바르게 기다림
})
```

---

## 4. 실전 예제

### 예제 1: Policy CRUD 전체 플로우

```typescript
// ============================================
// 1. Server Actions (actions.ts)
// ============================================
'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function createPolicy(data: {
  name: string
  version: number
  isActive: boolean
}) {
  const policy = await prisma.policy.create({ data })
  
  // 💡 핵심: 캐시 무효화!
  revalidatePath('/admin/policies')
  
  return { success: true, data: policy }
}

export async function updatePolicy(id: string, data: any) {
  const policy = await prisma.policy.update({
    where: { id },
    data,
  })
  
  revalidatePath('/admin/policies')
  return { success: true, data: policy }
}

export async function deletePolicy(id: string) {
  await prisma.policy.delete({ where: { id } })
  
  revalidatePath('/admin/policies')
  return { success: true }
}

// ============================================
// 2. Server Component (page.tsx)
// ============================================
// 캐싱 비활성화 (항상 최신 데이터)
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getPolicies() {
  // 매번 DB에서 최신 데이터 조회
  return await prisma.policy.findMany()
}

export default async function PoliciesPage() {
  const policies = await getPolicies()
  
  return <PolicyList initialPolicies={policies} />
}

// ============================================
// 3. Client Component (PolicyList.tsx)
// ============================================
'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createPolicy, updatePolicy, deletePolicy } from './actions'

function PolicyList({ initialPolicies }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  
  // 생성
  const handleCreate = async (data) => {
    startTransition(async () => {
      const result = await createPolicy(data)
      
      if (result.success) {
        // ✅ Server Component 데이터 갱신
        router.refresh()
      }
    })
  }
  
  // 수정
  const handleUpdate = async (id, data) => {
    startTransition(async () => {
      const result = await updatePolicy(id, data)
      
      if (result.success) {
        router.refresh()
      }
    })
  }
  
  // 삭제
  const handleDelete = async (id) => {
    startTransition(async () => {
      const result = await deletePolicy(id)
      
      if (result.success) {
        router.refresh()
      }
    })
  }
  
  return (
    <div>
      {/* isPending으로 로딩 상태 표시 */}
      {isPending && <div>처리 중...</div>}
      
      {initialPolicies.map(policy => (
        <div key={policy.id}>
          {policy.name}
          <button 
            onClick={() => handleUpdate(policy.id, { name: '새 이름' })}
            disabled={isPending}
          >
            수정
          </button>
        </div>
      ))}
    </div>
  )
}
```

---

## 5. 안티패턴

### ❌ 나쁜 예 1: window.location.reload()

```typescript
// ❌ 페이지 전체 새로고침 (너무 무식함!)
const handleCreate = async () => {
  await createPolicy({ ... })
  window.location.reload() // 모든 상태 초기화, 깜빡임, 느림
}
```

**문제점**:
- 모든 클라이언트 상태 초기화
- 페이지 전체 reload (느림)
- 사용자 경험 나쁨 (깜빡임)

---

### ❌ 나쁜 예 2: fetch() + router.refresh() (Server Actions 안 쓰기)

```typescript
// ❌ 불필요하게 API Route 사용
const handleCreate = async () => {
  const response = await fetch('/api/policies', {
    method: 'POST',
    body: JSON.stringify({ ... }),
  })
  
  router.refresh() // 캐시 무효화가 자동이 아님!
}
```

**문제점**:
- API Route 파일 추가로 필요
- 타입 안전성 없음
- `revalidatePath()`를 API Route에서 호출해야 함

---

### ❌ 나쁜 예 3: useState로 로컬 상태 관리

```typescript
// ❌ 서버 데이터와 클라이언트 상태가 분리됨
const [policies, setPolicies] = useState(initialPolicies)

const handleCreate = async (data) => {
  const result = await createPolicy(data)
  
  // 서버에서는 데이터가 생성되었지만...
  // 클라이언트 상태를 수동으로 업데이트해야 함!
  setPolicies([...policies, result.data]) // 동기화 문제 발생 가능!
}
```

**문제점**:
- 서버와 클라이언트 상태 불일치 위험
- 복잡한 관계형 데이터는 동기화 어려움
- 다른 사용자의 변경 사항 반영 안 됨

---

### ❌ 나쁜 예 4: revalidatePath() 없이 Server Actions 사용

```typescript
// ❌ Server Action에서 revalidatePath() 누락
'use server'

export async function createPolicy(data: any) {
  const policy = await prisma.policy.create({ data })
  
  // revalidatePath() 없음! ← 캐시가 무효화되지 않음!
  return { success: true, data: policy }
}
```

**문제점**:
- `router.refresh()` 호출해도 캐시된 데이터가 계속 표시됨
- 새로고침해야만 업데이트됨

---

### ❌ 나쁜 예 5: useTransition 없이 async 호출

```typescript
// ❌ 로딩 상태 관리 안 함
const handleCreate = async () => {
  await createPolicy({ ... })
  router.refresh()
}

// 사용자는 버튼을 여러 번 클릭 가능! (중복 생성 위험)
<button onClick={handleCreate}>생성</button>
```

**문제점**:
- 로딩 상태 표시 없음
- 중복 클릭 방지 불가
- 사용자 경험 나쁨

---

## 6. 올바른 패턴 (Best Practice)

### ✅ 완벽한 예제

```typescript
// ============================================
// 1. Server Actions (actions.ts)
// ============================================
'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function createPolicy(data: {
  name: string
  version: number
  isActive: boolean
}) {
  try {
    const policy = await prisma.policy.create({ data })
    
    // ✅ 캐시 무효화
    revalidatePath('/admin/policies')
    
    return { success: true, data: policy }
  } catch (error) {
    console.error('Policy 생성 에러:', error)
    return { success: false, error: '생성 실패' }
  }
}

// ============================================
// 2. Server Component (page.tsx)
// ============================================
// ✅ 캐싱 비활성화 (실시간 데이터)
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getPolicies() {
  return await prisma.policy.findMany()
}

export default async function PoliciesPage() {
  const policies = await getPolicies()
  return <PolicyList initialPolicies={policies} />
}

// ============================================
// 3. Client Component (PolicyList.tsx)
// ============================================
'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createPolicy } from './actions'

function PolicyList({ initialPolicies }) {
  const [selectedPolicy, setSelectedPolicy] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  
  const handleCreate = async (data) => {
    startTransition(async () => {
      try {
        const result = await createPolicy(data)
        
        if (!result.success) {
          throw new Error(result.error)
        }
        
        // ✅ Dialog 닫기
        setIsDialogOpen(false)
        
        // ✅ Server Component 데이터 갱신
        router.refresh()
      } catch (error) {
        alert(error.message)
      }
    })
  }
  
  return (
    <>
      <button onClick={() => setIsDialogOpen(true)}>
        새 Policy 생성
      </button>
      
      {/* 로딩 상태 표시 */}
      {isPending && <div>처리 중...</div>}
      
      {initialPolicies.map(policy => (
        <div key={policy.id}>{policy.name}</div>
      ))}
      
      <PolicyDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleCreate}
      />
    </>
  )
}

// ============================================
// 4. Dialog Component (PolicyDialog.tsx)
// ============================================
'use client'

function PolicyDialog({ open, onOpenChange, onSubmit }) {
  const [isPending, startTransition] = useTransition()
  
  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    
    startTransition(async () => {
      await onSubmit({
        name: formData.get('name'),
        version: Number(formData.get('version')),
        isActive: formData.get('isActive') === 'on',
      })
    })
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form onSubmit={handleSubmit}>
        <input name="name" required />
        <input name="version" type="number" required />
        <input name="isActive" type="checkbox" />
        
        <button type="submit" disabled={isPending}>
          {isPending ? '저장 중...' : '저장'}
        </button>
      </form>
    </Dialog>
  )
}
```

---

## 7. 플로우 다이어그램

### 전체 데이터 갱신 플로우

```
┌─────────────────────────────────────────────────────────┐
│ Client Component (PolicyDialog)                         │
│                                                          │
│ 1. 사용자가 "저장" 클릭                                    │
│    ↓                                                     │
│ 2. startTransition(async () => { ... })                 │
│    - isPending = true                                   │
│    - 버튼 비활성화                                        │
└──────────────────┬──────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────┐
│ Server Actions (actions.ts)                             │
│                                                          │
│ 3. await createPolicy({ ... })                          │
│    - DB에 데이터 저장                                     │
│    ↓                                                     │
│ 4. revalidatePath('/admin/policies')                    │
│    - Full Route Cache 무효화                            │
│    - Data Cache 무효화                                   │
└──────────────────┬──────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────┐
│ Client Component (PolicyList)                           │
│                                                          │
│ 5. result.success 확인                                   │
│    ↓                                                     │
│ 6. router.refresh()                                     │
│    - Server Component 재실행                             │
│    - 최신 데이터 조회                                     │
│    ↓                                                     │
│ 7. isPending = false                                    │
│    - 버튼 활성화                                          │
│    - "저장 완료" 표시                                     │
└─────────────────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────┐
│ Server Component (page.tsx)                             │
│                                                          │
│ 8. getPolicies() 재실행                                  │
│    - DB에서 최신 데이터 조회                              │
│    ↓                                                     │
│ 9. PolicyList에 새 데이터 전달                            │
│    - initialPolicies 업데이트                            │
└─────────────────────────────────────────────────────────┘
                   ↓
             ✅ UI 업데이트!
```

---

## 8. 성능 최적화 팁

### Tip 1: 필요한 경로만 무효화

```typescript
// ❌ 너무 광범위
revalidatePath('/') // 모든 페이지 무효화!

// ✅ 필요한 경로만
revalidatePath('/admin/policies')
revalidatePath('/admin/policies', 'page') // 페이지만
```

### Tip 2: 여러 경로 무효화

```typescript
export async function updatePolicy(id: string, data: any) {
  await prisma.policy.update({ where: { id }, data })
  
  // 여러 페이지 무효화
  revalidatePath('/admin/policies')
  revalidatePath('/dashboard')
  revalidatePath(`/policies/${id}`)
}
```

### Tip 3: 태그 기반 무효화 (확장성)

```typescript
// 데이터 fetch 시 태그 지정
async function getPolicies() {
  return await fetch('https://api.example.com/policies', {
    next: { tags: ['policies'] }
  })
}

async function getPolicyDetail(id: string) {
  return await fetch(`https://api.example.com/policies/${id}`, {
    next: { tags: ['policies', `policy-${id}`] }
  })
}

// Server Action에서 태그로 무효화
export async function updatePolicy(id: string, data: any) {
  await prisma.policy.update({ where: { id }, data })
  
  revalidateTag('policies')        // 모든 policies 캐시 무효화
  revalidateTag(`policy-${id}`)    // 특정 policy만 무효화
}
```

---

## 9. 디버깅 팁

### 캐시 문제 디버깅

```typescript
// 1. 캐싱 완전 비활성화 (디버깅용)
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

// 2. 개발 서버 재시작
npm run dev

// 3. 브라우저 캐시 삭제
// Chrome: Cmd+Shift+R (강제 새로고침)

// 4. Network 탭에서 확인
// - 요청이 실제로 서버로 가는지 확인
// - Response가 304 (cached)인지 200 (fresh)인지 확인
```

### Server Actions 디버깅

```typescript
'use server'

export async function createPolicy(data: any) {
  console.log('🔵 Server Action 실행:', data)
  
  const policy = await prisma.policy.create({ data })
  console.log('✅ Policy 생성 완료:', policy.id)
  
  revalidatePath('/admin/policies')
  console.log('🔄 캐시 무효화 완료: /admin/policies')
  
  return { success: true, data: policy }
}
```

### useTransition 디버깅

```typescript
const [isPending, startTransition] = useTransition()

useEffect(() => {
  console.log('isPending 상태:', isPending)
}, [isPending])

const handleAction = () => {
  console.log('▶️ Transition 시작')
  
  startTransition(async () => {
    console.log('🔵 비동기 작업 시작')
    await someAction()
    console.log('✅ 비동기 작업 완료')
  })
  
  console.log('⏸️ Transition 호출 완료 (비동기 작업은 계속 진행 중)')
}
```

---

## 10. 요약표

### Next.js 데이터 갱신 방법 비교

| 방법 | 사용 시기 | 장점 | 단점 |
|------|----------|------|------|
| **Server Actions + revalidatePath()** | CRUD 작업 | ✅ 타입 안전, 자동 캐시 무효화 | 서버 왕복 필요 |
| **router.refresh()** | 클라이언트에서 갱신 | ✅ 부드러운 전환 | Server Component 필요 |
| **useTransition()** | 비동기 UI 상태 | ✅ 로딩 상태, 중복 방지 | React 19 필수 |
| **dynamic = 'force-dynamic'** | 실시간 데이터 필요 | ✅ 항상 최신 데이터 | 캐싱 이점 없음 |
| ~~window.location.reload()~~ | ❌ 사용 금지 | 확실함 | 모든 상태 초기화 |

---

## 11. 프로덕션 체크리스트

### ✅ CRUD 기능 체크리스트

- [ ] Server Actions 파일 생성 (`actions.ts`)
- [ ] 모든 Actions에 `'use server'` 지시어 추가
- [ ] 모든 Actions에 `revalidatePath()` 호출
- [ ] 에러 처리 (`try-catch`) 추가
- [ ] 성공/실패 결과 반환
- [ ] Client Component에서 `useTransition()` 사용
- [ ] `router.refresh()` 호출
- [ ] `isPending`으로 버튼 비활성화
- [ ] 페이지에 `dynamic = 'force-dynamic'` 설정

---

## 12. 참고 자료

### 공식 문서
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Revalidating Data](https://nextjs.org/docs/app/building-your-application/caching#revalidatepath)
- [useTransition (React 19)](https://react.dev/reference/react/useTransition)

### 관련 개념
- [Server Components vs Client Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Caching in Next.js](https://nextjs.org/docs/app/building-your-application/caching)
- [Route Segment Config](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config)

---

## 13. 프로젝트 적용 예시

### 현재 프로젝트 구조

```
src/
  app/
    admin/
      policies/
        actions.ts          ← Server Actions
        page.tsx           ← Server Component
    api/
      policies/
        route.ts           ← ⚠️ 이제 불필요 (Server Actions 사용)
  components/
    admin/
      policies/
        PolicyList.tsx     ← Client Component (useTransition)
        PolicyDialog.tsx   ← Client Component (useTransition)
```

### 마이그레이션 가이드

```typescript
// ❌ 이전 (API Route 방식)
// app/api/policies/route.ts
export async function POST(request: Request) {
  const body = await request.json()
  const policy = await prisma.policy.create({ data: body })
  return NextResponse.json(policy)
}

// Client Component
const response = await fetch('/api/policies', { ... })
router.refresh()

// ✅ 현재 (Server Actions 방식)
// app/admin/policies/actions.ts
'use server'
export async function createPolicy(data: any) {
  const policy = await prisma.policy.create({ data })
  revalidatePath('/admin/policies')
  return { success: true, data: policy }
}

// Client Component
startTransition(async () => {
  const result = await createPolicy(data)
  router.refresh()
})
```

---

## 14. FAQ

### Q1: Server Actions vs API Routes 언제 사용?

**Server Actions** (권장):
- CRUD 작업
- 폼 제출
- 내부 데이터 변경

**API Routes** (특수 케이스):
- 외부 API (Webhooks)
- 인증 콜백
- 파일 업로드/다운로드
- 타사 서비스와 통합

### Q2: revalidatePath vs revalidateTag?

**revalidatePath**: 경로 기반, 간단한 경우
```typescript
revalidatePath('/admin/policies')
```

**revalidateTag**: 태그 기반, 복잡한 경우
```typescript
revalidateTag('policies')        // 여러 페이지에 걸친 캐시 무효화
revalidateTag(`policy-${id}`)   // 특정 리소스만
```

### Q3: useTransition vs useState?

**useTransition**: 비동기 UI 상태 (권장)
```typescript
const [isPending, startTransition] = useTransition()
```

**useState**: 일반 동기 상태
```typescript
const [isOpen, setIsOpen] = useState(false)
```

### Q4: 왜 router.refresh()를 startTransition 안에서 호출?

```typescript
// ❌ 나쁜 예
await createPolicy(...)
router.refresh() // 즉시 실행, 깜빡임 발생

// ✅ 좋은 예
startTransition(async () => {
  await createPolicy(...)
  router.refresh() // transition 안에서 실행, 부드러운 전환
})
```

---

## 🎯 핵심 요약

### 3가지 핵심 패턴

1. **Server Actions + revalidatePath()**
   - DB 작업 후 자동 캐시 무효화
   
2. **useTransition() + router.refresh()**
   - 비동기 작업 상태 관리 + Server Component 갱신
   
3. **dynamic = 'force-dynamic'**
   - 페이지 레벨 캐싱 비활성화

### 올바른 CRUD 패턴

```typescript
// Server Action
'use server'
export async function create(data) {
  await db.create(data)
  revalidatePath('/path')  // 1️⃣ 캐시 무효화
  return { success: true }
}

// Client Component
const [isPending, startTransition] = useTransition()
const router = useRouter()

startTransition(async () => {      // 2️⃣ 비동기 상태 관리
  const result = await create(data)
  router.refresh()                 // 3️⃣ Server Component 갱신
})
```

---

**이제 Next.js의 캐싱을 완벽하게 이해하셨을 것입니다!** 🚀

질문이 있으시면 언제든 알려주세요! 📚

