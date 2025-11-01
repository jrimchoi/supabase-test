// Policy CRUD API - 단일 조회, 수정, 삭제
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/policies/[id] - Policy 단일 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const include = searchParams.get('include')

    const policy = await prisma.policy.findUnique({
      where: { id },
      include: include === 'states' ? { states: true } : undefined,
    })

    if (!policy) {
      return NextResponse.json(
        { success: false, error: 'Policy를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: policy })
  } catch (error) {
    console.error('Policy 조회 실패:', error)
    return NextResponse.json(
      { success: false, error: 'Policy를 조회하지 못했습니다.' },
      { status: 500 }
    )
  }
}

// PATCH /api/policies/[id] - Policy 수정 (수동 버전 업)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, isActive, updatedBy, createNewVersion, copyStates } = body

    // createNewVersion=true면 새 버전 수동 생성
    if (createNewVersion) {
      const { createNewPolicyVersion } = await import('@/lib/policy-version')
      
      const newPolicy = await createNewPolicyVersion(id, {
        description,
        copyStates: copyStates ?? true,
        deactivateOld: true,
      })

      return NextResponse.json({ 
        success: true, 
        data: newPolicy,
        message: `새 버전 (v${newPolicy.version}) 생성됨`
      })
    }

    // 일반 수정 (버전 변경 없음)
    const policy = await prisma.policy.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
        ...(updatedBy !== undefined && { updatedBy }),
      },
    })

    return NextResponse.json({ success: true, data: policy })
  } catch (error) {
    console.error('Policy 수정 실패:', error)
    return NextResponse.json(
      { success: false, error: 'Policy를 수정하지 못했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE /api/policies/[id] - Policy 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.policy.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Policy가 삭제되었습니다.' })
  } catch (error) {
    console.error('Policy 삭제 실패:', error)
    return NextResponse.json(
      { success: false, error: 'Policy를 삭제하지 못했습니다.' },
      { status: 500 }
    )
  }
}
