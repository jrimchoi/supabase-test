// UserPermission CRUD API - 단일 조회, 수정, 삭제
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/user-permissions/[id] - UserPermission 단일 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const userPermission = await prisma.userPermission.findUnique({
      where: { id },
    })

    if (!userPermission) {
      return NextResponse.json(
        { success: false, error: 'UserPermission을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: userPermission })
  } catch (error) {
    console.error('UserPermission 조회 실패:', error)
    return NextResponse.json(
      { success: false, error: 'UserPermission을 조회하지 못했습니다.' },
      { status: 500 }
    )
  }
}

// PATCH /api/user-permissions/[id] - UserPermission 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { expression, isAllowed } = body

    const userPermission = await prisma.userPermission.update({
      where: { id },
      data: {
        ...(expression !== undefined && { expression }),
        ...(isAllowed !== undefined && { isAllowed }),
      },
    })

    return NextResponse.json({ success: true, data: userPermission })
  } catch (error) {
    console.error('UserPermission 수정 실패:', error)
    return NextResponse.json(
      { success: false, error: 'UserPermission을 수정하지 못했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE /api/user-permissions/[id] - UserPermission 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.userPermission.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'UserPermission이 삭제되었습니다.' })
  } catch (error) {
    console.error('UserPermission 삭제 실패:', error)
    return NextResponse.json(
      { success: false, error: 'UserPermission을 삭제하지 못했습니다.' },
      { status: 500 }
    )
  }
}

