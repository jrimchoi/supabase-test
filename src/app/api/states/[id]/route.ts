// State CRUD API - 단일 조회, 수정, 삭제
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/states/[id] - State 단일 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const include = searchParams.get('include')

    const state = await prisma.state.findUnique({
      where: { id },
      include: {
        ...(include?.includes('policy') && { policy: true }),
        ...(include?.includes('transitions') && {
          fromTransitions: true,
          toTransitions: true,
        }),
        ...(include?.includes('permissions') && { permissions: true }),
      },
    })

    if (!state) {
      return NextResponse.json(
        { success: false, error: 'State를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: state })
  } catch (error) {
    console.error('State 조회 실패:', error)
    return NextResponse.json(
      { success: false, error: 'State를 조회하지 못했습니다.' },
      { status: 500 }
    )
  }
}

// PATCH /api/states/[id] - State 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, order, isInitial, isFinal } = body

    const state = await prisma.state.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(order !== undefined && { order }),
        ...(isInitial !== undefined && { isInitial }),
        ...(isFinal !== undefined && { isFinal }),
      },
    })

    return NextResponse.json({ success: true, data: state })
  } catch (error) {
    console.error('State 수정 실패:', error)
    return NextResponse.json(
      { success: false, error: 'State를 수정하지 못했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE /api/states/[id] - State 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.state.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'State가 삭제되었습니다.' })
  } catch (error) {
    console.error('State 삭제 실패:', error)
    return NextResponse.json(
      { success: false, error: 'State를 삭제하지 못했습니다.' },
      { status: 500 }
    )
  }
}

