'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function createType(data: {
  name: string
  description?: string
  prefix?: string
  policyId: string
  parentId?: string | null
}) {
  try {
    const newType = await prisma.type.create({
      data: {
        name: data.name,
        description: data.description || null,
        prefix: data.prefix || null,
        policyId: data.policyId,
        parentId: data.parentId || null,
      },
    })

    revalidatePath('/admin/types')
    return { success: true, data: newType }
  } catch (error: unknown) {
    console.error('Type 생성 에러:', error)
    
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return { success: false, error: '이미 존재하는 name입니다.' }
    }
    
    return { success: false, error: '생성 실패' }
  }
}

export async function updateType(
  id: string,
  data: {
    name?: string
    description?: string | null
    prefix?: string | null
    policyId?: string
    parentId?: string | null
  }
) {
  try {
    const updatedType = await prisma.type.update({
      where: { id },
      data,
    })

    revalidatePath('/admin/types')
    return { success: true, data: updatedType }
  } catch (error) {
    console.error('Type 수정 에러:', error)
    return { success: false, error: '수정 실패' }
  }
}

export async function deleteType(id: string) {
  try {
    await prisma.type.delete({
      where: { id },
    })

    revalidatePath('/admin/types')
    return { success: true }
  } catch (error: unknown) {
    console.error('Type 삭제 에러:', error)
    
    if (error instanceof Error && error.message.includes('Foreign key')) {
      return { success: false, error: '자식 항목 또는 연결된 데이터가 있어 삭제할 수 없습니다.' }
    }
    
    return { success: false, error: '삭제 실패' }
  }
}

export async function getAllPolicies() {
  try {
    const policies = await prisma.policy.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        version: true,
        revisionSequence: true,
      },
      orderBy: [
        { name: 'asc' },
        { version: 'desc' },
      ],
    })

    return { success: true, data: policies }
  } catch (error) {
    console.error('Policy 목록 조회 에러:', error)
    return { success: false, error: '조회 실패', data: [] }
  }
}

export async function getAllTypes() {
  try {
    const types = await prisma.type.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        prefix: true,
      },
      orderBy: { name: 'asc' },
    })

    return { success: true, data: types }
  } catch (error) {
    console.error('Type 목록 조회 에러:', error)
    return { success: false, error: '조회 실패', data: [] }
    }
}
