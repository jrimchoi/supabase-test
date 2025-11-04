// BusinessObject CRUD API - 목록 조회, 생성
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/business-objects - BusinessObject 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const typeId = searchParams.get('typeId')
    const policyId = searchParams.get('policyId')
    const currentState = searchParams.get('currentState')
    const include = searchParams.get('include')
    const search = searchParams.get('search')

    const where: any = {
      ...(typeId && { typeId }),
      ...(policyId && { policyId }),
      ...(currentState && { currentState }),
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const businessObjects = await prisma.businessObject.findMany({
      where,
      include: {
        ...(include?.includes('type') && { type: true }),
        ...(include?.includes('policy') && { policy: true }),
        ...(include?.includes('attributes') && { attributes: true }),
        ...(!include && { type: true }), // 기본적으로 type 포함
      },
      orderBy: { createdAt: 'desc' },
      take: 50, // 검색 결과 제한
    })

    return NextResponse.json({ success: true, data: businessObjects })
  } catch (error) {
    console.error('BusinessObject 목록 조회 실패:', error)
    return NextResponse.json(
      { success: false, error: 'BusinessObject 목록을 조회하지 못했습니다.' },
      { status: 500 }
    )
  }
}

// POST /api/business-objects - BusinessObject 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { typeId, policyId, currentState, data } = body

    if (!typeId || !policyId || !currentState) {
      return NextResponse.json(
        { success: false, error: 'typeId, policyId, currentState는 필수입니다.' },
        { status: 400 }
      )
    }

    const businessObject = await prisma.businessObject.create({
      data: {
        typeId,
        policyId,
        currentState,
        data: data || undefined,
      },
    })

    return NextResponse.json({ success: true, data: businessObject }, { status: 201 })
  } catch (error) {
    console.error('BusinessObject 생성 실패:', error)
    return NextResponse.json(
      { success: false, error: 'BusinessObject를 생성하지 못했습니다.' },
      { status: 500 }
    )
  }
}

