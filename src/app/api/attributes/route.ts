// Attribute CRUD API - 목록 조회, 생성 (속성 정의)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/attributes - Attribute 목록 조회 (공통 속성)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const typeId = searchParams.get('typeId') // Type별 Attribute 조회용
    const include = searchParams.get('include')

    // typeId가 있으면 해당 Type에 할당된 Attribute만 조회
    if (typeId) {
      const typeAttributes = await prisma.typeAttribute.findMany({
        where: { typeId },
        include: {
          attribute: true,
        },
        orderBy: {
          attribute: { key: 'asc' },
        },
      })
      const attributes = typeAttributes.map((ta) => ta.attribute)
      return NextResponse.json({ success: true, data: attributes })
    }

    // typeId 없으면 모든 공통 Attribute 조회
    const attributes = await prisma.attribute.findMany({
      orderBy: { key: 'asc' },
    })

    return NextResponse.json({ success: true, data: attributes })
  } catch (error) {
    console.error('Attribute 목록 조회 실패:', error)
    return NextResponse.json(
      { success: false, error: 'Attribute 목록을 조회하지 못했습니다.' },
      { status: 500 }
    )
  }
}

// POST /api/attributes - Attribute 생성 (공통 속성)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { key, label, attrType, isRequired, defaultValue, validation } = body

    if (!key || !label || !attrType) {
      return NextResponse.json(
        { success: false, error: 'key, label, attrType은 필수입니다.' },
        { status: 400 }
      )
    }

    // attrType 검증
    const validTypes = ['STRING', 'INTEGER', 'REAL', 'DATE', 'BOOLEAN', 'JSON', 'ENUM']
    if (!validTypes.includes(attrType)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `attrType은 ${validTypes.join(', ')} 중 하나여야 합니다.` 
        },
        { status: 400 }
      )
    }

    // 공통 Attribute 생성 (typeId 없음)
    const attribute = await prisma.attribute.create({
      data: {
        key,
        label,
        attrType,
        isRequired: isRequired ?? false,
        defaultValue,
        validation,
      },
    })

    return NextResponse.json({ success: true, data: attribute }, { status: 201 })
  } catch (error) {
    console.error('Attribute 생성 실패:', error)
    return NextResponse.json(
      { success: false, error: 'Attribute를 생성하지 못했습니다.' },
      { status: 500 }
    )
  }
}

