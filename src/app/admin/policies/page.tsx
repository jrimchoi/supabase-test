import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { PolicyList } from '@/components/admin/policies/PolicyList'
import { Pagination } from '@/components/ui/pagination'

export const metadata = {
  title: 'Policy 관리',
  description: '권한 정책 관리 페이지',
}

// 캐싱 비활성화 (실시간 데이터 갱신)
export const dynamic = 'force-dynamic'
export const revalidate = 0

const DEFAULT_PAGE_SIZE = 20

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function getPolicies(page: number, pageSize: number) {
  const skip = (page - 1) * pageSize

  const [policies, total] = await Promise.all([
    prisma.policy.findMany({
      skip,
      take: pageSize,
      include: {
        _count: {
          select: {
            states: true,
            types: true,
            businessObjects: true,
          },
        },
      },
      orderBy: [
        { name: 'asc' },
        { version: 'desc' },
      ],
    }),
    prisma.policy.count(),
  ])

  return { policies, total }
}

export default async function PoliciesPage({ searchParams }: Props) {
  const params = await searchParams
  const page = typeof params.page === 'string' ? parseInt(params.page, 10) : 1
  const pageSizeParam = typeof params.pageSize === 'string' ? params.pageSize : String(DEFAULT_PAGE_SIZE)
  const pageSize = pageSizeParam === 'all' ? 999999 : parseInt(pageSizeParam, 10)
  
  const { policies, total } = await getPolicies(page, pageSize)
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex-shrink-0 mb-3">
        <h1 className="text-2xl font-bold tracking-tight">Policy 관리</h1>
        <p className="text-sm text-muted-foreground mt-1">
          권한 정책을 생성하고 관리합니다
        </p>
      </div>

      <div className="flex-1 min-h-0">
        <Suspense fallback={<div>로딩 중...</div>}>
          <PolicyList initialPolicies={policies} />
        </Suspense>
      </div>

      <div className="flex-shrink-0 mt-1 mb-1">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalCount={total}
          pageSize={pageSize}
          baseUrl="/admin/policies"
        />
      </div>
    </div>
  )
}

