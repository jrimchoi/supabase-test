// UserGroup CRUD API - 목록 조회, 생성 (User-Group 매핑)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/user-groups - UserGroup 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const groupId = searchParams.get('groupId')
    const include = searchParams.get('include')

    const userGroups = await prisma.userGroup.findMany({
      where: {
        ...(userId && { userId }),
        ...(groupId && { groupId }),
      },
      include: {
        ...(include?.includes('group') && { group: true }),
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: userGroups })
  } catch (error) {
    console.error('UserGroup 목록 조회 실패:', error)
    return NextResponse.json(
      { success: false, error: 'UserGroup 목록을 조회하지 못했습니다.' },
      { status: 500 }
    )
  }
}

// POST /api/user-groups - UserGroup 생성 (User에게 Group 할당)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, groupId } = body

    if (!userId || !groupId) {
      return NextResponse.json(
        { success: false, error: 'userId, groupId는 필수입니다.' },
        { status: 400 }
      )
    }

    const userGroup = await prisma.userGroup.create({
      data: {
        userId,
        groupId,
      },
    })

    return NextResponse.json({ success: true, data: userGroup }, { status: 201 })
  } catch (error) {
    console.error('UserGroup 생성 실패:', error)
    return NextResponse.json(
      { success: false, error: 'UserGroup을 생성하지 못했습니다.' },
      { status: 500 }
    )
  }
}

