import { Suspense } from 'react'
import { BusinessObjectRelationshipList } from '@/components/admin/business-relations/BusinessObjectRelationshipList'
import { Loading } from '@/components/ui/loading'
import { prisma } from '@/lib/prisma'

export const metadata = {
  title: 'BusinessObject Relationship 관리',
  description: 'BusinessObject 인스턴스 간 관계 관리',
}

export const revalidate = 30

async function getAllData() {
  const objectRelationships = await prisma.businessObjectRelationship.findMany({
    include: {
      relationship: {
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
      },
      fromObject: {
        select: {
          id: true,
          name: true,
          description: true,
          type: {
            select: { name: true },
          },
        },
      },
      toObject: {
        select: {
          id: true,
          name: true,
          description: true,
          type: {
            select: { name: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100, // 최대 100개
  })

  return objectRelationships
}

export default async function BusinessObjectRelationshipsPage() {
  const objectRelationships = await getAllData()

  return (
    <div className="admin-page-container">
      <div className="admin-list-wrapper">
        <Suspense fallback={<Loading />}>
          <BusinessObjectRelationshipList initialData={objectRelationships} />
        </Suspense>
      </div>
    </div>
  )
}

