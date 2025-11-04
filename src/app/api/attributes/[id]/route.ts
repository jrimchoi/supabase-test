// Attribute CRUD API - 단일 조회, 수정, 삭제
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/attributes/[id] - Attribute 단일 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const include = searchParams.get('include')

    const attribute = await prisma.attribute.findUnique({
      where: { id },
    })

    if (!attribute) {
      return NextResponse.json(
        { success: false, error: 'Attribute를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: attribute })
  } catch (error) {
    console.error('Attribute 조회 실패:', error)
    return NextResponse.json(
      { success: false, error: 'Attribute를 조회하지 못했습니다.' },
      { status: 500 }
    )
  }
}

// PATCH /api/attributes/[id] - Attribute 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, label, attrType, isRequired, defaultValue, validation } = body

    // attrType 검증
    if (attrType) {
      const validTypes = ['STRING', 'INTEGER', 'REAL', 'DATE', 'BOOLEAN', 'JSON', 'ENUM']
      if (!validTypes.includes(attrType)) {
        return NextResponse.json(
          { 
            success: false, 
            error: `attrType은 ${validTypes.join(', ')} 중 하나여야 합니다.` 
          },
          { status: 400 }
        )
      }
    }

    const attribute = await prisma.attribute.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(label !== undefined && { label }),
        ...(attrType !== undefined && { attrType }),
        ...(isRequired !== undefined && { isRequired }),
        ...(defaultValue !== undefined && { defaultValue }),
        ...(validation !== undefined && { validation }),
      },
    })

    return NextResponse.json({ success: true, data: attribute })
  } catch (error) {
    console.error('Attribute 수정 실패:', error)
    return NextResponse.json(
      { success: false, error: 'Attribute를 수정하지 못했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE /api/attributes/[id] - Attribute 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.attribute.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Attribute가 삭제되었습니다.' })
  } catch (error) {
    console.error('Attribute 삭제 실패:', error)
    return NextResponse.json(
      { success: false, error: 'Attribute를 삭제하지 못했습니다.' },
      { status: 500 }
    )
  }
}

