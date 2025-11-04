/**
 * Relationship & BusinessObjectRelationship 관련 타입 정의
 * Prisma Generated Types 기반
 */

import { Prisma } from '@prisma/client'

// ============================================
// Query Definitions
// ============================================

/**
 * Relationship 상세 조회 쿼리
 */
export const relationshipDetailQuery = Prisma.validator<Prisma.RelationshipDefaultArgs>()({
  include: {
    fromType: {
      select: {
        id: true,
        name: true,
      },
    },
    toType: {
      select: {
        id: true,
        name: true,
      },
    },
  },
})

/**
 * BusinessObjectRelationship 상세 조회 쿼리
 */
export const businessObjectRelationshipDetailQuery = Prisma.validator<Prisma.BusinessObjectRelationshipDefaultArgs>()({
  include: {
    relationship: {
      include: {
        fromType: {
          select: {
            id: true,
            name: true,
          },
        },
        toType: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    },
    fromObject: {
      include: {
        type: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    },
    toObject: {
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
 * Relationship 상세 타입
 */
export type RelationshipDetail = Prisma.RelationshipGetPayload<
  typeof relationshipDetailQuery
>

/**
 * BusinessObjectRelationship 상세 타입
 */
export type BusinessObjectRelationshipDetail = Prisma.BusinessObjectRelationshipGetPayload<
  typeof businessObjectRelationshipDetailQuery
>

