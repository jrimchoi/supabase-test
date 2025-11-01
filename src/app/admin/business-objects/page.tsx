import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { Pagination } from '@/components/ui/pagination'

export const metadata = { title: 'BusinessObject 관리' }
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
        type: { select: { id: true, name: true } },
        policy: { select: { id: true, name: true, version: true } },
        _count: { select: { attributes: true } },
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
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex-shrink-0 mb-3">
        <h1 className="text-2xl font-bold tracking-tight">BusinessObject 관리</h1>
        <p className="text-sm text-muted-foreground mt-1">비즈니스 객체 인스턴스를 관리합니다 (EAV)</p>
      </div>
      
      <div className="flex-1 min-h-0">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            총 {total}개의 BusinessObject가 등록되어 있습니다.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            BusinessObject 관리 UI는 복잡도가 높아 추후 구현 예정입니다.
          </p>
        </div>
      </div>

      <div className="flex-shrink-0 mt-1 mb-1">
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

