// Group CRUD API - 목록 조회, 생성
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/groups - Group 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get('parentId')
    const include = searchParams.get('include')

    const groups = await prisma.group.findMany({
      where: parentId ? { parentId } : undefined,
      include: {
        ...(include?.includes('parent') && { parent: true }),
        ...(include?.includes('children') && { children: true }),
        ...(include?.includes('permissions') && { permissions: true }),
        ...(include?.includes('users') && { userGroups: true }),
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ success: true, data: groups })
  } catch (error) {
    console.error('Group 목록 조회 실패:', error)
    return NextResponse.json(
      { success: false, error: 'Group 목록을 조회하지 못했습니다.' },
      { status: 500 }
    )
  }
}

// POST /api/groups - Group 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, parentId, isActive } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Group 이름은 필수입니다.' },
        { status: 400 }
      )
    }

    const group = await prisma.group.create({
      data: {
        name,
        description,
        parentId,
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json({ success: true, data: group }, { status: 201 })
  } catch (error) {
    console.error('Group 생성 실패:', error)
    return NextResponse.json(
      { success: false, error: 'Group을 생성하지 못했습니다.' },
      { status: 500 }
    )
  }
}

