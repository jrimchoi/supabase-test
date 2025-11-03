import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { TypeList } from '@/components/admin/types/TypeList'
import { Pagination } from '@/components/ui/pagination'

export const metadata = {
  title: 'Type 관리',
  description: '비즈니스 타입 관리 페이지 (계층 구조, 리비전 시스템, Attribute 연결)',
}

// 캐싱 비활성화
export const dynamic = 'force-dynamic'
export const revalidate = 0

const DEFAULT_PAGE_SIZE = 20

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function getTypes(page: number, pageSize: number) {
  const skip = (page - 1) * pageSize

  const [types, total] = await Promise.all([
    prisma.type.findMany({
      skip,
      take: pageSize,
          include: {
            policy: {
              select: {
                name: true,
                revisionSequence: true,
              },
            },
        parent: {
          select: {
            id: true,
            type: true,
            name: true,
          },
        },
        _count: {
          select: {
            children: true,
            objects: true,
            typeAttributes: true,
          },
        },
      },
      orderBy: [
        { type: 'asc' },
      ],
    }),
    prisma.type.count(),
  ])

  return { types, total }
}

export default async function TypesPage({ searchParams }: Props) {
  const params = await searchParams
  const page = typeof params.page === 'string' ? parseInt(params.page, 10) : 1
  const pageSizeParam = typeof params.pageSize === 'string' ? params.pageSize : String(DEFAULT_PAGE_SIZE)
  const pageSize = pageSizeParam === 'all' ? 999999 : parseInt(pageSizeParam, 10)
  
  const { types, total } = await getTypes(page, pageSize)
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="admin-page-container">
      <div className="admin-list-wrapper">
        <Suspense fallback={<div>로딩 중...</div>}>
          <TypeList initialTypes={types} />
        </Suspense>
      </div>

      <div className="admin-table-spacing">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalCount={total}
          pageSize={pageSize}
          baseUrl="/admin/types"
        />
      </div>
    </div>
  )
}

