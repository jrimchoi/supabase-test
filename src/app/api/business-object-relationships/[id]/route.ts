import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type RouteContext = {
  params: Promise<{ id: string }>
}

/**
 * GET /api/business-object-relationships/:id
 * 특정 BusinessObjectRelationship 조회
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const objectRelationship = await prisma.businessObjectRelationship.findUnique({
      where: { id },
      include: {
        relationship: {
          select: {
            id: true,
            name: true,
            cardinality: true,
            fromType: {
              select: { id: true, name: true },
            },
            toType: {
              select: { id: true, name: true },
            },
          },
        },
        fromObject: {
          select: {
            id: true,
            name: true,
            description: true,
            type: {
              select: { name: true },
            },
          },
        },
        toObject: {
          select: {
            id: true,
            name: true,
            description: true,
            type: {
              select: { name: true },
            },
          },
        },
      },
    })

    if (!objectRelationship) {
      return NextResponse.json(
        {
          success: false,
          error: 'BusinessObjectRelationship를 찾을 수 없습니다.',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: objectRelationship,
    })
  } catch (error: unknown) {
    console.error('[API] GET /api/business-object-relationships/:id error:', error)
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
 * PATCH /api/business-object-relationships/:id
 * BusinessObjectRelationship 수정
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { relationshipId, fromObjectId, toObjectId, data } = body

    const updateData: any = {}
    if (relationshipId !== undefined) updateData.relationshipId = relationshipId
    if (fromObjectId !== undefined) updateData.fromObjectId = fromObjectId
    if (toObjectId !== undefined) updateData.toObjectId = toObjectId
    if (data !== undefined) updateData.data = data

    const objectRelationship = await prisma.businessObjectRelationship.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({
      success: true,
      data: objectRelationship,
    })
  } catch (error: unknown) {
    console.error('[API] PATCH /api/business-object-relationships/:id error:', error)
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
 * DELETE /api/business-object-relationships/:id
 * BusinessObjectRelationship 삭제
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    await prisma.businessObjectRelationship.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'BusinessObjectRelationship가 삭제되었습니다.',
    })
  } catch (error: unknown) {
    console.error('[API] DELETE /api/business-object-relationships/:id error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      { status: 500 }
    )
  }
}

