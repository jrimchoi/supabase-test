'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function createAttribute(data: {
  name: string
  label: string
  description?: string | null
  attrType: string
  isRequired: boolean
  defaultValue?: string | null
  validation?: string | null
}) {
  try {
    const attribute = await prisma.attribute.create({ data })
    
    revalidatePath('/admin/attributes')
    revalidatePath('/admin')
    
    return { success: true, data: attribute }
  } catch (error) {
    console.error('Attribute 생성 에러:', error)
    return { success: false, error: '생성 실패' }
  }
}

export async function updateAttribute(id: string, data: any) {
  try {
    const attribute = await prisma.attribute.update({ where: { id }, data })
    revalidatePath('/admin/attributes')
    return { success: true, data: attribute }
  } catch (error) {
    return { success: false, error: '수정 실패' }
  }
}

export async function deleteAttribute(id: string) {
  try {
    await prisma.attribute.delete({ where: { id } })
    
    // 여러 경로 무효화
    revalidatePath('/admin/attributes')
    revalidatePath('/admin/types')
    revalidatePath('/admin')
    
    return { success: true }
  } catch (error) {
    console.error('Attribute 삭제 에러:', error)
    return { success: false, error: '삭제 실패' }
  }
}

export async function assignAttributeToType(attributeId: string, typeId: string) {
  try {
    // 이미 할당되어 있는지 확인
    const existing = await prisma.typeAttribute.findUnique({
      where: {
        typeId_attributeId: {
          typeId,
          attributeId,
        },
      },
    })

    if (existing) {
      return { success: false, error: '이미 할당된 Attribute입니다' }
    }

    // TypeAttribute 생성 (할당)
    const typeAttribute = await prisma.typeAttribute.create({
      data: {
        typeId,
        attributeId,
      },
    })

    // 여러 경로 무효화
    revalidatePath('/admin/attributes')
    revalidatePath(`/admin/types/${typeId}`)
    revalidatePath('/admin/types')
    revalidatePath('/admin')

    return { success: true, data: typeAttribute }
  } catch (error) {
    console.error('Attribute 할당 에러:', error)
    return { success: false, error: 'Attribute 할당 실패' }
  }
}

export async function unassignAttributeFromType(typeAttributeId: string, typeId: string) {
  try {
    await prisma.typeAttribute.delete({
      where: { id: typeAttributeId },
    })

    // 여러 경로 무효화
    revalidatePath('/admin/attributes')
    revalidatePath(`/admin/types/${typeId}`)
    revalidatePath('/admin/types')
    revalidatePath('/admin')

    return { success: true }
  } catch (error) {
    console.error('Attribute 할당 해제 에러:', error)
    return { success: false, error: 'Attribute 할당 해제 실패' }
  }
}

