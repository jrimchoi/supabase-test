import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { RoleList } from '@/components/admin/roles/RoleList'

export const metadata = {
  title: 'Role 관리',
  description: '역할 관리 페이지',
}

// ISR: 60초 캐싱, 데이터 변경 시 자동 revalidate
// searchParams 제거로 Static/ISR 가능!
export const revalidate = 60

async function getAllRoles() {
  const roles = await prisma.role.findMany({
    include: {
      _count: {
        select: {
          permissions: true,
          userRoles: true,
        },
      },
      userRoles: {
        select: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return roles
}

export default async function RolesPage() {
  const roles = await getAllRoles()

  return (
    <div className="admin-page-container">
      <div className="flex-1 min-h-0">
        <Suspense fallback={<div>로딩 중...</div>}>
          <RoleList initialRoles={roles} />
        </Suspense>
      </div>
    </div>
  )
}

