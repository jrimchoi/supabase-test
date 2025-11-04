import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ShieldCheck,
  GitBranch,
  Lock,
  UserCog,
  Users,
  FileType,
  List,
  Box,
} from 'lucide-react'

export const metadata = {
  title: 'Admin Dashboard',
  description: 'Policy 관리 시스템 대시보드',
}

// ISR: 10초 캐싱 (Dashboard 통계는 실시간성 필요)
export const revalidate = 10

async function getStats() {
  const [
    policiesCount,
    activePoliciesCount,
    statesCount,
    permissionsCount,
    rolesCount,
    groupsCount,
    typesCount,
    attributesCount,
    businessObjectsCount,
  ] = await Promise.all([
    prisma.policy.count(),
    prisma.policy.count({ where: { isActive: true } }),
    prisma.state.count(),
    prisma.permission.count(),
    prisma.role.count(),
    prisma.group.count(),
    prisma.type.count(),
    prisma.attribute.count(),
    prisma.businessObject.count(),
  ])

  return {
    policies: policiesCount,
    activePolicies: activePoliciesCount,
    states: statesCount,
    permissions: permissionsCount,
    roles: rolesCount,
    groups: groupsCount,
    types: typesCount,
    attributes: attributesCount,
    businessObjects: businessObjectsCount,
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  const statCards = [
    {
      title: 'Policies',
      value: stats.policies,
      description: `${stats.activePolicies}개 활성화`,
      icon: ShieldCheck,
      href: '/admin/policies',
    },
    {
      title: 'States',
      value: stats.states,
      description: '정책별 상태 정의',
      icon: GitBranch,
      href: '/admin/states',
    },
    {
      title: 'Permissions',
      value: stats.permissions,
      description: '권한 규칙',
      icon: Lock,
      href: '/admin/permissions',
    },
    {
      title: 'Roles',
      value: stats.roles,
      description: '사용자 역할',
      icon: UserCog,
      href: '/admin/roles',
    },
    {
      title: 'Groups',
      value: stats.groups,
      description: '사용자 그룹',
      icon: Users,
      href: '/admin/groups',
    },
    {
      title: 'Types',
      value: stats.types,
      description: '비즈니스 타입 (EAV)',
      icon: FileType,
      href: '/admin/types',
    },
    {
      title: 'Attributes',
      value: stats.attributes,
      description: '속성 정의',
      icon: List,
      href: '/admin/attributes',
    },
    {
      title: 'Business Objects',
      value: stats.businessObjects,
      description: '비즈니스 객체',
      icon: Box,
      href: '/admin/business-objects',
    },
  ]

  return (
    <div className="h-full overflow-y-auto px-6 py-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Policy 기반 권한 관리 시스템 개요
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <a key={stat.title} href={stat.href}>
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            </a>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">빠른 시작</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            <a
              href="/admin/policies"
              className="block p-2.5 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="font-medium text-sm">새 Policy 생성</div>
              <div className="text-xs text-muted-foreground">
                권한 정책을 생성하고 관리합니다
              </div>
            </a>
            <a
              href="/admin/roles"
              className="block p-2.5 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="font-medium text-sm">Role 관리</div>
              <div className="text-xs text-muted-foreground">
                사용자 역할을 정의합니다
              </div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">EAV 패턴</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            <a
              href="/admin/types"
              className="block p-2.5 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="font-medium text-sm">Type 정의</div>
              <div className="text-xs text-muted-foreground">
                Invoice, Contract 등 비즈니스 타입
              </div>
            </a>
            <a
              href="/admin/attributes"
              className="block p-2.5 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="font-medium text-sm">Attribute 정의</div>
              <div className="text-xs text-muted-foreground">
                Type별 속성 스키마
              </div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">시스템 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 pt-0">
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-muted-foreground">버전</span>
              <span className="text-xs font-medium">2.0 (EAV)</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-muted-foreground">데이터베이스</span>
              <span className="text-xs font-medium">PostgreSQL</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-muted-foreground">ORM</span>
              <span className="text-xs font-medium">Prisma</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity (Placeholder) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>최근 활동</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-sm text-muted-foreground text-center py-4">
            최근 활동 로그가 여기에 표시됩니다
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

