import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const typeId = searchParams.get('typeId') || ''

    // 검색어가 2글자 미만이면 빈 배열 반환
    if (query.length < 2) {
      return NextResponse.json([])
    }

    // 현재 Type에 이미 할당된 Attribute ID 조회
    const assignedAttributeIds = typeId
      ? (
          await prisma.typeAttribute.findMany({
            where: { typeId },
            select: { attributeId: true },
          })
        ).map((ta) => ta.attributeId)
      : []

    // Attribute 검색 (할당되지 않은 것만)
    const attributes = await prisma.attribute.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { label: { contains: query, mode: 'insensitive' } },
        ],
        // 현재 Type에 할당되지 않은 것만
        ...(typeId && assignedAttributeIds.length > 0
          ? { id: { notIn: assignedAttributeIds } }
          : {}),
      },
      orderBy: [{ name: 'asc' }],
      take: 20,
    })

    return NextResponse.json(attributes)
  } catch (error) {
    console.error('Attribute 검색 에러:', error)
    return NextResponse.json({ error: 'Attribute 검색 실패' }, { status: 500 })
  }
}

