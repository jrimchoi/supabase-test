// UserRole CRUD API - 단일 조회, 삭제
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/user-roles/[id] - UserRole 단일 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const include = searchParams.get('include')

    const userRole = await prisma.userRole.findUnique({
      where: { id },
      include: {
        ...(include?.includes('role') && { role: true }),
      },
    })

    if (!userRole) {
      return NextResponse.json(
        { success: false, error: 'UserRole을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: userRole })
  } catch (error) {
    console.error('UserRole 조회 실패:', error)
    return NextResponse.json(
      { success: false, error: 'UserRole을 조회하지 못했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE /api/user-roles/[id] - UserRole 삭제 (User에게서 Role 제거)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.userRole.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'UserRole이 삭제되었습니다.' })
  } catch (error) {
    console.error('UserRole 삭제 실패:', error)
    return NextResponse.json(
      { success: false, error: 'UserRole을 삭제하지 못했습니다.' },
      { status: 500 }
    )
  }
}

