// Permission CRUD API - 목록 조회, 생성
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/permissions - Permission 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const stateId = searchParams.get('stateId')
    const resource = searchParams.get('resource')
    const targetType = searchParams.get('targetType')
    const include = searchParams.get('include')

    const permissions = await prisma.permission.findMany({
      where: {
        ...(stateId && { stateId }),
        ...(resource && { resource }),
        ...(targetType && { targetType }),
      },
      include: {
        ...(include?.includes('state') && { state: true }),
        ...(include?.includes('role') && { role: true }),
        ...(include?.includes('group') && { group: true }),
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: permissions })
  } catch (error) {
    console.error('Permission 목록 조회 실패:', error)
    return NextResponse.json(
      { success: false, error: 'Permission 목록을 조회하지 못했습니다.' },
      { status: 500 }
    )
  }
}

// POST /api/permissions - Permission 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      stateId,
      resource,
      action,
      targetType,
      roleId,
      groupId,
      userId,
      expression,
      isAllowed,
    } = body

    if (!stateId || !resource || !action || !targetType) {
      return NextResponse.json(
        { success: false, error: 'stateId, resource, action, targetType은 필수입니다.' },
        { status: 400 }
      )
    }

    // targetType에 따라 해당 ID만 검증
    if (targetType === 'role' && !roleId) {
      return NextResponse.json(
        { success: false, error: "targetType이 'role'일 때 roleId는 필수입니다." },
        { status: 400 }
      )
    }
    if (targetType === 'group' && !groupId) {
      return NextResponse.json(
        { success: false, error: "targetType이 'group'일 때 groupId는 필수입니다." },
        { status: 400 }
      )
    }
    if (targetType === 'user' && !userId) {
      return NextResponse.json(
        { success: false, error: "targetType이 'user'일 때 userId는 필수입니다." },
        { status: 400 }
      )
    }

    const permission = await prisma.permission.create({
      data: {
        stateId,
        resource,
        action,
        targetType,
        roleId: targetType === 'role' ? roleId : null,
        groupId: targetType === 'group' ? groupId : null,
        userId: targetType === 'user' ? userId : null,
        expression,
        isAllowed: isAllowed ?? true,
      },
    })

    return NextResponse.json({ success: true, data: permission }, { status: 201 })
  } catch (error) {
    console.error('Permission 생성 실패:', error)
    return NextResponse.json(
      { success: false, error: 'Permission을 생성하지 못했습니다.' },
      { status: 500 }
    )
  }
}

