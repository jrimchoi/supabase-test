/**
 * State 관련 타입 정의
 * Prisma Generated Types 기반
 */

import { Prisma } from '@prisma/client'

// ============================================
// Query Definitions
// ============================================

/**
 * State 상세 조회 쿼리
 */
export const stateDetailQuery = Prisma.validator<Prisma.StateDefaultArgs>()({
  include: {
    policy: {
      select: {
        id: true,
        name: true,
      },
    },
    transitionsFrom: {
      include: {
        toState: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    },
    transitionsTo: {
      include: {
        fromState: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    },
    _count: {
      select: {
        permissions: true,
        userPermissions: true,
      },
    },
  },
})

/**
 * State 리스트 조회 쿼리
 */
export const stateListQuery = Prisma.validator<Prisma.StateDefaultArgs>()({
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
        transitionsFrom: true,
        transitionsTo: true,
      },
    },
  },
})

// ============================================
// Type Definitions
// ============================================

/**
 * State 상세 타입
 */
export type StateDetail = Prisma.StateGetPayload<typeof stateDetailQuery>

/**
 * State 리스트 항목 타입
 */
export type StateListItem = Prisma.StateGetPayload<typeof stateListQuery>

/**
 * State 생성 입력 타입
 */
export type StateCreateInput = Prisma.StateCreateInput

/**
 * State 업데이트 입력 타입
 */
export type StateUpdateInput = Prisma.StateUpdateInput

