// UserRole CRUD API - 목록 조회, 생성 (User-Role 매핑)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/user-roles - UserRole 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const roleId = searchParams.get('roleId')
    const include = searchParams.get('include')

    const userRoles = await prisma.userRole.findMany({
      where: {
        ...(userId && { userId }),
        ...(roleId && { roleId }),
      },
      include: {
        ...(include?.includes('role') && { role: true }),
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: userRoles })
  } catch (error) {
    console.error('UserRole 목록 조회 실패:', error)
    return NextResponse.json(
      { success: false, error: 'UserRole 목록을 조회하지 못했습니다.' },
      { status: 500 }
    )
  }
}

// POST /api/user-roles - UserRole 생성 (User에게 Role 할당)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, roleId } = body

    if (!userId || !roleId) {
      return NextResponse.json(
        { success: false, error: 'userId, roleId는 필수입니다.' },
        { status: 400 }
      )
    }

    const userRole = await prisma.userRole.create({
      data: {
        userId,
        roleId,
      },
    })

    return NextResponse.json({ success: true, data: userRole }, { status: 201 })
  } catch (error) {
    console.error('UserRole 생성 실패:', error)
    return NextResponse.json(
      { success: false, error: 'UserRole을 생성하지 못했습니다.' },
      { status: 500 }
    )
  }
}

