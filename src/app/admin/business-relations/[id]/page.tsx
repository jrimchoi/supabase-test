import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { BusinessObjectRelationshipForm } from '@/components/admin/business-relations/BusinessObjectRelationshipForm'
import { Loading } from '@/components/ui/loading'

type Props = {
  params: Promise<{ id: string }>
}

export default async function BusinessObjectRelationshipDetailPage({ params }: Props) {
  const { id } = await params

  if (id === 'new') {
    // 모든 관계 정의 조회 (선택용)
    const relationships = await prisma.relationship.findMany({
      select: {
        id: true,
        name: true,
        cardinality: true,
        fromType: {
          select: { id: true, name: true },
        },
        toType: {
          select: { id: true, name: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    return (
      <div className="admin-page-container">
        <Suspense fallback={<Loading />}>
          <BusinessObjectRelationshipForm relationships={relationships} />
        </Suspense>
      </div>
    )
  }

  const objectRelationship = await prisma.businessObjectRelationship.findUnique({
    where: { id },
    include: {
      relationship: {
        include: {
          fromType: true,
          toType: true,
        },
      },
      fromObject: {
        include: {
          type: true,
        },
      },
      toObject: {
        include: {
          type: true,
        },
      },
    },
  })

  if (!objectRelationship) {
    notFound()
  }

  const relationships = await prisma.relationship.findMany({
    select: {
      id: true,
      name: true,
      cardinality: true,
      fromType: {
        select: { id: true, name: true },
      },
      toType: {
        select: { id: true, name: true },
      },
    },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="admin-page-container">
      <Suspense fallback={<Loading />}>
        <BusinessObjectRelationshipForm
          objectRelationship={objectRelationship}
          relationships={relationships}
        />
      </Suspense>
    </div>
  )
}

