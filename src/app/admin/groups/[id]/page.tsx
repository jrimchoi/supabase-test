import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { GroupDetail } from '@/components/admin/groups/GroupDetail'
import { notFound } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// ISR: 30초 캐싱, 데이터 변경 시 자동 revalidate
export const revalidate = 30

type Params = { params: Promise<{ id: string }> }

async function getGroupWithDetails(id: string) {
  const groupData = await prisma.group.findUnique({
    where: { id },
    include: {
      parent: {
        select: {
          id: true,
          name: true,
        },
      },
      userGroups: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              full_name: true,
              name: true,
              avatar_url: true,
            },
          },
        },
      },
      _count: {
        select: {
          permissions: true,
          userGroups: true,
          children: true,
        },
      },
    },
  })

  if (!groupData) return null

  // userGroups를 users 형태로 변환
  const users = groupData.userGroups.map((ug) => ug.user)

  return {
    ...groupData,
    users,
  }
}

export default async function GroupDetailPage({ params }: Params) {
  const { id } = await params
  const groupData = await getGroupWithDetails(id)

  if (!groupData) notFound()

  return (
    <div className="admin-page-container">
      <div className="admin-list-wrapper">
        {/* 헤더 카드: 타이틀 + 정보 */}
        <div className="admin-header-wrapper">
          <Card>
            <CardContent className="admin-header-card-content">
              <h1 className="text-lg font-bold tracking-tight">Group 상세</h1>
              <p className="text-sm text-muted-foreground">{groupData.name}</p>
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                {groupData.parent && (
                  <>
                    <span className="text-xs text-muted-foreground">부모:</span>
                    <Badge variant="outline" className="text-xs">{groupData.parent.name}</Badge>
                  </>
                )}
                <Badge variant={groupData.isActive ? "default" : "secondary"} className="text-xs">
                  {groupData.isActive ? '활성' : '비활성'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Suspense fallback={<div>로딩 중...</div>}>
          <GroupDetail group={groupData} />
        </Suspense>
      </div>
    </div>
  )
}
