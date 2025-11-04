'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function updateBusinessObject(
  id: string,
  data: {
    currentState?: string
    description?: string
    data?: any
  }
) {
  try {
    const businessObject = await prisma.businessObject.update({
      where: { id },
      data,
    })

    revalidatePath('/admin/business-objects')
    revalidatePath(`/admin/business-objects/${id}`)
    return { success: true, data: businessObject }
  } catch (error) {
    console.error('BusinessObject 수정 에러:', error)
    return { success: false, error: '수정 실패' }
  }
}

export async function deleteBusinessObject(id: string) {
  try {
    await prisma.businessObject.delete({ where: { id } })
    
    revalidatePath('/admin/business-objects')
    return { success: true }
  } catch (error) {
    console.error('BusinessObject 삭제 에러:', error)
    return { success: false, error: '삭제 실패' }
  }
}

export async function getAvailableStates(policyId: string) {
  try {
    const states = await prisma.state.findMany({
      where: { policyId },
      select: {
        id: true,
        name: true,
        description: true,
        order: true,
        isInitial: true,
        isFinal: true,
      },
      orderBy: { order: 'asc' },
    })

    return { success: true, data: states }
  } catch (error) {
    console.error('State 목록 조회 에러:', error)
    return { success: false, error: '조회 실패', data: [] }
  }
}

