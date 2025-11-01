'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function createState(data: {
  name: string
  description?: string | null
  policyId: string
  order: number
  isInitial: boolean
  isFinal: boolean
}) {
  try {
    const state = await prisma.state.create({
      data,
    })

    revalidatePath('/admin/states')
    return { success: true, data: state }
  } catch (error) {
    console.error('State 생성 에러:', error)
    return { success: false, error: '생성 실패' }
  }
}

export async function updateState(
  id: string,
  data: {
    name?: string
    description?: string | null
    order?: number
    isInitial?: boolean
    isFinal?: boolean
  }
) {
  try {
    const state = await prisma.state.update({
      where: { id },
      data,
    })

    revalidatePath('/admin/states')
    return { success: true, data: state }
  } catch (error) {
    console.error('State 수정 에러:', error)
    return { success: false, error: '수정 실패' }
  }
}

export async function deleteState(id: string) {
  try {
    await prisma.state.delete({
      where: { id },
    })

    revalidatePath('/admin/states')
    return { success: true }
  } catch (error) {
    console.error('State 삭제 에러:', error)
    return { success: false, error: '삭제 실패' }
  }
}

export async function getStateDependencies(id: string) {
  try {
    const [permissionsCount, fromTransitionsCount, toTransitionsCount] =
      await Promise.all([
        prisma.permission.count({ where: { stateId: id } }),
        prisma.stateTransition.count({ where: { fromStateId: id } }),
        prisma.stateTransition.count({ where: { toStateId: id } }),
      ])

    return {
      success: true,
      data: {
        permissions: permissionsCount,
        fromTransitions: fromTransitionsCount,
        toTransitions: toTransitionsCount,
      },
    }
  } catch (error) {
    console.error('종속성 조회 에러:', error)
    return { success: false, error: '조회 실패' }
  }
}

