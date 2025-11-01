'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserSearchPanel } from '../users/UserSearchPanel'
import { AssignedUsersList } from '../users/AssignedUsersList'
import { addUserToRole, removeUserFromRole } from '@/app/admin/roles/[id]/actions'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

type User = {
  id: string
  email: string | null
  full_name: string | null
  name: string | null
  avatar_url: string | null
}

type RoleData = {
  id: string
  name: string
  description: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  users: User[]
  _count: {
    permissions: number
    userRoles: number
  }
}

export function RoleDetail({ role }: { role: RoleData }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  // 디버깅: role 데이터 확인
  console.log('🎯 RoleDetail - role.users:', role.users)
  console.log('🎯 RoleDetail - role._count.userRoles:', role._count.userRoles)

  const handleAddUser = async (userId: string) => {
    startTransition(async () => {
      const result = await addUserToRole(role.id, userId)
      if (result.success) {
        // 페이지 데이터 새로고침
        router.refresh()
        // 잠시 후 다시 한 번 새로고침 (Supabase 캐시 대응)
        setTimeout(() => router.refresh(), 100)
      } else {
        alert(result.error || '추가 실패')
      }
    })
  }

  const handleRemoveUser = async (userId: string) => {
    if (!confirm('이 사용자를 Role에서 제거하시겠습니까?')) return

    startTransition(async () => {
      const result = await removeUserFromRole(role.id, userId)
      if (result.success) {
        // 페이지 데이터 새로고침
        router.refresh()
        // 잠시 후 다시 한 번 새로고침 (Supabase 캐시 대응)
        setTimeout(() => router.refresh(), 100)
      } else {
        alert(result.error || '제거 실패')
      }
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 왼쪽: Role 정보 & 할당된 사용자 */}
      <div className="space-y-6">
        {/* Role 속성 */}
        <Card>
          <CardHeader>
            <CardTitle>Role 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">이름</span>
              <span className="font-medium">{role.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">상태</span>
              <Badge variant={role.isActive ? 'default' : 'outline'}>
                {role.isActive ? '활성' : '비활성'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">권한 수</span>
              <span className="font-medium">{role._count.permissions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">사용자 수</span>
              <span className="font-medium">{role._count.userRoles}</span>
            </div>
          </CardContent>
        </Card>

        {/* 할당된 사용자 리스트 */}
        <Card>
          <CardHeader>
            <CardTitle>할당된 사용자 ({role.users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <AssignedUsersList
              users={role.users}
              onRemove={handleRemoveUser}
              isPending={isPending}
            />
          </CardContent>
        </Card>
      </div>

      {/* 오른쪽: 사용자 검색 & 추가 */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>사용자 검색 및 추가</CardTitle>
          </CardHeader>
          <CardContent>
            <UserSearchPanel
              onAddUser={handleAddUser}
              excludeUserIds={role.users.map((u) => u.id)}
              isPending={isPending}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

