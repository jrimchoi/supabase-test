import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { TransitionList } from '@/components/admin/transitions/TransitionList'

export const metadata = {
  title: 'StateTransition 관리',
  description: 'State 간 전이 관계를 정의합니다',
}

// ISR: 30초 캐싱, 데이터 변경 시 자동 revalidate
export const revalidate = 30

async function getAllData() {
  // 모든 데이터를 한 번에 가져오기 (캐싱 적용됨)
  const [transitions, states] = await Promise.all([
    prisma.stateTransition.findMany({
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
    }),
    prisma.state.findMany({
      select: {
        id: true,
        name: true,
        policyId: true,
        policy: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        { policyId: 'asc' },
        { order: 'asc' },
      ],
    }),
  ])

  return { transitions, states }
}

export default async function TransitionsPage() {
  const { transitions, states } = await getAllData()

  return (
    <div className="admin-page-container">
      <div className="flex-1 min-h-0">
        <Suspense fallback={<div>로딩 중...</div>}>
          <TransitionList
            initialTransitions={transitions}
            availableStates={states}
          />
        </Suspense>
      </div>
    </div>
  )
}

