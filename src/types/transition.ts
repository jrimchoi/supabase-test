/**
 * StateTransition 관련 타입 정의
 * Prisma Generated Types 기반
 */

import { Prisma } from '@prisma/client'

// ============================================
// Query Definitions
// ============================================

/**
 * StateTransition 리스트 조회 쿼리
 */
export const transitionListQuery = Prisma.validator<Prisma.StateTransitionDefaultArgs>()({
  include: {
    fromState: {
      select: {
        id: true,
        name: true,
        policyId: true,
        policy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    },
    toState: {
      select: {
        id: true,
        name: true,
      },
    },
  },
})

// ============================================
// Type Definitions
// ============================================

/**
 * StateTransition 리스트 항목 타입
 */
export type TransitionListItem = Prisma.StateTransitionGetPayload<typeof transitionListQuery>

/**
 * StateTransition 생성 입력 타입
 */
export type TransitionCreateInput = Prisma.StateTransitionCreateInput

/**
 * StateTransition 업데이트 입력 타입
 */
export type TransitionUpdateInput = Prisma.StateTransitionUpdateInput

