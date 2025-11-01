'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getBrowserSupabase } from '@/lib/supabase/client'

const supabase = getBrowserSupabase()

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        console.log('🚫 [AuthGuard] 세션 없음, 리다이렉트:', pathname)
        router.replace(`/signin?redirectTo=${encodeURIComponent(pathname)}`)
        return
      }
      
      console.log('✅ [AuthGuard] 세션 확인:', session.user.email)
      setIsAuthenticated(true)
      setIsChecking(false)
    }

    checkSession()

    // 세션 변경 감지 (로그아웃 시)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        console.log('🚫 [AuthGuard] 로그아웃 감지')
        setIsAuthenticated(false)
        // 로그아웃 시에는 redirectTo 없이 /signin으로
        router.replace('/signin')
      }
    })

    return () => subscription.unsubscribe()
  }, [router, pathname])

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">인증 확인 중...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}

