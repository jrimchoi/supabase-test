'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function addTypeToPolicy(policyId: string, typeId: string) {
  try {
    await prisma.policyType.create({
      data: {
        policyId,
        typeId,
      },
    })
    revalidatePath(`/admin/policies/${policyId}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function removeTypeFromPolicy(policyId: string, typeId: string) {
  try {
    await prisma.policyType.deleteMany({
      where: {
        policyId,
        typeId,
      },
    })
    revalidatePath(`/admin/policies/${policyId}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

