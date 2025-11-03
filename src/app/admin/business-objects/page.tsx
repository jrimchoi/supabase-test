import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { BusinessObjectList } from '@/components/admin/business-objects/BusinessObjectList'
import { Pagination } from '@/components/ui/pagination'

export const metadata = {
  title: 'BusinessObject 관리',
  description: '비즈니스 객체 인스턴스 관리',
}
export const dynamic = 'force-dynamic'
export const revalidate = 0

const DEFAULT_PAGE_SIZE = 20

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function getBusinessObjects(page: number, pageSize: number) {
  const skip = (page - 1) * pageSize

  const [objects, total] = await Promise.all([
    prisma.businessObject.findMany({
      skip,
      take: pageSize,
      include: {
        type: { select: { id: true, name: true, description: true, prefix: true } },
        policy: { select: { id: true, name: true, revisionSequence: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.businessObject.count(),
  ])

  return { objects, total }
}

export default async function BusinessObjectsPage({ searchParams }: Props) {
  const params = await searchParams
  const page = typeof params.page === 'string' ? parseInt(params.page, 10) : 1
  const pageSizeParam = typeof params.pageSize === 'string' ? params.pageSize : String(DEFAULT_PAGE_SIZE)
  const pageSize = pageSizeParam === 'all' ? 999999 : parseInt(pageSizeParam, 10)
  
  const { objects, total } = await getBusinessObjects(page, pageSize)
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="admin-page-container">
      <div className="admin-list-wrapper">
        <Suspense fallback={<div>로딩 중...</div>}>
          <BusinessObjectList initialObjects={objects} />
        </Suspense>
      </div>

      <div className="admin-table-spacing">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalCount={total}
          pageSize={pageSize}
          baseUrl="/admin/business-objects"
        />
      </div>
    </div>
  )
}

