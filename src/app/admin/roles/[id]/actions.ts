'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function addUserToRole(roleId: string, userId: string) {
  try {
    // 이미 할당되어 있는지 확인
    const existing = await prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    })

    if (existing) {
      return { success: false, error: '이미 할당된 사용자입니다' }
    }

    await prisma.userRole.create({
      data: {
        userId,
        roleId,
      },
    })

    // 여러 경로 무효화
    revalidatePath(`/admin/roles/${roleId}`)
    revalidatePath('/admin/roles')
    revalidatePath('/admin')
    
    return { success: true }
  } catch (error) {
    console.error('사용자 할당 에러:', error)
    return { success: false, error: '할당 실패' }
  }
}

export async function removeUserFromRole(roleId: string, userId: string) {
  try {
    await prisma.userRole.delete({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    })

    // 여러 경로 무효화
    revalidatePath(`/admin/roles/${roleId}`)
    revalidatePath('/admin/roles')
    revalidatePath('/admin')
    
    return { success: true }
  } catch (error) {
    console.error('사용자 제거 에러:', error)
    return { success: false, error: '제거 실패' }
  }
}

