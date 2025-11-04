import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { PolicyList } from '@/components/admin/policies/PolicyList'
import { Loading } from '@/components/ui/loading'

export const metadata = {
  title: 'Policy 관리',
  description: '권한 정책 관리 페이지',
}

// ISR: 30초 캐싱, 데이터 변경 시 자동 revalidate
// searchParams 제거로 Static/ISR 가능!
export const revalidate = 30

async function getAllData() {
  const [policies, types] = await Promise.all([
    prisma.policy.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        revisionSequence: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        types: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.type.findMany({
      select: {
        id: true,
        name: true,
        policyId: true,
      },
    }),
  ])

  return { policies, types }
}

export default async function PoliciesPage() {
  const { policies, types } = await getAllData()

  return (
    <div className="admin-page-container">
      <div className="flex-1 min-h-0">
        <Suspense fallback={<Loading />}>
          <PolicyList initialPolicies={policies} allTypes={types} />
        </Suspense>
      </div>
    </div>
  )
}

