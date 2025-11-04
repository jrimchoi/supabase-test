'use server'

import { prisma } from '@/lib/prisma'

export async function addUserToRole(roleId: string, userId: string) {
  try {
    await prisma.userRole.create({
      data: {
        roleId,
        userId,
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Error adding user to role:', error)
    return { success: false, error: 'Failed to add user to role' }
  }
}

export async function removeUserFromRole(roleId: string, userId: string) {
  try {
    await prisma.userRole.deleteMany({
      where: {
        roleId,
        userId,
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Error removing user from role:', error)
    return { success: false, error: 'Failed to remove user from role' }
  }
}
