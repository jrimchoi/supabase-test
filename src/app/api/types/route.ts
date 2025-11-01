// Type CRUD API - 목록 조회, 생성
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/types - Type 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const policyId = searchParams.get('policyId')
    const include = searchParams.get('include')

    const types = await prisma.type.findMany({
      where: policyId ? { policyId } : undefined,
      include: {
        ...(include?.includes('policy') && { policy: true }),
        ...(include?.includes('attributes') && { attributes: true }),
        ...(include?.includes('objects') && { businessObjects: true }),
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ success: true, data: types })
  } catch (error) {
    console.error('Type 목록 조회 실패:', error)
    return NextResponse.json(
      { success: false, error: 'Type 목록을 조회하지 못했습니다.' },
      { status: 500 }
    )
  }
}

// POST /api/types - Type 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, policyId } = body

    if (!name || !policyId) {
      return NextResponse.json(
        { success: false, error: 'name, policyId는 필수입니다.' },
        { status: 400 }
      )
    }

    const type = await prisma.type.create({
      data: {
        name,
        policyId,
      },
    })

    return NextResponse.json({ success: true, data: type }, { status: 201 })
  } catch (error) {
    console.error('Type 생성 실패:', error)
    return NextResponse.json(
      { success: false, error: 'Type을 생성하지 못했습니다.' },
      { status: 500 }
    )
  }
}

