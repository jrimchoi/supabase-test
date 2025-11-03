'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  UserCog,
  GitBranch,
  GitMerge,
  Lock,
  Box,
  FileType,
  List,
  Menu,
  X,
  Palette,
  Moon,
  Sun,
  User,
  LogOut,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Database,
  Table as TableIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { NavTooltip } from './NavTooltip'
import { getBrowserSupabase } from '@/lib/supabase/client'

const supabase = getBrowserSupabase()

/**
 * AdminLayout 높이 계산 함수
 * 화면 높이에 맞춰 레이아웃 높이를 동적으로 설정합니다.
 * 
 * @returns 계산된 높이 (px 단위)
 */
function calculateLayoutHeight(): string {
  if (typeof window === 'undefined') return '100vh'
  
  const screenHeight = window.innerHeight
  return `${screenHeight}px`
}

type NavItem = {
  title: string
  href: string
  icon: React.ElementType
  description?: string
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    description: '관리자 대시보드',
  },
  {
    title: 'Policies',
    href: '/admin/policies',
    icon: ShieldCheck,
    description: '권한 정책 관리',
  },
  {
    title: 'States',
    href: '/admin/states',
    icon: GitBranch,
    description: '상태 관리',
  },
  {
    title: 'Transitions',
    href: '/admin/transitions',
    icon: GitMerge,
    description: '상태 전이 관리',
  },
  {
    title: 'Permissions',
    href: '/admin/permissions',
    icon: Lock,
    description: '권한 관리',
  },
  {
    title: 'Roles',
    href: '/admin/roles',
    icon: UserCog,
    description: '역할 관리',
  },
  {
    title: 'Groups',
    href: '/admin/groups',
    icon: Users,
    description: '그룹 관리',
  },
  {
    title: 'Types',
    href: '/admin/types',
    icon: FileType,
    description: '비즈니스 타입 관리 (계층 구조, 리비전, Attribute 연결)',
  },
  {
    title: 'Attributes',
    href: '/admin/attributes',
    icon: List,
    description: '속성 정의 관리',
  },
  {
    title: 'Business Objects',
    href: '/admin/business-objects',
    icon: Box,
    description: '비즈니스 객체 관리',
  },
]

const helpItems: NavItem[] = [
  {
    title: 'Design Template',
    href: '/admin/design-template',
    icon: Palette,
    description: 'UI 컴포넌트 스타일 가이드',
  },
  {
    title: 'Query Test',
    href: '/admin/query-test',
    icon: Database,
    description: 'DB 쿼리 성능 테스트',
  },
  {
    title: 'Table Spec',
    href: '/admin/table-spec',
    icon: TableIcon,
    description: 'DB 테이블 구조 및 인덱스',
  },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [layoutHeight, setLayoutHeight] = useState<string>('100vh')
  const layoutRef = useRef<HTMLDivElement>(null)

  // 레이아웃 높이 계산 및 적용
  useEffect(() => {
    const updateLayoutHeight = () => {
      const height = calculateLayoutHeight()
      setLayoutHeight(height)
      
      // DOM에 직접 적용
      if (layoutRef.current) {
        layoutRef.current.style.height = height
      }
    }

    // 초기 로드 시
    updateLayoutHeight()

    // 윈도우 리사이즈 시
    window.addEventListener('resize', updateLayoutHeight)
    
    return () => window.removeEventListener('resize', updateLayoutHeight)
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  // 사용자 정보 가져오기
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

  // 화면 크기 감지하여 자동으로 사이드바 접기
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile) {
        setSidebarOpen(false)
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      localStorage.clear()
      await fetch('/api/auth/signout', { method: 'POST' })
      window.location.href = '/signin'
    } catch (error) {
      console.error('로그아웃 에러:', error)
      window.location.href = '/signin'
    }
  }

  return (
    <div ref={layoutRef} className="admin-layout-container" style={{ height: layoutHeight }}>
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'bg-card border-r transition-all duration-300',
          isMobile
            ? cn(
                'fixed top-0 left-0 h-screen w-64 z-50',
                !sidebarOpen && '-translate-x-full'
              )
            : cn(
                'relative z-0',
                sidebarOpen ? 'w-64' : 'w-16'
              )
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo & Toggle */}
          <div className="flex h-16 items-center gap-3 border-b px-4 bg-muted/30">
            {sidebarOpen ? (
              <>
               <div className="flex items-center gap-2 flex-1">
                 <Image
                   src="/logo.svg"
                   alt="Team Workflow Logo"
                   width={40}
                   height={40}
                   className="rounded-xl shadow-sm flex-shrink-0"
                 />
                 <h2 className="text-lg font-bold leading-[40px]">Team Workflow</h2>
               </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="mx-auto"
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <NavTooltip
                  key={item.href}
                  title={item.title}
                  description={item.description}
                  show={!sidebarOpen}
                >
                  <Link
                    href={item.href}
                    prefetch={true}
                    onClick={() => {
                      if (isMobile) {
                        setSidebarOpen(false)
                      }
                    }}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-accent',
                      isActive
                        ? 'bg-accent text-accent-foreground font-medium'
                        : 'text-muted-foreground',
                      !sidebarOpen && 'justify-center'
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {sidebarOpen && (
                      <div className="flex-1">
                        <div className="text-sm">{item.title}</div>
                        {item.description && (
                          <div className="text-xs text-muted-foreground truncate">
                            {item.description}
                          </div>
                        )}
                      </div>
                    )}
                  </Link>
                </NavTooltip>
              )
            })}
          </nav>

          {/* Help Menu Section */}
          <div className="border-t p-2">
            {/* Help Toggle */}
            <button
              onClick={() => setHelpOpen(!helpOpen)}
              className={cn(
                'w-full flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-accent text-muted-foreground',
                !sidebarOpen && 'justify-center'
              )}
            >
              <HelpCircle className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && (
                <>
                  <span className="flex-1 text-sm text-left">Help</span>
                  {helpOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </>
              )}
            </button>

            {/* Help Sub-menu */}
            {sidebarOpen && helpOpen && (
              <div className="mt-1 space-y-1 pl-4">
                {helpItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={true}
                      onClick={() => {
                        if (isMobile) {
                          setSidebarOpen(false)
                        }
                      }}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-accent',
                        isActive
                          ? 'bg-accent text-accent-foreground font-medium'
                          : 'text-muted-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm">{item.title}</div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}

            {/* 접힌 상태에서 Help 메뉴 항목들 */}
            {!sidebarOpen && (
              <div className="space-y-1 mt-1">
                {helpItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href

                  return (
                    <NavTooltip
                      key={item.href}
                      title={item.title}
                      description={item.description}
                      show={true}
                    >
                      <Link
                        href={item.href}
                        prefetch={true}
                        onClick={() => {
                          if (isMobile) {
                            setSidebarOpen(false)
                          }
                        }}
                        className={cn(
                          'flex items-center justify-center rounded-lg px-3 py-2 transition-all hover:bg-accent',
                          isActive
                            ? 'bg-accent text-accent-foreground font-medium'
                            : 'text-muted-foreground'
                        )}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                      </Link>
                    </NavTooltip>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t p-4">
            {sidebarOpen ? (
              <div className="text-xs text-muted-foreground">
                <p className="font-medium">Team Workflow</p>
                <p className="mt-1">Version 2.0 (Policy System)</p>
              </div>
            ) : (
              <div className="text-center text-xs text-muted-foreground">
                v2.0
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <div className="flex-shrink-0 border-b bg-background h-16 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        {isMobile && !sidebarOpen && (
            <Button
              variant="outline"
                size="icon"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            )}
            {/* 페이지 타이틀 제거 - 각 페이지의 Card 헤더에 표시 */}
          </div>
          
          <div className="flex items-center gap-2">
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
            {user && (
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
            )}
          </div>
        </div>
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  )
}

