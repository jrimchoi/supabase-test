import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { GroupList } from '@/components/admin/groups/GroupList'
import { Pagination } from '@/components/ui/pagination'

export const metadata = {
  title: 'Group 관리',
  description: '그룹 관리 페이지',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

const DEFAULT_PAGE_SIZE = 20

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function getGroups(page: number, pageSize: number) {
  const skip = (page - 1) * pageSize

  const [groups, total] = await Promise.all([
    prisma.group.findMany({
      skip,
      take: pageSize,
      include: {
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            children: true,
            permissions: true,
            userGroups: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.group.count(),
  ])

  return { groups, total }
}

export default async function GroupsPage({ searchParams }: Props) {
  const params = await searchParams
  const page = typeof params.page === 'string' ? parseInt(params.page, 10) : 1
  const pageSizeParam = typeof params.pageSize === 'string' ? params.pageSize : String(DEFAULT_PAGE_SIZE)
  const pageSize = pageSizeParam === 'all' ? 999999 : parseInt(pageSizeParam, 10)
  
  const { groups, total } = await getGroups(page, pageSize)
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex-shrink-0 mb-3">
        <h1 className="text-2xl font-bold tracking-tight">Group 관리</h1>
        <p className="text-sm text-muted-foreground mt-1">
          사용자 그룹을 생성하고 관리합니다 (계층 구조 지원)
        </p>
      </div>

      <div className="flex-1 min-h-0">
        <Suspense fallback={<div>로딩 중...</div>}>
          <GroupList initialGroups={groups} />
        </Suspense>
      </div>

      <div className="flex-shrink-0 mt-1 mb-1">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalCount={total}
          pageSize={pageSize}
          baseUrl="/admin/groups"
        />
      </div>
    </div>
  )
}

