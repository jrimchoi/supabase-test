import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { GroupList } from '@/components/admin/groups/GroupList'

export const metadata = {
  title: 'Group 관리',
  description: '그룹 관리 페이지',
}

// ISR: 60초 캐싱, 데이터 변경 시 자동 revalidate
// searchParams 제거로 Static/ISR 가능!
export const revalidate = 60

async function getAllGroups() {
  const groups = await prisma.group.findMany({
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
  })

  return groups
}

export default async function GroupsPage() {
  const groups = await getAllGroups()

  return (
    <div className="admin-page-container">
      <div className="flex-1 min-h-0">
        <Suspense fallback={<div>로딩 중...</div>}>
          <GroupList initialGroups={groups} />
        </Suspense>
      </div>
    </div>
  )
}

