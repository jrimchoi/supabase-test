import { Suspense } from 'react'
import { RelationshipList } from '@/components/admin/relationships/RelationshipList'
import { Loading } from '@/components/ui/loading'
import { prisma } from '@/lib/prisma'

export const metadata = {
  title: 'Relationship 관리',
  description: 'Type 간 관계 정의 관리',
}

export const revalidate = 30

async function getAllData() {
  const relationships = await prisma.relationship.findMany({
    include: {
      fromType: {
        select: { id: true, name: true, description: true },
      },
      toType: {
        select: { id: true, name: true, description: true },
      },
      _count: {
        select: {
          relationshipAttributes: true,
          objectRelationships: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return relationships
}

export default async function RelationshipsPage() {
  const relationships = await getAllData()

  return (
    <div className="admin-page-container">
      <div className="admin-list-wrapper">
        <Suspense fallback={<Loading />}>
          <RelationshipList initialData={relationships} />
        </Suspense>
      </div>
    </div>
  )
}

