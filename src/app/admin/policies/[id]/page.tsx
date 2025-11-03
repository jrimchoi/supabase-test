import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { PolicyDetail } from '@/components/admin/policies/PolicyDetail'
import { notFound } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Params = { params: Promise<{ id: string }> }

async function getPolicyWithDetails(id: string) {
  const policyData = await prisma.policy.findUnique({
    where: { id },
    include: {
      policyTypes: {
        include: {
          type: {
            select: {
              id: true,
              name: true,
              prefix: true,
              description: true,
            },
          },
        },
      },
      _count: {
        select: {
          states: true,
          policyTypes: true,
          types: true,
          businessObjects: true,
        },
      },
    },
  })

  if (!policyData) return null

  // policyTypes에서 type 객체만 추출
  const types = policyData.policyTypes.map((pt) => pt.type)

  return { ...policyData, types }
}

export default async function PolicyDetailPage({ params }: Params) {
  const { id } = await params
  const policyData = await getPolicyWithDetails(id)

  if (!policyData) notFound()

  return (
    <div className="admin-page-container">
      <div className="admin-list-wrapper">
        {/* 헤더 카드: 타이틀 + 정보 */}
        <div className="admin-header-wrapper">
          <Card>
            <CardContent className="admin-header-card-content">
              <h1 className="text-lg font-bold tracking-tight">Policy 상세</h1>
              <p className="text-sm text-muted-foreground">{policyData.name}</p>
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                <Badge variant={policyData.isActive ? 'default' : 'secondary'} className="text-xs">
                  {policyData.isActive ? '활성' : '비활성'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Suspense fallback={<div>로딩 중...</div>}>
          <PolicyDetail policy={policyData} />
        </Suspense>
      </div>
    </div>
  )
}

