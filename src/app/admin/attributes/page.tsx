import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { AttributeList } from '@/components/admin/attributes/AttributeList'
import { Pagination } from '@/components/ui/pagination'

export const metadata = { title: 'Attribute 관리' }
export const dynamic = 'force-dynamic'
export const revalidate = 0

const DEFAULT_PAGE_SIZE = 20

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function getAttributes(page: number, pageSize: number) {
  const skip = (page - 1) * pageSize

  const [attributes, total] = await Promise.all([
    prisma.attribute.findMany({
      skip,
      take: pageSize,
      include: {
        typeAttributes: {
          include: {
            type: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: {
        key: 'asc',
      },
    }),
    prisma.attribute.count(),
  ])

  return { attributes, total }
}

export default async function AttributesPage({ searchParams }: Props) {
  const params = await searchParams
  const page = typeof params.page === 'string' ? parseInt(params.page, 10) : 1
  const pageSizeParam = typeof params.pageSize === 'string' ? params.pageSize : String(DEFAULT_PAGE_SIZE)
  const pageSize = pageSizeParam === 'all' ? 999999 : parseInt(pageSizeParam, 10)
  
  const { attributes, total } = await getAttributes(page, pageSize)
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex-shrink-0 mb-3">
        <h1 className="text-2xl font-bold tracking-tight">Attribute 관리</h1>
        <p className="text-sm text-muted-foreground mt-1">공통 속성을 정의하고 Type에 할당합니다</p>
      </div>

      <div className="flex-1 min-h-0">
        <Suspense fallback={<div>로딩 중...</div>}>
          <AttributeList initialAttributes={attributes} />
        </Suspense>
      </div>

      <div className="flex-shrink-0 mt-1 mb-1">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalCount={total}
          pageSize={pageSize}
          baseUrl="/admin/attributes"
        />
      </div>
    </div>
  )
}

