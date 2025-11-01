// StateTransition CRUD API - 단일 조회, 수정, 삭제
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/state-transitions/[id] - StateTransition 단일 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const include = searchParams.get('include')

    const transition = await prisma.stateTransition.findUnique({
      where: { id },
      include: {
        ...(include?.includes('states') && {
          fromState: true,
          toState: true,
        }),
      },
    })

    if (!transition) {
      return NextResponse.json(
        { success: false, error: 'StateTransition을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: transition })
  } catch (error) {
    console.error('StateTransition 조회 실패:', error)
    return NextResponse.json(
      { success: false, error: 'StateTransition을 조회하지 못했습니다.' },
      { status: 500 }
    )
  }
}

// PATCH /api/state-transitions/[id] - StateTransition 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { condition, order } = body

    const transition = await prisma.stateTransition.update({
      where: { id },
      data: {
        ...(condition !== undefined && { condition }),
        ...(order !== undefined && { order }),
      },
    })

    return NextResponse.json({ success: true, data: transition })
  } catch (error) {
    console.error('StateTransition 수정 실패:', error)
    return NextResponse.json(
      { success: false, error: 'StateTransition을 수정하지 못했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE /api/state-transitions/[id] - StateTransition 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.stateTransition.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'StateTransition이 삭제되었습니다.' })
  } catch (error) {
    console.error('StateTransition 삭제 실패:', error)
    return NextResponse.json(
      { success: false, error: 'StateTransition을 삭제하지 못했습니다.' },
      { status: 500 }
    )
  }
}

