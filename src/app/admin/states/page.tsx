import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { StateList } from '@/components/admin/states/StateList'
import { Pagination } from '@/components/ui/pagination'

export const metadata = {
  title: 'State 관리',
  description: '상태 관리 페이지',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

const DEFAULT_PAGE_SIZE = 20

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function getStates(page: number, pageSize: number) {
  const skip = (page - 1) * pageSize

  const [states, total] = await Promise.all([
    prisma.state.findMany({
      skip,
      take: pageSize,
      include: {
        policy: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            permissions: true,
            fromTransitions: true,
            toTransitions: true,
          },
        },
      },
      orderBy: [
        { policyId: 'asc' },
        { order: 'asc' },
      ],
    }),
    prisma.state.count(),
  ])

  return { states, total }
}

async function getPolicies() {
  const policies = await prisma.policy.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  })

  return policies
}

export default async function StatesPage({ searchParams }: Props) {
  const params = await searchParams
  const page = typeof params.page === 'string' ? parseInt(params.page, 10) : 1
  const pageSizeParam = typeof params.pageSize === 'string' ? params.pageSize : String(DEFAULT_PAGE_SIZE)
  const pageSize = pageSizeParam === 'all' ? 999999 : parseInt(pageSizeParam, 10)
  
  const [{ states, total }, policies] = await Promise.all([getStates(page, pageSize), getPolicies()])
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="admin-page-container">
      <div className="admin-list-wrapper">
        <Suspense fallback={<div>로딩 중...</div>}>
          <StateList initialStates={states} availablePolicies={policies} />
        </Suspense>
      </div>

      <div className="admin-table-spacing">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalCount={total}
          pageSize={pageSize}
          baseUrl="/admin/states"
        />
      </div>
    </div>
  )
}

