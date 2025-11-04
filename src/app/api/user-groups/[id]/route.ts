// UserGroup CRUD API - 단일 조회, 삭제
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/user-groups/[id] - UserGroup 단일 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const include = searchParams.get('include')

    const userGroup = await prisma.userGroup.findUnique({
      where: { id },
      include: {
        ...(include?.includes('group') && { group: true }),
      },
    })

    if (!userGroup) {
      return NextResponse.json(
        { success: false, error: 'UserGroup을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: userGroup })
  } catch (error) {
    console.error('UserGroup 조회 실패:', error)
    return NextResponse.json(
      { success: false, error: 'UserGroup을 조회하지 못했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE /api/user-groups/[id] - UserGroup 삭제 (User에게서 Group 제거)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.userGroup.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'UserGroup이 삭제되었습니다.' })
  } catch (error) {
    console.error('UserGroup 삭제 실패:', error)
    return NextResponse.json(
      { success: false, error: 'UserGroup을 삭제하지 못했습니다.' },
      { status: 500 }
    )
  }
}

