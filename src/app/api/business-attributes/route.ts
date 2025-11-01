// BusinessAttribute CRUD API - EAV 패턴으로 속성 값 관리
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/business-attributes - BusinessAttribute 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const objectId = searchParams.get('objectId')
    const include = searchParams.get('include')

    const businessAttributes = await prisma.businessAttribute.findMany({
      where: objectId ? { objectId } : undefined,
      include: {
        ...(include?.includes('object') && { object: true }),
      },
      orderBy: { attributeKey: 'asc' },
    })

    return NextResponse.json({ success: true, data: businessAttributes })
  } catch (error) {
    console.error('BusinessAttribute 목록 조회 실패:', error)
    return NextResponse.json(
      { success: false, error: 'BusinessAttribute 목록을 조회하지 못했습니다.' },
      { status: 500 }
    )
  }
}

// POST /api/business-attributes - BusinessAttribute 생성 (EAV)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { objectId, attributeKey, valueString, valueInteger, valueReal, valueDate, valueBoolean, valueJson } = body

    if (!objectId || !attributeKey) {
      return NextResponse.json(
        { success: false, error: 'objectId, attributeKey는 필수입니다.' },
        { status: 400 }
      )
    }

    // 최소 하나의 value는 있어야 함
    const hasValue = valueString || valueInteger !== undefined || valueReal !== undefined || 
                     valueDate || valueBoolean !== undefined || valueJson
    
    if (!hasValue) {
      return NextResponse.json(
        { success: false, error: '최소 하나의 value(valueString, valueInteger, 등)가 필요합니다.' },
        { status: 400 }
      )
    }

    const businessAttribute = await prisma.businessAttribute.create({
      data: {
        objectId,
        attributeKey,
        valueString,
        valueInteger,
        valueReal,
        valueDate: valueDate ? new Date(valueDate) : undefined,
        valueBoolean,
        valueJson,
      },
    })

    return NextResponse.json({ success: true, data: businessAttribute }, { status: 201 })
  } catch (error) {
    console.error('BusinessAttribute 생성 실패:', error)
    return NextResponse.json(
      { success: false, error: 'BusinessAttribute를 생성하지 못했습니다.' },
      { status: 500 }
    )
  }
}
