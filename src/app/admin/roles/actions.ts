'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function createRole(data: {
  name: string
  description?: string | null
  isActive: boolean
}) {
  try {
    const role = await prisma.role.create({
      data,
    })

    revalidatePath('/admin/roles')
    return { success: true, data: role }
  } catch (error) {
    console.error('Role 생성 에러:', error)
    return { success: false, error: '생성 실패' }
  }
}

export async function updateRole(
  id: string,
  data: {
    name?: string
    description?: string | null
    isActive?: boolean
  }
) {
  try {
    const role = await prisma.role.update({
      where: { id },
      data,
    })

    revalidatePath('/admin/roles')
    return { success: true, data: role }
  } catch (error) {
    console.error('Role 수정 에러:', error)
    return { success: false, error: '수정 실패' }
  }
}

export async function deleteRole(id: string) {
  try {
    await prisma.role.delete({
      where: { id },
    })

    revalidatePath('/admin/roles')
    return { success: true }
  } catch (error) {
    console.error('Role 삭제 에러:', error)
    return { success: false, error: '삭제 실패' }
  }
}

export async function getRoleDependencies(id: string) {
  try {
    const [permissionsCount, userRolesCount] = await Promise.all([
      prisma.permission.count({ where: { roleId: id } }),
      prisma.userRole.count({ where: { roleId: id } }),
    ])

    return {
      success: true,
      data: {
        permissions: permissionsCount,
        userRoles: userRolesCount,
      },
    }
  } catch (error) {
    console.error('종속성 조회 에러:', error)
    return { success: false, error: '조회 실패' }
  }
}

