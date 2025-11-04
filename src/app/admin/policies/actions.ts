'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function createPolicy(data: {
  name: string
  description?: string
  revisionSequence?: string
  isActive: boolean
}) {
  try {
    const policy = await prisma.policy.create({
      data: {
        name: data.name,
        description: data.description,
        revisionSequence: data.revisionSequence || 'A,B,C',
        isActive: data.isActive,
      },
    })

    revalidatePath('/admin/policies')
    return { success: true, data: policy }
  } catch (error) {
    console.error('Policy 생성 에러:', error)
    return { success: false, error: '생성 실패' }
  }
}

export async function updatePolicy(
  id: string,
  data: {
    name?: string
    description?: string
    revisionSequence?: string
    isActive?: boolean
  }
) {
  try {
    const policy = await prisma.policy.update({
      where: { id },
      data,
    })

    revalidatePath('/admin/policies')
    return { success: true, data: policy }
  } catch (error) {
    console.error('Policy 수정 에러:', error)
    return { success: false, error: '수정 실패' }
  }
}

export async function deletePolicy(id: string) {
  try {
    await prisma.policy.delete({
      where: { id },
    })

    revalidatePath('/admin/policies')
    return { success: true }
  } catch (error) {
    console.error('Policy 삭제 에러:', error)
    return { success: false, error: '삭제 실패' }
  }
}

// Policy name이 unique하므로 deactivateOtherPolicies 불필요
// export async function deactivateOtherPolicies(name: string, excludeId: string) {
//   try {
//     await prisma.policy.updateMany({
//       where: {
//         name,
//         id: { not: excludeId },
//       },
//       data: {
//         isActive: false,
//       },
//     })
//
//     revalidatePath('/admin/policies')
//     return { success: true }
//   } catch (error) {
//     console.error('Policy 비활성화 에러:', error)
//     return { success: false, error: '비활성화 실패' }
//   }
// }

export async function getDependencies(id: string) {
  try {
    const [statesCount, typesCount, policyTypesCount, businessObjectsCount] = await Promise.all([
      prisma.state.count({ where: { policyId: id } }),
      prisma.type.count({ where: { policyId: id } }), // 기본 Policy로 사용하는 Type
      prisma.policyType.count({ where: { policyId: id } }), // PolicyType 연결
      prisma.businessObject.count({ where: { policyId: id } }),
    ])

    return {
      success: true,
      data: {
        states: statesCount,
        policyTypes: policyTypesCount, // PolicyType 연결
        types: typesCount, // 기본 Policy
        businessObjects: businessObjectsCount,
      },
    }
  } catch (error) {
    console.error('종속성 조회 에러:', error)
    return { success: false, error: '조회 실패' }
  }
}

export async function getAllTypes() {
  try {
    const types = await prisma.type.findMany({
      select: {
        id: true,
        name: true,
        description: true,
      },
      orderBy: { name: 'asc' },
    })

    return { success: true, data: types }
  } catch (error) {
    console.error('Type 목록 조회 에러:', error)
    return { success: false, error: '조회 실패', data: [] }
  }
}

export async function searchTypes(query: string) {
  try {
    if (query.length < 2) {
      return { success: true, data: [] }
    }

    const types = await prisma.type.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        description: true,
        prefix: true,
      },
      take: 20,
      orderBy: { name: 'asc' },
    })

    return { success: true, data: types }
  } catch (error) {
    console.error('Type 검색 에러:', error)
    return { success: false, error: '검색 실패', data: [] }
  }
}

export async function getPolicyTypes(policyId: string) {
  try {
    const policyTypes = await prisma.policyType.findMany({
      where: { policyId },
      include: {
        type: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    })

    return { success: true, data: policyTypes }
  } catch (error) {
    console.error('PolicyType 조회 에러:', error)
    return { success: false, error: '조회 실패', data: [] }
  }
}

export async function addPolicyType(policyId: string, typeId: string) {
  try {
    const policyType = await prisma.policyType.create({
      data: {
        policyId,
        typeId,
      },
    })

    revalidatePath('/admin/policies')
    return { success: true, data: policyType }
  } catch (error: unknown) {
    console.error('PolicyType 추가 에러:', error)
    
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return { success: false, error: '이미 추가된 Type입니다.' }
    }
    
    return { success: false, error: '추가 실패' }
  }
}

export async function removePolicyType(policyId: string, typeId: string) {
  try {
    await prisma.policyType.deleteMany({
      where: {
        policyId,
        typeId,
      },
    })

    revalidatePath('/admin/policies')
    return { success: true }
  } catch (error) {
    console.error('PolicyType 제거 에러:', error)
    return { success: false, error: '제거 실패' }
  }
}

