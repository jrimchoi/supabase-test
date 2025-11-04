/**
 * Type 관련 타입 정의
 * Prisma Generated Types 기반
 */

import { Prisma } from '@prisma/client'

// ============================================
// Query Definitions
// ============================================

/**
 * Type 상세 조회 쿼리
 */
export const typeDetailQuery = Prisma.validator<Prisma.TypeDefaultArgs>()({
  include: {
    policy: {
      select: {
        id: true,
        name: true,
        revisionSequence: true,
      },
    },
    parent: {
      select: {
        id: true,
        type: true,
        name: true,
        description: true,
      },
    },
    typeAttributes: {
      include: {
        attribute: {
          select: {
            id: true,
            name: true,
            label: true,
            attrType: true,
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    },
    _count: {
      select: {
        children: true,
        objects: true,
        typeAttributes: true,
      },
    },
  },
})

/**
 * Type 리스트 조회 쿼리
 */
export const typeListQuery = Prisma.validator<Prisma.TypeDefaultArgs>()({
  include: {
    policy: {
      select: {
        name: true,
        revisionSequence: true,
      },
    },
    parent: {
      select: {
        id: true,
        name: true,
        description: true,
      },
    },
    _count: {
      select: {
        children: true,
        objects: true,
        typeAttributes: true,
      },
    },
  },
})

// ============================================
// Type Definitions
// ============================================

/**
 * Type 상세 타입
 */
export type TypeDetail = Prisma.TypeGetPayload<typeof typeDetailQuery>

/**
 * Type 리스트 항목 타입
 */
export type TypeListItem = Prisma.TypeGetPayload<typeof typeListQuery>

/**
 * Type 생성 입력 타입
 */
export type TypeCreateInput = Prisma.TypeCreateInput

/**
 * Type 업데이트 입력 타입
 */
export type TypeUpdateInput = Prisma.TypeUpdateInput

