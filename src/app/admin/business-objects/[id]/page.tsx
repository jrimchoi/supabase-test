import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { BusinessObjectPageClient } from '@/components/admin/business-objects/BusinessObjectPageClient'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Params = { params: Promise<{ id: string }> }

async function getBusinessObjectWithDetails(id: string) {
  const obj = await prisma.businessObject.findUnique({
    where: { id },
    include: {
      type: {
        select: {
          id: true,
          type: true,
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
                  key: true,
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
                key: 'asc',
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
    obj.type.typeAttributes.forEach((ta, idx) => {
      console.log(`  [${idx}] ${ta.attribute.label} (${ta.attribute.key}):`, ta.attribute)
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
      <Suspense fallback={<div>로딩 중...</div>}>
        <BusinessObjectPageClient objectData={objectData} />
      </Suspense>
    </div>
  )
}

