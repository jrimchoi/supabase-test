'use server'

import { prisma } from '@/lib/prisma'

export async function addUserToGroup(groupId: string, userId: string) {
  try {
    await prisma.userGroup.create({
      data: {
        groupId,
        userId,
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Error adding user to group:', error)
    return { success: false, error: 'Failed to add user to group' }
  }
}

export async function removeUserFromGroup(groupId: string, userId: string) {
  try {
    await prisma.userGroup.deleteMany({
      where: {
        groupId,
        userId,
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Error removing user from group:', error)
    return { success: false, error: 'Failed to remove user from group' }
  }
}
