'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollableTable } from '@/components/ui/scrollable-table'
import { ClientPagination } from '@/components/ui/client-pagination'
import { useClientPagination } from '@/hooks/useClientPagination'
import { RoleDialog } from './RoleDialog'
import { DeleteRoleDialog } from './DeleteRoleDialog'
import { PlusCircle, Edit, Trash2, Search, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { updateRole } from '@/app/admin/roles/actions'

type Role = {
  id: string
  name: string
  description: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  _count?: {
    permissions: number
    userRoles: number
  }
  userRoles?: Array<{
    user: {
      id: string
      email: string | null
    }
  }>
}

export function RoleList({ initialRoles }: { initialRoles: Role[] }) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // 필터 상태
  const [roleNameFilter, setRoleNameFilter] = useState('')
  const [userNameFilter, setUserNameFilter] = useState('')

  // 필터링된 데이터
  const filteredRoles = useMemo(() => {
    return initialRoles.filter((role) => {
      const matchRoleName = !roleNameFilter || 
        role.name.toLowerCase().includes(roleNameFilter.toLowerCase())
      const matchUserName = !userNameFilter || 
        (role.userRoles?.some(ur => 
          ur.user.email?.toLowerCase().includes(userNameFilter.toLowerCase())
        ) ?? false)
      
      return matchRoleName && matchUserName
    })
  }, [initialRoles, roleNameFilter, userNameFilter])

  // 페이징 훅 사용 (필터링된 데이터)
  const pagination = useClientPagination(filteredRoles, { initialPageSize: 20 })

  // 필터 초기화
  const handleResetFilters = () => {
    setRoleNameFilter('')
    setUserNameFilter('')
  }

  const hasFilters = roleNameFilter || userNameFilter

  const handleCreate = () => {
    setSelectedRole(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (role: Role) => {
    setSelectedRole(role)
    setIsDialogOpen(true)
  }

  const handleDelete = (role: Role) => {
    setRoleToDelete(role)
    setIsDeleteDialogOpen(true)
  }

  const handleToggleActive = async (role: Role) => {
    startTransition(async () => {
      try {
        const result = await updateRole(role.id, {
          isActive: !role.isActive,
        })

        if (!result.success) {
          throw new Error(result.error || '활성화 상태 변경 실패')
        }

        router.refresh()
      } catch (error) {
        console.error('활성화 토글 에러:', error)
        alert(error instanceof Error ? error.message : '활성화 상태 변경 실패')
      }
    })
  }

  return (
    <div className="flex flex-col h-full mt-2.5">
      {/* 헤더 카드: 타이틀 + 설명 + 버튼 + 필터 */}
      <div className="admin-header-wrapper">
        <Card>
          <CardContent className="admin-header-card-content flex-col items-start">
            {/* 타이틀 행 */}
            <div className="flex items-center w-full gap-2">
              <h1 className="text-lg font-bold tracking-tight">Role 관리</h1>
              <p className="text-sm text-muted-foreground">
                사용자 역할을 생성하고 관리합니다 (총 {filteredRoles.length}개 / {initialRoles.length}개)
              </p>
              <div className="flex-1" />
              <Button onClick={handleCreate}>
                <PlusCircle className="mr-2 h-4 w-4" />
                새 Role 생성
              </Button>
            </div>

            {/* 필터 행 */}
            <div className="flex gap-2 items-center w-full mt-2">
              <Input
                placeholder="Role Name..."
                value={roleNameFilter}
                onChange={(e) => setRoleNameFilter(e.target.value)}
                className="w-48"
              />
              <Input
                placeholder="User Email..."
                value={userNameFilter}
                onChange={(e) => setUserNameFilter(e.target.value)}
                className="w-48"
              />
              <Button
                variant="outline"
                size="icon"
                title="필터 적용"
                disabled={!hasFilters}
              >
                <Search className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleResetFilters}
                title="필터 초기화"
                disabled={!hasFilters}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <ScrollableTable>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>설명</TableHead>
                <TableHead className="w-24">상태</TableHead>
                <TableHead className="w-32">권한 수</TableHead>
                <TableHead className="w-32">사용자 수</TableHead>
                <TableHead className="w-40">생성일</TableHead>
                <TableHead className="w-40">수정일</TableHead>
                <TableHead className="w-40">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {pagination.paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  {hasFilters
                    ? '조건에 맞는 Role이 없습니다'
                    : '등록된 Role이 없습니다'}
                </TableCell>
              </TableRow>
            ) : (
              pagination.paginatedData.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">
                    <a
                      href={`/admin/roles/${role.id}`}
                      className="hover:underline text-primary"
                    >
                      {role.name}
                    </a>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {role.description || '-'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant={role.isActive ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleToggleActive(role)}
                    >
                      {role.isActive ? '활성' : '비활성'}
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    {role._count?.permissions || 0}
                  </TableCell>
                  <TableCell className="text-center">
                    {role._count?.userRoles || 0}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(role.createdAt), 'PPP', { locale: ko })}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(role.updatedAt), 'PPP', { locale: ko })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link href={`/admin/roles/${role.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="상세보기 (사용자 관리)"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(role)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollableTable>

      <ClientPagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalCount={pagination.totalCount}
        pageSize={pagination.pageSize}
        onPreviousPage={pagination.goToPreviousPage}
        onNextPage={pagination.goToNextPage}
        onPageSizeChange={pagination.handlePageSizeChange}
        canGoPrevious={pagination.canGoPrevious}
        canGoNext={pagination.canGoNext}
      />

      <RoleDialog
        role={selectedRole}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={() => {
          setIsDialogOpen(false)
          startTransition(() => {
            router.refresh()
          })
        }}
      />

      <DeleteRoleDialog
        role={roleToDelete}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onSuccess={() => {
          setIsDeleteDialogOpen(false)
          startTransition(() => {
            router.refresh()
          })
        }}
      />
    </div>
  )
}

