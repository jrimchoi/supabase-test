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
        name: 'asc',
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
    <div className="admin-page-container">
      <div className="admin-list-wrapper">
        <Suspense fallback={<div>로딩 중...</div>}>
          <AttributeList initialAttributes={attributes} />
        </Suspense>
      </div>

      <div className="admin-table-spacing">
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

