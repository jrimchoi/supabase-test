'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function createTransition(data: {
  fromStateId: string
  toStateId: string
  condition?: string
  order?: number
}) {
  try {
    const transition = await prisma.stateTransition.create({
      data: {
        fromStateId: data.fromStateId,
        toStateId: data.toStateId,
        condition: data.condition,
        order: data.order,
      },
    })

    revalidatePath('/admin/transitions')
    return { success: true, data: transition }
  } catch (error: unknown) {
    console.error('Transition 생성 에러:', error)
    
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return { success: false, error: '이미 존재하는 전이 관계입니다.' }
    }
    
    return { success: false, error: '생성 실패' }
  }
}

export async function updateTransition(
  id: string,
  data: {
    condition?: string
    order?: number
  }
) {
  try {
    const transition = await prisma.stateTransition.update({
      where: { id },
      data,
    })

    revalidatePath('/admin/transitions')
    return { success: true, data: transition }
  } catch (error) {
    console.error('Transition 수정 에러:', error)
    return { success: false, error: '수정 실패' }
  }
}

export async function deleteTransition(id: string) {
  try {
    await prisma.stateTransition.delete({
      where: { id },
    })

    revalidatePath('/admin/transitions')
    return { success: true }
  } catch (error) {
    console.error('Transition 삭제 에러:', error)
    return { success: false, error: '삭제 실패' }
  }
}

export async function getAllStates() {
  try {
    const states = await prisma.state.findMany({
      select: {
        id: true,
        name: true,
        policyId: true,
        policy: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        { policyId: 'asc' },
        { order: 'asc' },
      ],
    })

    return { success: true, data: states }
  } catch (error) {
    console.error('State 목록 조회 에러:', error)
    return { success: false, error: '조회 실패', data: [] }
  }
}

