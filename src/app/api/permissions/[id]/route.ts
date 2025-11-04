// Permission CRUD API - 단일 조회, 수정, 삭제
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/permissions/[id] - Permission 단일 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const include = searchParams.get('include')

    const permission = await prisma.permission.findUnique({
      where: { id },
      include: {
        ...(include?.includes('state') && { state: true }),
        ...(include?.includes('role') && { role: true }),
        ...(include?.includes('group') && { group: true }),
      },
    })

    if (!permission) {
      return NextResponse.json(
        { success: false, error: 'Permission을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: permission })
  } catch (error) {
    console.error('Permission 조회 실패:', error)
    return NextResponse.json(
      { success: false, error: 'Permission을 조회하지 못했습니다.' },
      { status: 500 }
    )
  }
}

// PATCH /api/permissions/[id] - Permission 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { expression, isAllowed } = body

    const permission = await prisma.permission.update({
      where: { id },
      data: {
        ...(expression !== undefined && { expression }),
        ...(isAllowed !== undefined && { isAllowed }),
      },
    })

    return NextResponse.json({ success: true, data: permission })
  } catch (error) {
    console.error('Permission 수정 실패:', error)
    return NextResponse.json(
      { success: false, error: 'Permission을 수정하지 못했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE /api/permissions/[id] - Permission 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.permission.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Permission이 삭제되었습니다.' })
  } catch (error) {
    console.error('Permission 삭제 실패:', error)
    return NextResponse.json(
      { success: false, error: 'Permission을 삭제하지 못했습니다.' },
      { status: 500 }
    )
  }
}

