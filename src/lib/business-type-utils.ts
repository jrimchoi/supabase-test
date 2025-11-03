/**
 * Type 유틸리티 함수
 * 
 * 속성 상속 로직 (prefix, name)
 * - Type의 속성이 없으면 부모로부터 상속
 * - 재귀적으로 상위 계층까지 탐색
 */

import { prisma } from './prisma'

export type InheritedTypeAttributes = {
  prefix: string
  name: string
}

/**
 * Type의 상속된 속성 조회
 * 
 * @param typeId - Type ID
 * @returns prefix와 name (상속 적용)
 */
export async function getInheritedTypeAttributes(
  typeId: string
): Promise<InheritedTypeAttributes> {
  const type = await prisma.type.findUnique({
    where: { id: typeId },
    select: {
      name: true,
      description: true,
      prefix: true,
      parentId: true,
      parent: {
        select: {
          id: true,
          description: true,
          prefix: true,
        },
      },
    },
  })

  if (!type) {
    throw new Error(`Type not found: ${typeId}`)
  }

  // 기본값
  const defaultPrefix = 'DOC'
  const defaultName = type.name

  // prefix 결정
  let prefix = type.prefix
  if (!prefix && type.parentId) {
    // 부모로부터 상속 (재귀)
    const parentAttrs = await getInheritedTypeAttributes(type.parentId)
    prefix = parentAttrs.prefix
  }
  prefix = prefix || defaultPrefix

  // description 결정
  let description = type.description
  if (!description && type.parentId) {
    // 부모로부터 상속 (재귀)
    const parentAttrs = await getInheritedTypeAttributes(type.parentId)
    description = parentAttrs.name // 부모의 name을 상속
  }
  const name = description || defaultName

  return { prefix, name }
}

/**
 * Type 계층 구조 조회
 * 
 * @param typeId - Type ID
 * @returns 루트부터 현재 타입까지의 경로 (array)
 */
export async function getTypeHierarchy(typeId: string): Promise<string[]> {
  const hierarchy: string[] = []
  let currentId: string | null = typeId

  while (currentId) {
    const type = await prisma.type.findUnique({
      where: { id: currentId },
      select: {
        name: true,
        parentId: true,
      },
    })

    if (!type) break

    hierarchy.unshift(type.name) // 앞에 추가 (루트 → 현재)
    currentId = type.parentId
  }

  return hierarchy
}

/**
 * Type 전체 트리 조회 (계층 구조)
 * 
 * @param policyId - Policy ID (옵션)
 * @returns 트리 구조
 */
export async function getTypeTree(policyId?: string) {
  const where = policyId ? { policyId, parentId: null } : { parentId: null }

  const rootTypes = await prisma.type.findMany({
    where,
    include: {
      children: {
        include: {
          children: {
            include: {
              children: true, // 3단계까지
            },
          },
        },
      },
    },
  })

  return rootTypes
}

