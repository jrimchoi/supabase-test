import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { StateList } from '@/components/admin/states/StateList'
import { Loading } from '@/components/ui/loading'

export const metadata = {
  title: 'State 관리',
  description: '상태 관리 페이지',
}

// ISR: 30초 캐싱, 데이터 변경 시 자동 revalidate
// searchParams 제거로 Static/ISR 가능!
export const revalidate = 30

async function getAllData() {
  const [states, policies] = await Promise.all([
    prisma.state.findMany({
      include: {
        policy: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            permissions: true,
            fromTransitions: true,
            toTransitions: true,
          },
        },
      },
      orderBy: [
        { policyId: 'asc' },
        { order: 'asc' },
      ],
    }),
    prisma.policy.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    }),
  ])

  return { states, policies }
}

export default async function StatesPage() {
  const { states, policies } = await getAllData()

  return (
    <div className="admin-page-container">
      <div className="flex-1 min-h-0">
        <Suspense fallback={<Loading />}>
          <StateList initialStates={states} availablePolicies={policies} />
        </Suspense>
      </div>
    </div>
  )
}

