// Policy CRUD API - 목록 조회, 생성
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/policies - Policy 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const include = searchParams.get('include') // 관계 포함 옵션
    const onlyActive = searchParams.get('onlyActive') === 'true' // 활성화된 것만
    const latestVersion = searchParams.get('latestVersion') === 'true' // 최신 버전만

    let policies

    if (latestVersion) {
      // 각 Policy의 최신 버전만 조회
      const allPolicies = await prisma.policy.findMany({
        where: onlyActive ? { isActive: true } : undefined,
        include: include === 'states' ? { states: true } : undefined,
        orderBy: [{ name: 'asc' }, { createdAt: 'desc' }],
      })

      // 각 name별로 가장 최근 생성된 것만 선택
      const latestPolicies = new Map()
      allPolicies.forEach(policy => {
        if (!latestPolicies.has(policy.name) || 
            latestPolicies.get(policy.name).createdAt < policy.createdAt) {
          latestPolicies.set(policy.name, policy)
        }
      })
      policies = Array.from(latestPolicies.values())
    } else {
      // 전체 조회
      policies = await prisma.policy.findMany({
        where: onlyActive ? { isActive: true } : undefined,
        include: include === 'states' ? { states: true } : undefined,
        orderBy: [{ name: 'asc' }, { createdAt: 'desc' }],
      })
    }

    return NextResponse.json({ success: true, data: policies })
  } catch (error) {
    console.error('Policy 목록 조회 실패:', error)
    return NextResponse.json(
      { success: false, error: 'Policy 목록을 조회하지 못했습니다.' },
      { status: 500 }
    )
  }
}

// POST /api/policies - Policy 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, isActive, createdBy, newVersion } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Policy 이름은 필수입니다.' },
        { status: 400 }
      )
    }

    // version 필드가 제거되었으므로 버전 관리는 name에 포함
    // (예: "송장 관리 정책 v1", "송장 관리 정책 v2")
    // newVersion 플래그는 무시됨

    const policy = await prisma.policy.create({
      data: {
        name,
        description,
        isActive: isActive ?? true,
        createdBy,
      },
    })

    return NextResponse.json({ success: true, data: policy }, { status: 201 })
  } catch (error) {
    console.error('Policy 생성 실패:', error)
    return NextResponse.json(
      { success: false, error: 'Policy를 생성하지 못했습니다.' },
      { status: 500 }
    )
  }
}
