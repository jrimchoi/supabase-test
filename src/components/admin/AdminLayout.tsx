'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'

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
    description: '비즈니스 타입 관리',
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

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()

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

  return (
    <div className="flex flex-1 overflow-hidden bg-background">
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
          <div className="flex h-16 items-center justify-between border-b px-4">
            {sidebarOpen ? (
              <>
                <h2 className="text-lg font-bold">Policy Admin</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
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
                <Link
                  key={item.href}
                  href={item.href}
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
                  title={!sidebarOpen ? item.title : undefined}
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
              )
            })}
          </nav>

          {/* Footer */}
          <div className="border-t p-4">
            {sidebarOpen ? (
              <div className="text-xs text-muted-foreground">
                <p className="font-medium">Policy Management System</p>
                <p className="mt-1">Version 2.0 (EAV)</p>
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
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Menu Button */}
        {isMobile && !sidebarOpen && (
          <div className="fixed top-20 left-4 z-30">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="bg-background shadow-lg"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  )
}

