import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { getServerSupabase } from '@/lib/supabase/server'
import { GroupDetail } from '@/components/admin/groups/GroupDetail'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Params = { params: Promise<{ id: string }> }

async function getGroupWithUsers(id: string) {
  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      parent: { select: { id: true, name: true } },
      userGroups: { select: { id: true, userId: true } },
      _count: { select: { children: true, permissions: true, userGroups: true } },
    },
  })

  if (!group) return null

  // Supabase에서 사용자 정보 가져오기
  const supabase = await getServerSupabase()
  const userIds = group.userGroups.map((ug) => ug.userId)

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
          email: `${id.slice(0, 8)}...`,
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

  return { ...group, users }
}

export default async function GroupDetailPage({ params }: Params) {
  const { id } = await params
  const groupData = await getGroupWithUsers(id)

  if (!groupData) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{groupData.name}</h1>
        <p className="text-muted-foreground mt-2">{groupData.description || 'Group 설명이 없습니다'}</p>
      </div>
      <Suspense fallback={<div>로딩 중...</div>}>
        <GroupDetail group={groupData} />
      </Suspense>
    </div>
  )
}

