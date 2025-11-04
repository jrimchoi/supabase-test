/**
 * Permission 관련 타입 정의
 * Prisma Generated Types 기반
 */

import { Prisma } from '@prisma/client'

// ============================================
// Query Definitions
// ============================================

/**
 * Permission 리스트 조회 쿼리
 */
export const permissionListQuery = Prisma.validator<Prisma.PermissionDefaultArgs>()({
  include: {
    state: {
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
  },
})

// ============================================
// Type Definitions
// ============================================

/**
 * Permission 리스트 항목 타입
 */
export type PermissionListItem = Prisma.PermissionGetPayload<typeof permissionListQuery>

/**
 * Permission 생성 입력 타입
 */
export type PermissionCreateInput = Prisma.PermissionCreateInput

/**
 * Permission 업데이트 입력 타입
 */
export type PermissionUpdateInput = Prisma.PermissionUpdateInput

