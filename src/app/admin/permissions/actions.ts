'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function createPermission(data: {
  stateId: string
  resource: string
  action: string
  targetType: string
  roleId?: string
  groupId?: string
  userId?: string
  expression?: string
  isAllowed: boolean
}) {
  try {
    const permission = await prisma.permission.create({
      data: {
        stateId: data.stateId,
        resource: data.resource,
        action: data.action,
        targetType: data.targetType,
        roleId: data.roleId,
        groupId: data.groupId,
        userId: data.userId,
        expression: data.expression,
        isAllowed: data.isAllowed,
      },
    })

    revalidatePath('/admin/permissions')
    return { success: true, data: permission }
  } catch (error) {
    console.error('Permission 생성 에러:', error)
    return { success: false, error: '생성 실패' }
  }
}

export async function updatePermission(
  id: string,
  data: {
    resource?: string
    action?: string
    expression?: string
    isAllowed?: boolean
  }
) {
  try {
    const permission = await prisma.permission.update({
      where: { id },
      data,
    })

    revalidatePath('/admin/permissions')
    return { success: true, data: permission }
  } catch (error) {
    console.error('Permission 수정 에러:', error)
    return { success: false, error: '수정 실패' }
  }
}

export async function deletePermission(id: string) {
  try {
    await prisma.permission.delete({
      where: { id },
    })

    revalidatePath('/admin/permissions')
    return { success: true }
  } catch (error) {
    console.error('Permission 삭제 에러:', error)
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

export async function getAllRoles() {
  try {
    const roles = await prisma.role.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    })

    return { success: true, data: roles }
  } catch (error) {
    console.error('Role 목록 조회 에러:', error)
    return { success: false, error: '조회 실패', data: [] }
  }
}

export async function getAllGroups() {
  try {
    const groups = await prisma.group.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    })

    return { success: true, data: groups }
  } catch (error) {
    console.error('Group 목록 조회 에러:', error)
    return { success: false, error: '조회 실패', data: [] }
  }
}

