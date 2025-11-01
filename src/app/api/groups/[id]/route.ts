// Group CRUD API - 단일 조회, 수정, 삭제
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/groups/[id] - Group 단일 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const include = searchParams.get('include')

    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        ...(include?.includes('parent') && { parent: true }),
        ...(include?.includes('children') && { children: true }),
        ...(include?.includes('permissions') && { permissions: true }),
        ...(include?.includes('users') && { userGroups: true }),
      },
    })

    if (!group) {
      return NextResponse.json(
        { success: false, error: 'Group을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: group })
  } catch (error) {
    console.error('Group 조회 실패:', error)
    return NextResponse.json(
      { success: false, error: 'Group을 조회하지 못했습니다.' },
      { status: 500 }
    )
  }
}

// PATCH /api/groups/[id] - Group 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, parentId, isActive } = body

    const group = await prisma.group.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(parentId !== undefined && { parentId }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json({ success: true, data: group })
  } catch (error) {
    console.error('Group 수정 실패:', error)
    return NextResponse.json(
      { success: false, error: 'Group을 수정하지 못했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE /api/groups/[id] - Group 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.group.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Group이 삭제되었습니다.' })
  } catch (error) {
    console.error('Group 삭제 실패:', error)
    return NextResponse.json(
      { success: false, error: 'Group을 삭제하지 못했습니다.' },
      { status: 500 }
    )
  }
}

