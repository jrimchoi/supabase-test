import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { TypeList } from '@/components/admin/types/TypeList'
import { Pagination } from '@/components/ui/pagination'

export const metadata = {
  title: 'Type 관리',
  description: '비즈니스 타입 관리 페이지 (EAV)',
}

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
            id: true,
            name: true,
            version: true,
          },
        },
        _count: {
          select: {
            typeAttributes: true,
            instances: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.type.count(),
  ])

  return { types, total }
}

async function getPolicies() {
  const policies = await prisma.policy.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      version: true,
    },
    orderBy: {
      name: 'asc',
    },
  })

  return policies
}

export default async function TypesPage({ searchParams }: Props) {
  const params = await searchParams
  const page = typeof params.page === 'string' ? parseInt(params.page, 10) : 1
  const pageSizeParam = typeof params.pageSize === 'string' ? params.pageSize : String(DEFAULT_PAGE_SIZE)
  const pageSize = pageSizeParam === 'all' ? 999999 : parseInt(pageSizeParam, 10)
  
  const [{ types, total }, policies] = await Promise.all([getTypes(page, pageSize), getPolicies()])
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex-shrink-0 mb-3">
        <h1 className="text-2xl font-bold tracking-tight">Type 관리</h1>
        <p className="text-sm text-muted-foreground mt-1">
          비즈니스 타입을 정의합니다 (Invoice, Contract 등)
        </p>
      </div>

      <div className="flex-1 min-h-0">
        <Suspense fallback={<div>로딩 중...</div>}>
          <TypeList initialTypes={types} availablePolicies={policies} />
        </Suspense>
      </div>

      <div className="flex-shrink-0 mt-1 mb-1">
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

