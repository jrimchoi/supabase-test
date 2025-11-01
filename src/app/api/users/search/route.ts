import { NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''

    // RLS 정책 수정 후 조회 가능
    const supabase = await getServerSupabase()

    // profiles 테이블에서 검색
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, name, avatar_url')
      .or(`email.ilike.%${query}%,full_name.ilike.%${query}%,name.ilike.%${query}%`)
      .limit(20)

    if (error) {
      console.error('프로필 검색 에러:', error)
      return NextResponse.json({ error: '검색 실패' }, { status: 500 })
    }

    return NextResponse.json({ users: profiles || [] })
  } catch (error) {
    console.error('사용자 검색 에러:', error)
    return NextResponse.json({ error: '검색 실패' }, { status: 500 })
  }
}

