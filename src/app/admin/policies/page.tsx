import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { PolicyList } from '@/components/admin/policies/PolicyList'
import { Pagination } from '@/components/ui/pagination'

export const metadata = {
  title: 'Policy 관리',
  description: '권한 정책 관리 페이지',
}

// ISR: 30초 캐싱, 데이터 변경 시 자동 revalidate
export const revalidate = 30

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
            policyTypes: true,
            businessObjects: true,
          },
        },
      },
      orderBy: { name: 'asc' },
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
    <div className="admin-page-container">
      <div className="admin-list-wrapper">
        <Suspense fallback={<div>로딩 중...</div>}>
          <PolicyList initialPolicies={policies} />
        </Suspense>
      </div>

      <div className="admin-table-spacing">
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

