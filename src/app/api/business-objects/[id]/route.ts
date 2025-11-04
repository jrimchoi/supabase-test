// BusinessObject CRUD API - 단일 조회, 수정, 삭제
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/business-objects/[id] - BusinessObject 단일 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const include = searchParams.get('include')

    const businessObject = await prisma.businessObject.findUnique({
      where: { id },
      include: {
        ...(include?.includes('type') && { type: true }),
        ...(include?.includes('policy') && { policy: true }),
        ...(include?.includes('attributes') && { attributes: true }),
      },
    })

    if (!businessObject) {
      return NextResponse.json(
        { success: false, error: 'BusinessObject를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: businessObject })
  } catch (error) {
    console.error('BusinessObject 조회 실패:', error)
    return NextResponse.json(
      { success: false, error: 'BusinessObject를 조회하지 못했습니다.' },
      { status: 500 }
    )
  }
}

// PATCH /api/business-objects/[id] - BusinessObject 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { typeId, policyId, currentState, data } = body

    const businessObject = await prisma.businessObject.update({
      where: { id },
      data: {
        ...(typeId !== undefined && { typeId }),
        ...(policyId !== undefined && { policyId }),
        ...(currentState !== undefined && { currentState }),
        ...(data !== undefined && { data }),
      },
    })

    return NextResponse.json({ success: true, data: businessObject })
  } catch (error) {
    console.error('BusinessObject 수정 실패:', error)
    return NextResponse.json(
      { success: false, error: 'BusinessObject를 수정하지 못했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE /api/business-objects/[id] - BusinessObject 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.businessObject.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'BusinessObject가 삭제되었습니다.' })
  } catch (error) {
    console.error('BusinessObject 삭제 실패:', error)
    return NextResponse.json(
      { success: false, error: 'BusinessObject를 삭제하지 못했습니다.' },
      { status: 500 }
    )
  }
}

