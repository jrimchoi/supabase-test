import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type RouteContext = {
  params: Promise<{ id: string }>
}

/**
 * GET /api/relationships/:id
 * 특정 Relationship 조회
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const relationship = await prisma.relationship.findUnique({
      where: { id },
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
        objectRelationships: {
          select: { id: true, fromObjectId: true, toObjectId: true },
          take: 5, // 최근 5개만
        },
      },
    })

    if (!relationship) {
      return NextResponse.json(
        {
          success: false,
          error: 'Relationship를 찾을 수 없습니다.',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: relationship,
    })
  } catch (error: unknown) {
    console.error('[API] GET /api/relationships/:id error:', error)
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
 * PATCH /api/relationships/:id
 * Relationship 수정
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { name, description, fromTypeId, toTypeId, cardinality, isRequired, isActive } = body

    // Cardinality 유효성 검증 (제공된 경우)
    if (cardinality) {
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
    }

    const data: any = {}
    if (name !== undefined) data.name = name
    if (description !== undefined) data.description = description
    if (fromTypeId !== undefined) data.fromTypeId = fromTypeId
    if (toTypeId !== undefined) data.toTypeId = toTypeId
    if (cardinality !== undefined) data.cardinality = cardinality
    if (isRequired !== undefined) data.isRequired = isRequired
    if (isActive !== undefined) data.isActive = isActive

    const relationship = await prisma.relationship.update({
      where: { id },
      data,
      include: {
        fromType: {
          select: { id: true, name: true, description: true },
        },
        toType: {
          select: { id: true, name: true, description: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: relationship,
    })
  } catch (error: unknown) {
    console.error('[API] PATCH /api/relationships/:id error:', error)
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
 * DELETE /api/relationships/:id
 * Relationship 삭제
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    // 종속 데이터 확인
    const relatedCount = await prisma.businessObjectRelationship.count({
      where: { relationshipId: id },
    })

    if (relatedCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `${relatedCount}개의 BusinessObjectRelationship가 연결되어 있어 삭제할 수 없습니다.`,
        },
        { status: 400 }
      )
    }

    await prisma.relationship.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Relationship가 삭제되었습니다.',
    })
  } catch (error: unknown) {
    console.error('[API] DELETE /api/relationships/:id error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      { status: 500 }
    )
  }
}

