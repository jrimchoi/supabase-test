'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function createPolicy(data: {
  name: string
  version: number
  isActive: boolean
}) {
  try {
    const policy = await prisma.policy.create({
      data,
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
    version?: number
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

export async function deactivateOtherPolicies(name: string, excludeId: string) {
  try {
    await prisma.policy.updateMany({
      where: {
        name,
        id: { not: excludeId },
      },
      data: {
        isActive: false,
      },
    })

    revalidatePath('/admin/policies')
    return { success: true }
  } catch (error) {
    console.error('Policy 비활성화 에러:', error)
    return { success: false, error: '비활성화 실패' }
  }
}

export async function getDependencies(id: string) {
  try {
    const [statesCount, typesCount, businessObjectsCount] = await Promise.all([
      prisma.state.count({ where: { policyId: id } }),
      prisma.type.count({ where: { policyId: id } }),
      prisma.businessObject.count({ where: { policyId: id } }),
    ])

    return {
      success: true,
      data: {
        states: statesCount,
        types: typesCount,
        businessObjects: businessObjectsCount,
      },
    }
  } catch (error) {
    console.error('종속성 조회 에러:', error)
    return { success: false, error: '조회 실패' }
  }
}

