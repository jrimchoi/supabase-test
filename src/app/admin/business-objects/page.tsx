import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { BusinessObjectList } from '@/components/admin/business-objects/BusinessObjectList'

export const metadata = {
  title: 'BusinessObject 관리',
  description: '비즈니스 객체 인스턴스 관리',
}

// ISR 캐싱 활성화 (10초마다 revalidate)
export const revalidate = 10

async function getAllBusinessObjects() {
  const queryStart = performance.now()
  
  const objects = await prisma.businessObject.findMany({
    take: 50,
    select: {
      id: true,
      name: true,
      revision: true,
      currentState: true,
      description: true,
      owner: true,
      createdAt: true,
      updatedAt: true,
      type: {
        select: {
          id: true,
          name: true,
          description: true,
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
    orderBy: { createdAt: 'desc' },
  })
  
  const queryTime = (performance.now() - queryStart).toFixed(2)
  console.log(`✅ BusinessObject 조회: ${objects.length}개, ${queryTime}ms`)

  return objects
}

export default async function BusinessObjectsPage() {
  const objects = await getAllBusinessObjects()

  return (
    <div className="admin-page-container">
      <div className="flex-1 min-h-0">
        <Suspense fallback={<div>로딩 중...</div>}>
          {/* 클라이언트 컴포넌트에서 페이징 처리 */}
          <BusinessObjectList initialObjects={objects} />
        </Suspense>
      </div>
    </div>
  )
}

