import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { PermissionList } from '@/components/admin/permissions/PermissionList'
import { getAllStates, getAllRoles, getAllGroups } from './actions'

export const metadata = {
  title: 'Permission 관리',
  description: 'State별 권한을 정의합니다',
}

// ISR: 30초 캐싱, 데이터 변경 시 자동 revalidate
export const revalidate = 30

async function getPermissions() {
  const permissions = await prisma.permission.findMany({
    include: {
      state: {
        select: {
          id: true,
          name: true,
          policy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      role: { select: { id: true, name: true } },
      group: { select: { id: true, name: true } },
    },
    orderBy: [
      { state: { policy: { name: 'asc' } } },
      { state: { name: 'asc' } },
      { createdAt: 'desc' },
    ],
  })

  return permissions
}

export default async function PermissionsPage() {
  const [
    permissions,
    statesResult,
    rolesResult,
    groupsResult,
  ] = await Promise.all([
    getPermissions(),
    getAllStates(),
    getAllRoles(),
    getAllGroups(),
  ])

  return (
    <div className="admin-page-container">
      <div className="flex-1 min-h-0">
        <Suspense fallback={<div>로딩 중...</div>}>
          <PermissionList
            initialPermissions={permissions}
            availableStates={statesResult.data || []}
            availableRoles={rolesResult.data || []}
            availableGroups={groupsResult.data || []}
          />
        </Suspense>
      </div>
    </div>
  )
}

