'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getBrowserSupabase } from '@/lib/supabase/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const supabase = getBrowserSupabase()

export function AdminHeader() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    try {
      // 클라이언트 로그아웃 (localStorage 세션 삭제)
      await supabase.auth.signOut()
      
      // localStorage 완전 정리
      localStorage.clear()
      
      // 서버 로그아웃 (HttpOnly 쿠키 삭제)
      await fetch('/api/auth/signout', { method: 'POST' })
      
      // Hard redirect로 모든 캐시 무효화
      window.location.href = '/signin'
    } catch (error) {
      console.error('로그아웃 에러:', error)
      window.location.href = '/signin'
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Supabase Auth</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground">
                {user.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                로그아웃
              </Button>
            </>
          ) : (
            <>
              <Link href="/signin">
                <Button variant="ghost" size="sm">
                  로그인
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

