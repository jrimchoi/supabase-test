import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { TypeDetail } from '@/components/admin/types/TypeDetail'
import { notFound } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Params = { params: Promise<{ id: string }> }

async function getTypeWithDetails(id: string) {
  const typeData = await prisma.type.findUnique({
    where: { id },
    include: {
      policy: {
        select: {
          id: true,
          name: true,
        },
      },
      policyTypes: {
        include: {
          policy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      typeAttributes: {
        include: {
          attribute: {
            select: {
              id: true,
              name: true,
              label: true,
              description: true,
              attrType: true,
              isRequired: true,
              defaultValue: true,
              validation: true,
            },
          },
        },
        orderBy: {
          attribute: {
            name: 'asc',
          },
        },
      },
      _count: {
        select: {
          typeAttributes: true,
          objects: true,
        },
      },
    },
  })

  if (!typeData) return null

  return typeData
}

export default async function TypeDetailPage({ params }: Params) {
  const { id } = await params
  const typeData = await getTypeWithDetails(id)

  if (!typeData) notFound()

  return (
    <div className="admin-page-container">
      <div className="admin-list-wrapper">
        {/* 헤더 카드: 타이틀 + 정보 */}
        <div className="admin-header-wrapper">
          <Card>
            <CardContent className="admin-header-card-content">
              <h1 className="text-lg font-bold tracking-tight">Type 상세</h1>
              <p className="text-sm text-muted-foreground">{typeData.description || typeData.name}</p>
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Policy:</span>
                <Badge variant="outline" className="text-xs">{typeData.policy.name}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Suspense fallback={<div>로딩 중...</div>}>
          <TypeDetail type={typeData} />
        </Suspense>
      </div>
    </div>
  )
}
