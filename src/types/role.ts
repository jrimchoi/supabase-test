/**
 * Role 관련 타입 정의
 * Prisma Generated Types 기반
 */

import { Prisma } from '@prisma/client'

// ============================================
// Query Definitions
// ============================================

/**
 * Role 상세 조회 쿼리
 */
export const roleDetailQuery = Prisma.validator<Prisma.RoleDefaultArgs>()({
  include: {
    userRoles: {
      select: {
        userId: true,
        createdAt: true,
      },
    },
    _count: {
      select: {
        userRoles: true,
      },
    },
  },
})

/**
 * Role 리스트 조회 쿼리
 */
export const roleListQuery = Prisma.validator<Prisma.RoleDefaultArgs>()({
  include: {
    _count: {
      select: {
        userRoles: true,
      },
    },
  },
})

// ============================================
// Type Definitions
// ============================================

/**
 * Role 상세 타입
 */
export type RoleDetail = Prisma.RoleGetPayload<typeof roleDetailQuery>

/**
 * Role 리스트 항목 타입
 */
export type RoleListItem = Prisma.RoleGetPayload<typeof roleListQuery>

/**
 * Role 생성 입력 타입
 */
export type RoleCreateInput = Prisma.RoleCreateInput

/**
 * Role 업데이트 입력 타입
 */
export type RoleUpdateInput = Prisma.RoleUpdateInput

