'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function createGroup(data: {
  name: string
  description?: string | null
  parentId?: string | null
  isActive: boolean
}) {
  try {
    const group = await prisma.group.create({
      data,
    })

    revalidatePath('/admin/groups')
    return { success: true, data: group }
  } catch (error) {
    console.error('Group 생성 에러:', error)
    return { success: false, error: '생성 실패' }
  }
}

export async function updateGroup(
  id: string,
  data: {
    name?: string
    description?: string | null
    parentId?: string | null
    isActive?: boolean
  }
) {
  try {
    const group = await prisma.group.update({
      where: { id },
      data,
    })

    revalidatePath('/admin/groups')
    return { success: true, data: group }
  } catch (error) {
    console.error('Group 수정 에러:', error)
    return { success: false, error: '수정 실패' }
  }
}

export async function deleteGroup(id: string) {
  try {
    await prisma.group.delete({
      where: { id },
    })

    revalidatePath('/admin/groups')
    return { success: true }
  } catch (error) {
    console.error('Group 삭제 에러:', error)
    return { success: false, error: '삭제 실패' }
  }
}

export async function getGroupDependencies(id: string) {
  try {
    const [childrenCount, permissionsCount, userGroupsCount] = await Promise.all([
      prisma.group.count({ where: { parentId: id } }),
      prisma.permission.count({ where: { groupId: id } }),
      prisma.userGroup.count({ where: { groupId: id } }),
    ])

    return {
      success: true,
      data: {
        children: childrenCount,
        permissions: permissionsCount,
        userGroups: userGroupsCount,
      },
    }
  } catch (error) {
    console.error('종속성 조회 에러:', error)
    return { success: false, error: '조회 실패' }
  }
}

export async function getAllGroups() {
  try {
    const groups = await prisma.group.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return { success: true, data: groups }
  } catch (error) {
    console.error('Group 목록 조회 에러:', error)
    return { success: false, error: '조회 실패' }
  }
}

