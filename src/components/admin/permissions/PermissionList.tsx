'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollableTable } from '@/components/ui/scrollable-table'
import { PermissionDialog } from './PermissionDialog'
import { PlusCircle, Edit, Trash2, Check, X, Search, XCircle } from 'lucide-react'
import { deletePermission } from '@/app/admin/permissions/actions'

type Permission = {
  id: string
  stateId: string
  resource: string
  action: string
  targetType: string
  roleId: string | null
  groupId: string | null
  userId: string | null
  expression: string | null
  isAllowed: boolean
  createdAt: Date
  state: {
    id: string
    name: string
    policy: {
      id: string
      name: string
    }
  }
  role: {
    id: string
    name: string
  } | null
  group: {
    id: string
    name: string
  } | null
}

type State = {
  id: string
  name: string
  policyId: string
  policy: {
    name: string
  }
}

type Role = {
  id: string
  name: string
}

type Group = {
  id: string
  name: string
}

export function PermissionList({
  initialPermissions,
  availableStates,
  availableRoles,
  availableGroups,
}: {
  initialPermissions: Permission[]
  availableStates: State[]
  availableRoles: Role[]
  availableGroups: Group[]
}) {
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [policySearch, setPolicySearch] = useState<string>('')
  const [resourceFilter, setResourceFilter] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const router = useRouter()

  const handleCreate = () => {
    setSelectedPermission(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (permission: Permission) => {
    setSelectedPermission(permission)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말로 이 Permission을 삭제하시겠습니까?')) return

    startTransition(async () => {
      const result = await deletePermission(id)
      if (result.success) {
        router.refresh()
      } else {
        alert(result.error || '삭제 실패')
      }
    })
  }

  const getTargetDisplay = (permission: Permission) => {
    if (permission.targetType === 'role' && permission.role) {
      return `Role: ${permission.role.name}`
    }
    if (permission.targetType === 'group' && permission.group) {
      return `Group: ${permission.group.name}`
    }
    if (permission.targetType === 'user' && permission.userId) {
      return `User: ${permission.userId.substring(0, 8)}...`
    }
    return '-'
  }

  // Policy 목록 추출 (검색용)
  const uniquePolicies = Array.from(
    new Set(initialPermissions.map((p) => p.state.policy.name))
  ).sort()

  // Policy 검색 필터링 (2자 이상)
  const filteredPolicyOptions = policySearch.length >= 2
    ? uniquePolicies.filter((policy) =>
        policy.toLowerCase().includes(policySearch.toLowerCase())
      )
    : []

  // 필터링
  const filteredPermissions = initialPermissions.filter((permission) => {
    const matchPolicy = !policySearch || policySearch.length < 2 || 
      permission.state.policy.name.toLowerCase().includes(policySearch.toLowerCase())
    const matchResource = !resourceFilter || permission.resource.toLowerCase().includes(resourceFilter.toLowerCase())
    return matchPolicy && matchResource
  })

  // 페이징
  const totalFiltered = filteredPermissions.length
  const totalPages = Math.ceil(totalFiltered / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedPermissions = filteredPermissions.slice(startIndex, endIndex)

  // 필터 변경 시 페이지 1로 리셋
  const handlePolicySearchChange = (value: string) => {
    setPolicySearch(value)
    setCurrentPage(1)
  }

  const handleResourceFilterChange = (value: string) => {
    setResourceFilter(value)
    setCurrentPage(1)
  }

  // 필터 초기화
  const handleResetFilters = () => {
    setPolicySearch('')
    setResourceFilter('')
    setCurrentPage(1)
  }

  const hasFilters = policySearch || resourceFilter

  return (
    <div className="flex flex-col h-full mt-2.5">
      {/* 헤더 카드: 타이틀 + 설명 + 버튼 + 필터 */}
      <div className="admin-header-wrapper">
        <Card>
          <CardContent className="admin-header-card-content flex-col items-start">
            {/* 타이틀 행 */}
            <div className="flex items-center w-full gap-2">
              <h1 className="text-lg font-bold tracking-tight">Permission 관리</h1>
              <p className="text-sm text-muted-foreground">
                State별 권한을 정의합니다 (User/Role/Group × create/view/modify/delete)
              </p>
              <div className="flex-1" />
              <Button onClick={handleCreate}>
                <PlusCircle className="mr-2 h-4 w-4" />
                새 Permission 생성
              </Button>
            </div>
            
            {/* 필터 행 */}
            <div className="flex gap-2 items-center w-full mt-2">
              <div className="relative w-48">
                <Input
                  placeholder="Policy 검색 (2자 이상)..."
                  value={policySearch}
                  onChange={(e) => handlePolicySearchChange(e.target.value)}
                  className="w-full"
                  autoComplete="off"
                />
                {policySearch.length >= 2 && filteredPolicyOptions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredPolicyOptions.map((policy) => (
                      <button
                        key={policy}
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm hover:bg-accent cursor-pointer"
                        onClick={() => {
                          setPolicySearch(policy)
                          setCurrentPage(1)
                        }}
                      >
                        {policy}
                      </button>
                    ))}
                  </div>
                )}
                {policySearch.length >= 2 && filteredPolicyOptions.length === 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg p-2">
                    <p className="text-xs text-muted-foreground text-center">검색 결과 없음</p>
                  </div>
                )}
              </div>

              <Input
                placeholder="Resource 검색..."
                value={resourceFilter}
                onChange={(e) => handleResourceFilterChange(e.target.value)}
                className="w-64"
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
              <TableHead className="w-40">Policy</TableHead>
              <TableHead className="w-32">State</TableHead>
              <TableHead className="w-32">Resource</TableHead>
              <TableHead className="w-40">Actions</TableHead>
              <TableHead className="w-48">Target</TableHead>
              <TableHead className="w-64">Expression</TableHead>
              <TableHead className="w-24">허용</TableHead>
              <TableHead className="w-32">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPermissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  {policySearch || resourceFilter ? '조건에 맞는 Permission이 없습니다' : '등록된 Permission이 없습니다'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedPermissions.map((permission) => (
                <TableRow key={permission.id}>
                  <TableCell>
                    <Badge variant="outline">{permission.state.policy.name}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{permission.state.name}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{permission.resource}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {permission.action.split(',').map((act, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {act.trim()}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">
                      <div className="font-medium capitalize">{permission.targetType}</div>
                      <div className="text-muted-foreground">
                        {getTargetDisplay(permission)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {permission.expression ? (
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {permission.expression}
                      </code>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {permission.isAllowed ? (
                      <Check className="h-4 w-4 text-green-600 mx-auto" />
                    ) : (
                      <X className="h-4 w-4 text-red-600 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(permission)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(permission.id)}
                        disabled={isPending}
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

      <PermissionDialog
        permission={selectedPermission}
        availableStates={availableStates}
        availableRoles={availableRoles}
        availableGroups={availableGroups}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={() => {
          setIsDialogOpen(false)
          startTransition(() => {
            router.refresh()
          })
        }}
      />

      {/* 클라이언트 사이드 페이징 */}
      <div className="admin-table-spacing flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          총 {totalFiltered}개 항목 ({policySearch || resourceFilter ? '필터링됨' : '전체'})
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              setPageSize(value === 'all' ? 999999 : Number(value))
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10개씩</SelectItem>
              <SelectItem value="20">20개씩</SelectItem>
              <SelectItem value="50">50개씩</SelectItem>
              <SelectItem value="100">100개씩</SelectItem>
              <SelectItem value="all">전체</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              이전
            </Button>
            <div className="flex items-center px-3 text-sm">
              {currentPage} / {totalPages || 1}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
            >
              다음
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

