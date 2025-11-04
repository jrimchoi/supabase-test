import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params

    // Role과 연관된 데이터 수 조회
    const [permissionsCount, userRolesCount] = await Promise.all([
      prisma.permission.count({ where: { roleId: id } }),
      prisma.userRole.count({ where: { roleId: id } }),
    ])

    return NextResponse.json({
      permissions: permissionsCount,
      userRoles: userRolesCount,
    })
  } catch (error) {
    console.error('종속성 조회 에러:', error)
    return NextResponse.json(
      { error: '종속성 조회 실패' },
      { status: 500 }
    )
  }
}

