// Type API - 단일 항목
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = {
  params: Promise<{
    id: string
  }>
}

// GET /api/types/:id
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const include = searchParams.get('include')

    const includeOptions: any = {}
    if (include) {
      const includes = include.split(',')
      if (includes.includes('parent')) {
        includeOptions.parent = true
      }
      if (includes.includes('children')) {
        includeOptions.children = true
      }
      if (includes.includes('policy')) {
        includeOptions.policy = true
      }
      if (includes.includes('objects')) {
        includeOptions.objects = true
      }
      if (includes.includes('typeAttributes')) {
        includeOptions.typeAttributes = {
          include: {
            attribute: true,
          },
        }
      }
    }

    const type = await prisma.type.findUnique({
      where: { id },
      include: Object.keys(includeOptions).length > 0 ? includeOptions : undefined,
    })

    if (!type) {
      return NextResponse.json(
        { success: false, error: 'Type을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: type,
    })
  } catch (error) {
    console.error('Type 조회 실패:', error)
    return NextResponse.json(
      { success: false, error: 'Type을 가져오지 못했습니다.' },
      { status: 500 }
    )
  }
}

// PATCH /api/types/:id
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, prefix, policyId, parentId } = body

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (prefix !== undefined) updateData.prefix = prefix
    if (policyId !== undefined) updateData.policyId = policyId
    if (parentId !== undefined) updateData.parentId = parentId

    const updatedType = await prisma.type.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      data: updatedType,
    })
  } catch (error) {
    console.error('Type 수정 실패:', error)
    return NextResponse.json(
      { success: false, error: 'Type을 수정하지 못했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE /api/types/:id
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params

    await prisma.type.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Type이 삭제되었습니다.' })
  } catch (error: unknown) {
    console.error('Type 삭제 실패:', error)
    
    // Foreign key constraint 에러 체크
    if (error instanceof Error && error.message.includes('Foreign key constraint')) {
      return NextResponse.json(
        { success: false, error: '자식 항목이 있어 삭제할 수 없습니다.' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Type을 삭제하지 못했습니다.' },
      { status: 500 }
    )
  }
}
