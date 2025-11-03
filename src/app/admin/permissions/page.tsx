import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { PermissionList } from '@/components/admin/permissions/PermissionList'

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

async function getAllData() {
  // 모든 데이터를 한 번에 가져오기 (캐싱 적용됨)
  const [permissions, states, roles, groups] = await Promise.all([
    prisma.permission.findMany({
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
    }),
    prisma.state.findMany({
      select: {
        id: true,
        name: true,
        policyId: true,
        policy: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        { policyId: 'asc' },
        { order: 'asc' },
      ],
    }),
    prisma.role.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    }),
    prisma.group.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    }),
  ])

  return { permissions, states, roles, groups }
}

export default async function PermissionsPage() {
  const { permissions, states, roles, groups } = await getAllData()

  return (
    <div className="admin-page-container">
      <div className="flex-1 min-h-0">
        <Suspense fallback={<div>로딩 중...</div>}>
          <PermissionList
            initialPermissions={permissions}
            availableStates={states}
            availableRoles={roles}
            availableGroups={groups}
          />
        </Suspense>
      </div>
    </div>
  )
}

