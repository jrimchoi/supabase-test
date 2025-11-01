// BusinessAttribute CRUD API - EAV 패턴 속성 값 관리
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/business-attributes/[id] - BusinessAttribute 단일 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const include = searchParams.get('include')

    const businessAttribute = await prisma.businessAttribute.findUnique({
      where: { id },
      include: {
        ...(include?.includes('object') && { object: true }),
      },
    })

    if (!businessAttribute) {
      return NextResponse.json(
        { success: false, error: 'BusinessAttribute를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: businessAttribute })
  } catch (error) {
    console.error('BusinessAttribute 조회 실패:', error)
    return NextResponse.json(
      { success: false, error: 'BusinessAttribute를 조회하지 못했습니다.' },
      { status: 500 }
    )
  }
}

// PATCH /api/business-attributes/[id] - BusinessAttribute 수정 (EAV 값 수정)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { valueString, valueInteger, valueReal, valueDate, valueBoolean, valueJson } = body

    const businessAttribute = await prisma.businessAttribute.update({
      where: { id },
      data: {
        ...(valueString !== undefined && { valueString }),
        ...(valueInteger !== undefined && { valueInteger }),
        ...(valueReal !== undefined && { valueReal }),
        ...(valueDate !== undefined && { valueDate: valueDate ? new Date(valueDate) : null }),
        ...(valueBoolean !== undefined && { valueBoolean }),
        ...(valueJson !== undefined && { valueJson }),
      },
    })

    return NextResponse.json({ success: true, data: businessAttribute })
  } catch (error) {
    console.error('BusinessAttribute 수정 실패:', error)
    return NextResponse.json(
      { success: false, error: 'BusinessAttribute를 수정하지 못했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE /api/business-attributes/[id] - BusinessAttribute 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.businessAttribute.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'BusinessAttribute가 삭제되었습니다.' })
  } catch (error) {
    console.error('BusinessAttribute 삭제 실패:', error)
    return NextResponse.json(
      { success: false, error: 'BusinessAttribute를 삭제하지 못했습니다.' },
      { status: 500 }
    )
  }
}

