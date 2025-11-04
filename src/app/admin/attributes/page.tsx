import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { AttributeList } from '@/components/admin/attributes/AttributeList'
import { Loading } from '@/components/ui/loading'

export const metadata = { title: 'Attribute 관리' }
// ISR: 60초 캐싱, 데이터 변경 시 자동 revalidate
// searchParams 제거로 Static/ISR 가능!
export const revalidate = 60

async function getAllAttributes() {
  const attributes = await prisma.attribute.findMany({
    include: {
      typeAttributes: {
        include: {
          type: {
            select: { id: true, name: true },
          },
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  })

  return attributes
}

export default async function AttributesPage() {
  const attributes = await getAllAttributes()

  return (
    <div className="admin-page-container">
      <div className="flex-1 min-h-0">
        <Suspense fallback={<Loading />}>
          <AttributeList initialAttributes={attributes} />
        </Suspense>
      </div>
    </div>
  )
}

