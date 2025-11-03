import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { BusinessObjectList } from '@/components/admin/business-objects/BusinessObjectList'

export const metadata = {
  title: 'BusinessObject 관리',
  description: '비즈니스 객체 인스턴스 관리',
}

// 🔍 성능 디버깅: 임시로 Dynamic 모드 (매번 로그 출력)
// 성능 확인 후 다시 revalidate = 10으로 변경!
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'  // Edge 대신 Node.js Runtime 사용 (로그 출력 보장)
// export const revalidate = 10

async function getAllBusinessObjects() {
  const pageStartTime = performance.now()
  
  // 명시적으로 stderr로 출력 (Vercel 로그 보장)
  console.error('📊 [BusinessObjects Page] 시작')
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  // DB 쿼리 성능 측정
  const queryStartTime = performance.now()
  console.error('🔍 [DB Query] 시작...')
  
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
  
  const queryDuration = performance.now() - queryStartTime
  console.error(`✅ [DB Query] 완료: ${queryDuration.toFixed(2)}ms`)
  console.error(`   - 조회 개수: ${objects.length}개`)
  console.error(`   - 평균: ${(queryDuration / Math.max(objects.length, 1)).toFixed(2)}ms/item`)
  
  // 데이터 크기 측정
  const dataSize = JSON.stringify(objects).length
  console.error(`📦 [Data Size] ${(dataSize / 1024).toFixed(2)} KB`)
  
  // 전체 페이지 로딩 시간
  const totalDuration = performance.now() - pageStartTime
  console.error(`⏱️  [Total] ${totalDuration.toFixed(2)}ms`)
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

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

