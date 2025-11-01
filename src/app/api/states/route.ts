// State CRUD API - 목록 조회, 생성
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/states - State 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const policyId = searchParams.get('policyId')
    const include = searchParams.get('include')

    const states = await prisma.state.findMany({
      where: policyId ? { policyId } : undefined,
      include: {
        ...(include?.includes('policy') && { policy: true }),
        ...(include?.includes('transitions') && {
          fromTransitions: true,
          toTransitions: true,
        }),
        ...(include?.includes('permissions') && { permissions: true }),
      },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ success: true, data: states })
  } catch (error) {
    console.error('State 목록 조회 실패:', error)
    return NextResponse.json(
      { success: false, error: 'State 목록을 조회하지 못했습니다.' },
      { status: 500 }
    )
  }
}

// POST /api/states - State 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { policyId, name, description, order, isInitial, isFinal } = body

    if (!policyId || !name || order === undefined) {
      return NextResponse.json(
        { success: false, error: 'policyId, name, order는 필수입니다.' },
        { status: 400 }
      )
    }

    const state = await prisma.state.create({
      data: {
        policyId,
        name,
        description,
        order,
        isInitial: isInitial ?? false,
        isFinal: isFinal ?? false,
      },
    })

    return NextResponse.json({ success: true, data: state }, { status: 201 })
  } catch (error) {
    console.error('State 생성 실패:', error)
    return NextResponse.json(
      { success: false, error: 'State를 생성하지 못했습니다.' },
      { status: 500 }
    )
  }
}

