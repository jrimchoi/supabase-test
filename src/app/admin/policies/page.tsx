import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { PolicyList } from '@/components/admin/policies/PolicyList'

export const metadata = {
  title: 'Policy 관리',
  description: '권한 정책 관리 페이지',
}

// ISR: 30초 캐싱, 데이터 변경 시 자동 revalidate
// searchParams 제거로 Static/ISR 가능!
export const revalidate = 30

async function getAllPolicies() {
  const policies = await prisma.policy.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      revisionSequence: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { name: 'asc' },
  })

  return policies
}

export default async function PoliciesPage() {
  const policies = await getAllPolicies()

  return (
    <div className="admin-page-container">
      <div className="flex-1 min-h-0">
        <Suspense fallback={<div>로딩 중...</div>}>
          <PolicyList initialPolicies={policies} />
        </Suspense>
      </div>
    </div>
  )
}

