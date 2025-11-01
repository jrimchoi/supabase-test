import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { Pagination } from '@/components/ui/pagination'

export const metadata = { title: 'StateTransition 관리' }
export const dynamic = 'force-dynamic'
export const revalidate = 0

const DEFAULT_PAGE_SIZE = 20

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function getTransitions(page: number, pageSize: number) {
  const skip = (page - 1) * pageSize

  const [transitions, total] = await Promise.all([
    prisma.stateTransition.findMany({
      skip,
      take: pageSize,
      include: {
        fromState: { select: { id: true, name: true } },
        toState: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.stateTransition.count(),
  ])

  return { transitions, total }
}

export default async function TransitionsPage({ searchParams }: Props) {
  const params = await searchParams
  const page = typeof params.page === 'string' ? parseInt(params.page, 10) : 1
  const pageSizeParam = typeof params.pageSize === 'string' ? params.pageSize : String(DEFAULT_PAGE_SIZE)
  const pageSize = pageSizeParam === 'all' ? 999999 : parseInt(pageSizeParam, 10)
  
  const { transitions, total } = await getTransitions(page, pageSize)
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex-shrink-0 mb-3">
        <h1 className="text-2xl font-bold tracking-tight">StateTransition 관리</h1>
        <p className="text-sm text-muted-foreground mt-1">State 간 전이 관계를 정의합니다</p>
      </div>
      
      <div className="flex-1 min-h-0">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            총 {total}개의 Transition이 등록되어 있습니다.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            StateTransition 관리 UI는 추후 구현 예정입니다 (State Diagram과 통합).
          </p>
        </div>
      </div>

      <div className="flex-shrink-0 mt-1 mb-1">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalCount={total}
          pageSize={pageSize}
          baseUrl="/admin/transitions"
        />
      </div>
    </div>
  )
}

