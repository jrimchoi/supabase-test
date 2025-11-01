// Type CRUD API - 단일 조회, 수정, 삭제
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/types/[id] - Type 단일 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const include = searchParams.get('include')

    const type = await prisma.type.findUnique({
      where: { id },
      include: {
        ...(include?.includes('policy') && { policy: true }),
        ...(include?.includes('attributes') && { attributes: true }),
        ...(include?.includes('objects') && { businessObjects: true }),
      },
    })

    if (!type) {
      return NextResponse.json(
        { success: false, error: 'Type을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: type })
  } catch (error) {
    console.error('Type 조회 실패:', error)
    return NextResponse.json(
      { success: false, error: 'Type을 조회하지 못했습니다.' },
      { status: 500 }
    )
  }
}

// PATCH /api/types/[id] - Type 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, policyId } = body

    const type = await prisma.type.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(policyId !== undefined && { policyId }),
      },
    })

    return NextResponse.json({ success: true, data: type })
  } catch (error) {
    console.error('Type 수정 실패:', error)
    return NextResponse.json(
      { success: false, error: 'Type을 수정하지 못했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE /api/types/[id] - Type 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.type.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Type이 삭제되었습니다.' })
  } catch (error) {
    console.error('Type 삭제 실패:', error)
    return NextResponse.json(
      { success: false, error: 'Type을 삭제하지 못했습니다.' },
      { status: 500 }
    )
  }
}

