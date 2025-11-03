'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { getBrowserSupabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Moon, Sun, User, LogOut } from 'lucide-react'

const supabase = getBrowserSupabase()

export function MainHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  
  // 로그인/회원가입 페이지 체크
  const isAuthPage = pathname === '/signin' || pathname?.startsWith('/auth/')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // 초기 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // 세션 변경 리스너
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
      // 에러가 발생해도 로그인 페이지로 이동
      window.location.href = '/signin'
    }
  }

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="font-semibold">
          Supabase Auth
        </Link>
        <nav className="flex gap-2 text-sm items-center">
          {/* 로그인/회원가입 페이지에서는 최소 표시 */}
          {isAuthPage ? (
            <>
              <Link href="/" className="text-muted-foreground hover:text-foreground">
                홈
              </Link>
              {/* Dark Mode Toggle */}
              {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
              )}
            </>
          ) : loading ? (
            <>
              <span className="text-muted-foreground">로딩...</span>
              {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
              )}
            </>
          ) : user ? (
            <>
              <Link href="/admin" className="text-muted-foreground hover:text-foreground">
                관리자
              </Link>
              
              {/* Dark Mode Toggle */}
              {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
              )}
              
              {/* Profile Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.user_metadata?.full_name || '사용자'}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/signin" className="text-muted-foreground hover:text-foreground">
                로그인
              </Link>
              <Link href="/admin" className="text-muted-foreground hover:text-foreground">
                관리자
              </Link>
              
              {/* Dark Mode Toggle */}
              {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

