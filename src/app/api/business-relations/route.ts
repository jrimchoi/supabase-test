import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/business-relations
 * 모든 BusinessObjectRelationship 조회 (필터링 지원)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const relationshipId = searchParams.get('relationshipId')
    const fromObjectId = searchParams.get('fromObjectId')
    const toObjectId = searchParams.get('toObjectId')

    const where: any = {}
    if (relationshipId) where.relationshipId = relationshipId
    if (fromObjectId) where.fromObjectId = fromObjectId
    if (toObjectId) where.toObjectId = toObjectId

    const objectRelationships = await prisma.businessObjectRelationship.findMany({
      where,
      include: {
        relationship: {
          select: {
            id: true,
            name: true,
            cardinality: true,
          },
        },
        fromObject: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        toObject: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: objectRelationships,
    })
  } catch (error: unknown) {
    console.error('[API] GET /api/business-relations error:', error)
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
 * POST /api/business-relations
 * 새로운 BusinessObjectRelationship 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { relationshipId, fromObjectId, toObjectId, data } = body

    // 필수 필드 검증
    if (!relationshipId || !fromObjectId || !toObjectId) {
      return NextResponse.json(
        {
          success: false,
          error: 'relationshipId, fromObjectId, toObjectId는 필수 입력 항목입니다.',
        },
        { status: 400 }
      )
    }

    const objectRelationship = await prisma.businessObjectRelationship.create({
      data: {
        relationshipId,
        fromObjectId,
        toObjectId,
        data: data || null,
      },
      include: {
        relationship: {
          select: {
            id: true,
            name: true,
            cardinality: true,
          },
        },
        fromObject: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        toObject: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: objectRelationship,
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    console.error('[API] POST /api/business-relations error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      { status: 500 }
    )
  }
}

