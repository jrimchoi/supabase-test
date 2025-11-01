import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, excludeId } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Policy 이름은 필수입니다' },
        { status: 400 }
      )
    }

    // 같은 이름의 다른 Policy들을 모두 비활성화
    await prisma.policy.updateMany({
      where: {
        name,
        id: { not: excludeId },
      },
      data: {
        isActive: false,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Policy 비활성화 에러:', error)
    return NextResponse.json(
      { error: '비활성화 실패' },
      { status: 500 }
    )
  }
}

