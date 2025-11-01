'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function addUserToGroup(groupId: string, userId: string) {
  try {
    const existing = await prisma.userGroup.findUnique({
      where: { userId_groupId: { userId, groupId } },
    })

    if (existing) {
      return { success: false, error: '이미 할당된 사용자입니다' }
    }

    await prisma.userGroup.create({
      data: { userId, groupId },
    })

    // 여러 경로 무효화
    revalidatePath(`/admin/groups/${groupId}`)
    revalidatePath('/admin/groups')
    revalidatePath('/admin')
    
    return { success: true }
  } catch (error) {
    console.error('사용자 할당 에러:', error)
    return { success: false, error: '할당 실패' }
  }
}

export async function removeUserFromGroup(groupId: string, userId: string) {
  try {
    await prisma.userGroup.delete({
      where: { userId_groupId: { userId, groupId } },
    })

    // 여러 경로 무효화
    revalidatePath(`/admin/groups/${groupId}`)
    revalidatePath('/admin/groups')
    revalidatePath('/admin')
    
    return { success: true }
  } catch (error) {
    console.error('사용자 제거 에러:', error)
    return { success: false, error: '제거 실패' }
  }
}

