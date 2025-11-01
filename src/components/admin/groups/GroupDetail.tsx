'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserSearchPanel } from '../users/UserSearchPanel'
import { AssignedUsersList } from '../users/AssignedUsersList'
import { addUserToGroup, removeUserFromGroup } from '@/app/admin/groups/[id]/actions'
import { Badge } from '@/components/ui/badge'

type User = {
  id: string
  email: string | null
  full_name: string | null
  name: string | null
  avatar_url: string | null
}

type GroupData = {
  id: string
  name: string
  description: string | null
  isActive: boolean
  parent: { id: string; name: string } | null
  users: User[]
  _count: { children: number; permissions: number; userGroups: number }
}

export function GroupDetail({ group }: { group: GroupData }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleAddUser = async (userId: string) => {
    startTransition(async () => {
      const result = await addUserToGroup(group.id, userId)
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
    if (!confirm('이 사용자를 Group에서 제거하시겠습니까?')) return

    startTransition(async () => {
      const result = await removeUserFromGroup(group.id, userId)
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
      {/* 왼쪽: Group 정보 & 할당된 사용자 */}
      <div className="space-y-6">
        {/* Group 속성 */}
        <Card>
          <CardHeader>
            <CardTitle>Group 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">이름</span>
              <span className="font-medium">{group.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">상태</span>
              <Badge variant={group.isActive ? 'default' : 'outline'}>
                {group.isActive ? '활성' : '비활성'}
              </Badge>
            </div>
            {group.parent && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">부모 그룹</span>
                <Badge variant="outline">{group.parent.name}</Badge>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">하위 그룹</span>
              <span className="font-medium">{group._count.children}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">권한 수</span>
              <span className="font-medium">{group._count.permissions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">사용자 수</span>
              <span className="font-medium">{group._count.userGroups}</span>
            </div>
          </CardContent>
        </Card>

        {/* 할당된 사용자 리스트 */}
        <Card>
          <CardHeader>
            <CardTitle>할당된 사용자 ({group.users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <AssignedUsersList
              users={group.users}
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
              excludeUserIds={group.users.map((u) => u.id)}
              isPending={isPending}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

