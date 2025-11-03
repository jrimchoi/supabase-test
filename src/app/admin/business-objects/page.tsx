import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { BusinessObjectList } from '@/components/admin/business-objects/BusinessObjectList'

export const metadata = {
  title: 'BusinessObject 관리',
  description: '비즈니스 객체 인스턴스 관리',
}

// ISR: 10초 캐싱, 데이터 변경 시 자동 revalidate (자주 변경됨)
// searchParams 제거로 Static/ISR 가능!
export const revalidate = 10

async function getAllBusinessObjects() {
  // 최근 200개만 가져오기 (성능 최적화)
  // 더 많은 데이터가 필요하면 limit을 늘리세요
  const objects = await prisma.businessObject.findMany({
    take: 200,  // 최근 200개로 제한
    select: {
      id: true,
      typeId: true,
      name: true,
      revision: true,
      policyId: true,
      currentState: true,
      description: true,
      owner: true,
      createdBy: true,
      updatedBy: true,
      data: true,
      createdAt: true,
      updatedAt: true,
      type: { select: { id: true, name: true, description: true, prefix: true } },
      policy: { select: { id: true, name: true, revisionSequence: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

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

