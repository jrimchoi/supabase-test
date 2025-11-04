import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { RelationshipForm } from '@/components/admin/relationships/RelationshipForm'
import { Loading } from '@/components/ui/loading'

type Props = {
  params: Promise<{ id: string }>
}

export default async function RelationshipDetailPage({ params }: Props) {
  const { id } = await params

  if (id === 'new') {
    return (
      <div className="admin-page-container">
        <Suspense fallback={<Loading />}>
          <RelationshipForm />
        </Suspense>
      </div>
    )
  }

  const relationship = await prisma.relationship.findUnique({
    where: { id },
    include: {
      fromType: true,
      toType: true,
      relationshipAttributes: {
        include: {
          attribute: true,
        },
      },
      objectRelationships: {
        take: 10,
        include: {
          fromObject: {
            select: { id: true, name: true, description: true },
          },
          toObject: {
            select: { id: true, name: true, description: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!relationship) {
    notFound()
  }

  return (
    <div className="admin-page-container">
      <Suspense fallback={<Loading />}>
        <RelationshipForm relationship={relationship} />
      </Suspense>
    </div>
  )
}

