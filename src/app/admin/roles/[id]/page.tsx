import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { getServerSupabase } from '@/lib/supabase/server'
import { RoleDetail } from '@/components/admin/roles/RoleDetail'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Params = {
  params: Promise<{ id: string }>
}

async function getRoleWithUsers(id: string) {
  // Role 정보
  const role = await prisma.role.findUnique({
    where: { id },
    include: {
      userRoles: {
        select: {
          id: true,
          userId: true,
        },
      },
      _count: {
        select: {
          permissions: true,
          userRoles: true,
        },
      },
    },
  })

  if (!role) return null

  // Supabase에서 사용자 정보 가져오기
  const supabase = await getServerSupabase()
  const userIds = role.userRoles.map((ur) => ur.userId)

  let users: any[] = []
  if (userIds.length > 0) {
    // UUID 형식 검증 (Supabase는 UUID 타입만 지원)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const validUuids = userIds.filter(id => uuidRegex.test(id))
    const invalidIds = userIds.filter(id => !uuidRegex.test(id))
    
    console.log('🔍 UUID 형식:', validUuids)
    console.log('⚠️  문자열 형식:', invalidIds)
    
    // UUID만 Supabase에서 조회
    let profiles: any[] = []
    if (validUuids.length > 0) {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, name, avatar_url')
        .in('id', validUuids)
      
      if (error) {
        console.error('❌ Supabase 에러:', error)
      }
      
      profiles = data || []
    }
    
    // 모든 사용자 ID를 순서대로 매핑
    users = userIds.map(id => {
      // UUID면 profiles에서 찾기
      if (uuidRegex.test(id)) {
        const profile = profiles.find(u => u.id === id)
        // profiles에 없으면 기본 정보로 표시
        return profile || {
          id,
          email: `${id.slice(0, 8)}...`, // UUID 앞부분만
          full_name: `사용자 (${id.slice(0, 8)})`,
          name: id.slice(0, 8),
          avatar_url: null,
        }
      } else {
        // 문자열 ID는 기본 정보로 표시
        return {
          id,
          email: id,
          full_name: id,
          name: id,
          avatar_url: null,
        }
      }
    })
    
    console.log('✅ 최종 users 배열:', users.length, users)
  }

  return {
    ...role,
    users,
  }
}

export default async function RoleDetailPage({ params }: Params) {
  const { id } = await params
  const roleData = await getRoleWithUsers(id)

  if (!roleData) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{roleData.name}</h1>
        <p className="text-muted-foreground mt-2">
          {roleData.description || 'Role 설명이 없습니다'}
        </p>
      </div>

      <Suspense fallback={<div>로딩 중...</div>}>
        <RoleDetail role={roleData} />
      </Suspense>
    </div>
  )
}

