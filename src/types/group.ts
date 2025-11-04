/**
 * Group 관련 타입 정의
 * Prisma Generated Types 기반
 */

import { Prisma } from '@prisma/client'

// ============================================
// Query Definitions
// ============================================

/**
 * Group 상세 조회 쿼리
 */
export const groupDetailQuery = Prisma.validator<Prisma.GroupDefaultArgs>()({
  include: {
    parent: {
      select: {
        id: true,
        name: true,
      },
    },
    userGroups: {
      select: {
        userId: true,
        createdAt: true,
      },
    },
    _count: {
      select: {
        children: true,
        permissions: true,
        userGroups: true,
      },
    },
  },
})

/**
 * Group 리스트 조회 쿼리
 */
export const groupListQuery = Prisma.validator<Prisma.GroupDefaultArgs>()({
  include: {
    parent: {
      select: {
        id: true,
        name: true,
      },
    },
    _count: {
      select: {
        children: true,
        userGroups: true,
        permissions: true,
      },
    },
  },
})

// ============================================
// Type Definitions
// ============================================

/**
 * Group 상세 타입
 */
export type GroupDetail = Prisma.GroupGetPayload<typeof groupDetailQuery>

/**
 * Group 리스트 항목 타입
 */
export type GroupListItem = Prisma.GroupGetPayload<typeof groupListQuery>

/**
 * Group 생성 입력 타입
 */
export type GroupCreateInput = Prisma.GroupCreateInput

/**
 * Group 업데이트 입력 타입
 */
export type GroupUpdateInput = Prisma.GroupUpdateInput

