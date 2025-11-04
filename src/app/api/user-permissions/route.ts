// UserPermission CRUD API - 목록 조회, 생성 (User별 직접 권한)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/user-permissions - UserPermission 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const stateId = searchParams.get('stateId')
    const resource = searchParams.get('resource')

    const userPermissions = await prisma.userPermission.findMany({
      where: {
        ...(userId && { userId }),
        ...(stateId && { stateId }),
        ...(resource && { resource }),
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: userPermissions })
  } catch (error) {
    console.error('UserPermission 목록 조회 실패:', error)
    return NextResponse.json(
      { success: false, error: 'UserPermission 목록을 조회하지 못했습니다.' },
      { status: 500 }
    )
  }
}

// POST /api/user-permissions - UserPermission 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, stateId, resource, action, expression, isAllowed } = body

    if (!userId || !stateId || !resource || !action) {
      return NextResponse.json(
        { success: false, error: 'userId, stateId, resource, action은 필수입니다.' },
        { status: 400 }
      )
    }

    const userPermission = await prisma.userPermission.create({
      data: {
        userId,
        stateId,
        resource,
        action,
        expression,
        isAllowed: isAllowed ?? true,
      },
    })

    return NextResponse.json({ success: true, data: userPermission }, { status: 201 })
  } catch (error) {
    console.error('UserPermission 생성 실패:', error)
    return NextResponse.json(
      { success: false, error: 'UserPermission을 생성하지 못했습니다.' },
      { status: 500 }
    )
  }
}

