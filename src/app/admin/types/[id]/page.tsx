import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { TypeDetail } from '@/components/admin/types/TypeDetail'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Params = { params: Promise<{ id: string }> }

async function getTypeWithAttributes(id: string) {
  const type = await prisma.type.findUnique({
    where: { id },
    include: {
      policy: {
        select: {
          id: true,
          name: true,
          version: true,
        },
      },
      typeAttributes: {
        select: {
          id: true,
          attribute: {
            select: {
              id: true,
              key: true,
              label: true,
              attrType: true,
              isRequired: true,
              defaultValue: true,
              validation: true,
            },
          },
        },
        orderBy: {
          attribute: {
            key: 'asc',
          },
        },
      },
      _count: {
        select: {
          typeAttributes: true,
          instances: true,
        },
      },
    },
  })

  if (!type) return null

  return type
}

export default async function TypeDetailPage({ params }: Params) {
  const { id } = await params
  const typeData = await getTypeWithAttributes(id)

  if (!typeData) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{typeData.name}</h1>
        <p className="text-muted-foreground mt-2">
          {typeData.policy.name} v{typeData.policy.version}
        </p>
      </div>
      <Suspense fallback={<div>로딩 중...</div>}>
        <TypeDetail type={typeData} />
      </Suspense>
    </div>
  )
}

