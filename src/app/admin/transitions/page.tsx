import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { TransitionList } from '@/components/admin/transitions/TransitionList'
import { getAllStates } from './actions'

export const metadata = {
  title: 'StateTransition 관리',
  description: 'State 간 전이 관계를 정의합니다',
}

// ISR: 30초 캐싱, 데이터 변경 시 자동 revalidate
export const revalidate = 30

async function getTransitions() {
  const transitions = await prisma.stateTransition.findMany({
    include: {
      fromState: {
        select: {
          id: true,
          name: true,
          policy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      toState: { select: { id: true, name: true } },
    },
    orderBy: [
      { fromState: { policy: { name: 'asc' } } },
      { fromState: { name: 'asc' } },
      { createdAt: 'desc' },
    ],
  })

  return transitions
}

export default async function TransitionsPage() {
  const [transitions, statesResult] = await Promise.all([
    getTransitions(),
    getAllStates(),
  ])

  return (
    <div className="admin-page-container">
      <div className="flex-1 min-h-0">
        <Suspense fallback={<div>로딩 중...</div>}>
          <TransitionList
            initialTransitions={transitions}
            availableStates={statesResult.data || []}
          />
        </Suspense>
      </div>
    </div>
  )
}

