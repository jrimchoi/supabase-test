// StateTransition CRUD API - 목록 조회, 생성
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/state-transitions - StateTransition 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fromStateId = searchParams.get('fromStateId')
    const toStateId = searchParams.get('toStateId')
    const include = searchParams.get('include')

    const transitions = await prisma.stateTransition.findMany({
      where: {
        ...(fromStateId && { fromStateId }),
        ...(toStateId && { toStateId }),
      },
      include: {
        ...(include?.includes('states') && {
          fromState: true,
          toState: true,
        }),
      },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ success: true, data: transitions })
  } catch (error) {
    console.error('StateTransition 목록 조회 실패:', error)
    return NextResponse.json(
      { success: false, error: 'StateTransition 목록을 조회하지 못했습니다.' },
      { status: 500 }
    )
  }
}

// POST /api/state-transitions - StateTransition 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fromStateId, toStateId, condition, order } = body

    if (!fromStateId || !toStateId) {
      return NextResponse.json(
        { success: false, error: 'fromStateId, toStateId는 필수입니다.' },
        { status: 400 }
      )
    }

    const transition = await prisma.stateTransition.create({
      data: {
        fromStateId,
        toStateId,
        condition,
        order,
      },
    })

    return NextResponse.json({ success: true, data: transition }, { status: 201 })
  } catch (error) {
    console.error('StateTransition 생성 실패:', error)
    return NextResponse.json(
      { success: false, error: 'StateTransition을 생성하지 못했습니다.' },
      { status: 500 }
    )
  }
}

