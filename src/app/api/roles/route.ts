// Role CRUD API - 목록 조회, 생성
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/roles - Role 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const include = searchParams.get('include')

    const roles = await prisma.role.findMany({
      include: {
        ...(include?.includes('permissions') && { permissions: true }),
        ...(include?.includes('users') && { userRoles: true }),
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ success: true, data: roles })
  } catch (error) {
    console.error('Role 목록 조회 실패:', error)
    return NextResponse.json(
      { success: false, error: 'Role 목록을 조회하지 못했습니다.' },
      { status: 500 }
    )
  }
}

// POST /api/roles - Role 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, isActive } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Role 이름은 필수입니다.' },
        { status: 400 }
      )
    }

    const role = await prisma.role.create({
      data: {
        name,
        description,
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json({ success: true, data: role }, { status: 201 })
  } catch (error) {
    console.error('Role 생성 실패:', error)
    return NextResponse.json(
      { success: false, error: 'Role을 생성하지 못했습니다.' },
      { status: 500 }
    )
  }
}

