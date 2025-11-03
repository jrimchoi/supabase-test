import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { RoleDetail } from '@/components/admin/roles/RoleDetail'
import { notFound } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// ISR: 30초 캐싱, 데이터 변경 시 자동 revalidate
export const revalidate = 30

type Params = { params: Promise<{ id: string }> }

async function getRoleWithDetails(id: string) {
  const roleData = await prisma.role.findUnique({
    where: { id },
    include: {
      userRoles: {
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
          userRoles: true,
        },
      },
    },
  })

  if (!roleData) return null

  // userRoles를 users 형태로 변환
  const users = roleData.userRoles.map((ur) => ur.user)

  return {
    ...roleData,
    users,
  }
}

export default async function RoleDetailPage({ params }: Params) {
  const { id } = await params
  const roleData = await getRoleWithDetails(id)

  if (!roleData) notFound()

  return (
    <div className="admin-page-container">
      <div className="admin-list-wrapper">
        {/* 헤더 카드: 타이틀 + 정보 */}
        <div className="admin-header-wrapper">
          <Card>
            <CardContent className="admin-header-card-content">
              <h1 className="text-lg font-bold tracking-tight">Role 상세</h1>
              <p className="text-sm text-muted-foreground">{roleData.name}</p>
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                <Badge variant={roleData.isActive ? "default" : "secondary"} className="text-xs">
                  {roleData.isActive ? '활성' : '비활성'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Suspense fallback={<div>로딩 중...</div>}>
          <RoleDetail role={roleData} />
        </Suspense>
      </div>
    </div>
  )
}
