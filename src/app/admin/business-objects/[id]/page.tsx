import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { BusinessObjectPageClient } from '@/components/admin/business-objects/BusinessObjectPageClient'
import { Loading } from '@/components/ui/loading'
import { notFound } from 'next/navigation'

// ISR: 10초 캐싱, 데이터 변경 시 자동 revalidate
export const revalidate = 10

type Params = { params: Promise<{ id: string }> }

async function getBusinessObjectWithDetails(id: string) {
  const obj = await prisma.businessObject.findUnique({
    where: { id },
    include: {
      type: {
        select: {
          id: true,
          name: true,
          prefix: true,
          description: true,
          policy: {
            select: {
              id: true,
              name: true,
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
        },
      },
      policy: {
        select: {
          id: true,
          name: true,
          revisionSequence: true,
        },
      },
    },
  })

  if (!obj) return null

  // 디버깅: 로드된 데이터 확인
  console.log('===== BusinessObject 상세 디버깅 =====')
  console.log('obj.id:', obj.id)
  console.log('obj.name:', obj.name)
  console.log('obj.typeId:', obj.typeId)
  console.log('obj.type:', obj.type)
  console.log('obj.type?.typeAttributes:', obj.type?.typeAttributes)
  console.log('typeAttributes length:', obj.type?.typeAttributes?.length)
  if (obj.type?.typeAttributes) {
    obj.type.typeAttributes.forEach((ta: any, idx: number) => {
      console.log(`  [${idx}] ${ta.attribute.label} (${ta.attribute.name}):`, ta.attribute)
    })
  }
  console.log('obj.data:', obj.data)
  console.log('=====================================')

  return obj
}

export default async function BusinessObjectDetailPage({ params }: Params) {
  const { id } = await params
  const objectData = await getBusinessObjectWithDetails(id)

  if (!objectData) notFound()

  return (
    <div className="admin-page-container">
      <Suspense fallback={<Loading />}>
        <BusinessObjectPageClient objectData={objectData} />
      </Suspense>
    </div>
  )
}

