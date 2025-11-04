/**
 * BusinessObject 관련 타입 정의
 * Prisma Generated Types 기반
 */

import { Prisma } from '@prisma/client'

// ============================================
// Query Definitions (재사용 가능한 쿼리 구조)
// ============================================

/**
 * BusinessObject 상세 조회 쿼리
 * - Type (계층 구조 포함)
 * - Policy
 * - TypeAttributes + Attributes
 */
export const businessObjectDetailQuery = Prisma.validator<Prisma.BusinessObjectDefaultArgs>()({
  include: {
    type: {
      include: {
        policy: {
          select: {
            id: true,
            name: true,
          },
        },
        typeAttributes: {
          include: {
            attribute: {
              select: {
                id: true,
                name: true,
                label: true,
                description: true,
                attrType: true,
                isRequired: true,
                defaultValue: true,
                validation: true,
              },
            },
          },
          orderBy: {
            attribute: {
              name: 'asc',
            },
          },
        },
      },
    },
    policy: {
      select: {
        id: true,
        name: true,
        revisionSequence: true,
      },
    },
  },
})

/**
 * BusinessObject 리스트 조회 쿼리 (요약 정보)
 */
export const businessObjectListQuery = Prisma.validator<Prisma.BusinessObjectDefaultArgs>()({
  include: {
    type: {
      select: {
        id: true,
        name: true,
        description: true,
      },
    },
    policy: {
      select: {
        id: true,
        name: true,
        revisionSequence: true,
      },
    },
  },
})

// ============================================
// Type Definitions (자동 생성)
// ============================================

/**
 * BusinessObject 상세 페이지용 타입
 * - owner, createdBy, updatedBy 포함
 * - Type 관계 전체 포함
 */
export type BusinessObjectDetail = Prisma.BusinessObjectGetPayload<
  typeof businessObjectDetailQuery
>

/**
 * BusinessObject 리스트 항목 타입
 */
export type BusinessObjectListItem = Prisma.BusinessObjectGetPayload<
  typeof businessObjectListQuery
>

/**
 * BusinessObject 생성 입력 타입
 */
export type BusinessObjectCreateInput = Prisma.BusinessObjectCreateInput

/**
 * BusinessObject 업데이트 입력 타입
 */
export type BusinessObjectUpdateInput = Prisma.BusinessObjectUpdateInput

