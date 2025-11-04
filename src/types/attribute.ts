/**
 * Attribute 관련 타입 정의
 * Prisma Generated Types 기반
 */

import { Prisma } from '@prisma/client'

// ============================================
// Query Definitions
// ============================================

/**
 * Attribute 리스트 조회 쿼리
 */
export const attributeListQuery = Prisma.validator<Prisma.AttributeDefaultArgs>()({
  include: {
    typeAttributes: {
      include: {
        type: {
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
 * Attribute 리스트 항목 타입
 */
export type AttributeListItem = Prisma.AttributeGetPayload<typeof attributeListQuery>

/**
 * Attribute 생성 입력 타입
 */
export type AttributeCreateInput = Prisma.AttributeCreateInput

/**
 * Attribute 업데이트 입력 타입
 */
export type AttributeUpdateInput = Prisma.AttributeUpdateInput

