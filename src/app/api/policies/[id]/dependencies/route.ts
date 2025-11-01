import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params

    // Policy와 연관된 데이터 수 조회
    const [statesCount, typesCount, businessObjectsCount] = await Promise.all([
      prisma.state.count({ where: { policyId: id } }),
      prisma.type.count({ where: { policyId: id } }),
      prisma.businessObject.count({ where: { policyId: id } }),
    ])

    return NextResponse.json({
      states: statesCount,
      types: typesCount,
      businessObjects: businessObjectsCount,
    })
  } catch (error) {
    console.error('종속성 조회 에러:', error)
    return NextResponse.json(
      { error: '종속성 조회 실패' },
      { status: 500 }
    )
  }
}

