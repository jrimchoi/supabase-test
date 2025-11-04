import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/relationships
 * 모든 Relationship 조회 (필터링 지원)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fromTypeId = searchParams.get('fromTypeId')
    const toTypeId = searchParams.get('toTypeId')
    const cardinality = searchParams.get('cardinality')

    const where: any = {}
    if (fromTypeId) where.fromTypeId = fromTypeId
    if (toTypeId) where.toTypeId = toTypeId
    if (cardinality) where.cardinality = cardinality

    const relationships = await prisma.relationship.findMany({
      where,
      include: {
        fromType: {
          select: { id: true, name: true, description: true },
        },
        toType: {
          select: { id: true, name: true, description: true },
        },
        relationshipAttributes: {
          include: {
            attribute: {
              select: { id: true, name: true, label: true, attrType: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: relationships,
    })
  } catch (error: unknown) {
    console.error('[API] GET /api/relationships error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/relationships
 * 새로운 Relationship 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, fromTypeId, toTypeId, cardinality, isRequired, isActive } = body

    // 필수 필드 검증
    if (!name || !fromTypeId || !toTypeId || !cardinality) {
      return NextResponse.json(
        {
          success: false,
          error: 'name, fromTypeId, toTypeId, cardinality는 필수 입력 항목입니다.',
        },
        { status: 400 }
      )
    }

    // Cardinality 유효성 검증
    const validCardinalities = ['ONE_TO_ONE', 'ONE_TO_MANY', 'MANY_TO_ONE', 'MANY_TO_MANY']
    if (!validCardinalities.includes(cardinality)) {
      return NextResponse.json(
        {
          success: false,
          error: `cardinality는 다음 중 하나여야 합니다: ${validCardinalities.join(', ')}`,
        },
        { status: 400 }
      )
    }

    const relationship = await prisma.relationship.create({
      data: {
        name,
        description,
        fromTypeId,
        toTypeId,
        cardinality,
        isRequired: isRequired ?? false,
        isActive: isActive ?? true,
      },
      include: {
        fromType: {
          select: { id: true, name: true, description: true },
        },
        toType: {
          select: { id: true, name: true, description: true },
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: relationship,
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    console.error('[API] POST /api/relationships error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      { status: 500 }
    )
  }
}

