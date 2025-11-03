// Type API (비즈니스 타입)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/types
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const policyId = searchParams.get('policyId')
    const include = searchParams.get('include')

    const where: any = {}
    if (policyId) {
      where.policyId = policyId
    }

    const includeOptions: any = {}
    if (include) {
      const includes = include.split(',')
      if (includes.includes('parent')) {
        includeOptions.parent = true
      }
      if (includes.includes('children')) {
        includeOptions.children = true
      }
      if (includes.includes('policy')) {
        includeOptions.policy = true
      }
      if (includes.includes('objects')) {
        includeOptions.objects = true
      }
      if (includes.includes('typeAttributes')) {
        includeOptions.typeAttributes = {
          include: {
            attribute: true,
          },
        }
      }
    }

    const types = await prisma.type.findMany({
      where,
      include: Object.keys(includeOptions).length > 0 ? includeOptions : undefined,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: types,
    })
  } catch (error) {
    console.error('Type 목록 조회 실패:', error)
    return NextResponse.json(
      { success: false, error: 'Type 목록을 가져오지 못했습니다.' },
      { status: 500 }
    )
  }
}

// POST /api/types
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, prefix, policyId, parentId } = body

    // 필수 필드 검증
    if (!name || !policyId) {
      return NextResponse.json(
        { success: false, error: 'name과 policyId는 필수입니다.' },
        { status: 400 }
      )
    }

    const newType = await prisma.type.create({
      data: {
        name,
        description: description || null,
        prefix: prefix || null,
        policyId,
        parentId: parentId || null,
      },
    })

    return NextResponse.json(
      { success: true, data: newType },
      { status: 201 }
    )
  } catch (error: unknown) {
    console.error('Type 생성 실패:', error)
    
    // Unique 제약 위반 체크
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { success: false, error: '이미 존재하는 name입니다.' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Type을 생성하지 못했습니다.' },
      { status: 400 }
    )
  }
}
