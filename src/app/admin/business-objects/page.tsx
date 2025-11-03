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
  // 성능 측정 시작
  const startTime = performance.now()
  
  // 최근 50개만 가져오기 (성능 최적화)
  // data 필드 제거 (목록에서는 불필요, 상세 페이지에서만 사용)
  const objects = await prisma.businessObject.findMany({
    take: 50,  // 50개로 제한 (빠른 로딩)
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
      // data: true,  // ← 제거! (목록에서는 불필요)
      createdAt: true,
      updatedAt: true,
      type: { select: { id: true, name: true, description: true, prefix: true } },
      policy: { select: { id: true, name: true, revisionSequence: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  // 성능 측정 종료
  const duration = performance.now() - startTime
  
  // 항상 로그 (성능 모니터링)
  console.log(`🔍 [BusinessObjects] Query: ${duration.toFixed(2)}ms | Items: ${objects.length} | Avg: ${(duration / Math.max(objects.length, 1)).toFixed(2)}ms/item`)

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

