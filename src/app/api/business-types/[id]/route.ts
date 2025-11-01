// BusinessType CRUD API - 단일 조회, 수정, 삭제
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/business-types/[id] - BusinessType 단일 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const businessType = await prisma.businessType.findUnique({
      where: { id },
    })

    if (!businessType) {
      return NextResponse.json(
        { success: false, error: 'BusinessType을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: businessType })
  } catch (error) {
    console.error('BusinessType 조회 실패:', error)
    return NextResponse.json(
      { success: false, error: 'BusinessType을 조회하지 못했습니다.' },
      { status: 500 }
    )
  }
}

// PATCH /api/business-types/[id] - BusinessType 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, policy } = body

    const businessType = await prisma.businessType.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(policy !== undefined && { policy }),
      },
    })

    return NextResponse.json({ success: true, data: businessType })
  } catch (error) {
    console.error('BusinessType 수정 실패:', error)
    return NextResponse.json(
      { success: false, error: 'BusinessType을 수정하지 못했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE /api/business-types/[id] - BusinessType 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.businessType.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'BusinessType이 삭제되었습니다.' })
  } catch (error) {
    console.error('BusinessType 삭제 실패:', error)
    return NextResponse.json(
      { success: false, error: 'BusinessType을 삭제하지 못했습니다.' },
      { status: 500 }
    )
  }
}

