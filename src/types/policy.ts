/**
 * Policy 관련 타입 정의
 * Prisma Generated Types 기반
 */

import { Prisma } from '@prisma/client'

// ============================================
// Query Definitions
// ============================================

/**
 * Policy 상세 조회 쿼리 (States 포함)
 */
export const policyDetailQuery = Prisma.validator<Prisma.PolicyDefaultArgs>()({
  include: {
    states: {
      orderBy: {
        order: 'asc',
      },
    },
    types: {
      select: {
        id: true,
        type: true,
        name: true,
      },
    },
    _count: {
      select: {
        states: true,
        types: true,
        businessObjects: true,
      },
    },
  },
})

/**
 * Policy 리스트 조회 쿼리
 */
export const policyListQuery = Prisma.validator<Prisma.PolicyDefaultArgs>()({
  include: {
    _count: {
      select: {
        states: true,
        types: true,
        businessObjects: true,
      },
    },
  },
})

// ============================================
// Type Definitions
// ============================================

/**
 * Policy 상세 타입
 */
export type PolicyDetail = Prisma.PolicyGetPayload<typeof policyDetailQuery>

/**
 * Policy 리스트 항목 타입
 */
export type PolicyListItem = Prisma.PolicyGetPayload<typeof policyListQuery>

/**
 * Policy 생성 입력 타입
 */
export type PolicyCreateInput = Prisma.PolicyCreateInput

/**
 * Policy 업데이트 입력 타입
 */
export type PolicyUpdateInput = Prisma.PolicyUpdateInput

