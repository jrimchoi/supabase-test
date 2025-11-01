'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function createType(data: { name: string; policyId: string }) {
  try {
    const type = await prisma.type.create({ data })
    revalidatePath('/admin/types')
    return { success: true, data: type }
  } catch (error) {
    console.error('Type 생성 에러:', error)
    return { success: false, error: '생성 실패' }
  }
}

export async function updateType(id: string, data: { name?: string }) {
  try {
    const type = await prisma.type.update({ where: { id }, data })
    revalidatePath('/admin/types')
    return { success: true, data: type }
  } catch (error) {
    console.error('Type 수정 에러:', error)
    return { success: false, error: '수정 실패' }
  }
}

export async function deleteType(id: string) {
  try {
    await prisma.type.delete({ where: { id } })
    revalidatePath('/admin/types')
    return { success: true }
  } catch (error) {
    console.error('Type 삭제 에러:', error)
    return { success: false, error: '삭제 실패' }
  }
}

export async function getTypeDependencies(id: string) {
  try {
    const [typeAttributesCount, instancesCount] = await Promise.all([
      prisma.typeAttribute.count({ where: { typeId: id } }),
      prisma.businessObject.count({ where: { typeId: id } }),
    ])

    return {
      success: true,
      data: { attributes: typeAttributesCount, instances: instancesCount },
    }
  } catch (error) {
    console.error('종속성 조회 에러:', error)
    return { success: false, error: '조회 실패' }
  }
}

