// BusinessType CRUD API - 목록 조회, 생성
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/business-types - BusinessType 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const policy = searchParams.get('policy') // Policy name으로 필터링

    const businessTypes = await prisma.businessType.findMany({
      where: policy ? { policy } : undefined,
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ success: true, data: businessTypes })
  } catch (error) {
    console.error('BusinessType 목록 조회 실패:', error)
    return NextResponse.json(
      { success: false, error: 'BusinessType 목록을 조회하지 못했습니다.' },
      { status: 500 }
    )
  }
}

// POST /api/business-types - BusinessType 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, policy } = body

    if (!name || !policy) {
      return NextResponse.json(
        { success: false, error: 'name, policy는 필수입니다.' },
        { status: 400 }
      )
    }

    const businessType = await prisma.businessType.create({
      data: {
        name,
        policy,
      },
    })

    return NextResponse.json({ success: true, data: businessType }, { status: 201 })
  } catch (error) {
    console.error('BusinessType 생성 실패:', error)
    return NextResponse.json(
      { success: false, error: 'BusinessType을 생성하지 못했습니다.' },
      { status: 500 }
    )
  }
}

