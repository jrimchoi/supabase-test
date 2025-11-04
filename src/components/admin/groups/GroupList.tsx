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
import { GroupDialog } from './GroupDialog'
import { DeleteGroupDialog } from './DeleteGroupDialog'
import { PlusCircle, Edit, Trash2, Search, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { updateGroup } from '@/app/admin/groups/actions'

type Group = {
  id: string
  name: string
  description: string | null
  parentId: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  parent?: {
    id: string
    name: string
  } | null
  _count?: {
    children: number
    permissions: number
    userGroups: number
  }
  userGroups?: Array<{
    user: {
      id: string
      email: string | null
    }
  }>
}

export function GroupList({ initialGroups }: { initialGroups: Group[] }) {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // 필터 상태
  const [groupNameFilter, setGroupNameFilter] = useState('')
  const [userNameFilter, setUserNameFilter] = useState('')

  // 필터링된 데이터
  const filteredGroups = useMemo(() => {
    return initialGroups.filter((group) => {
      const matchGroupName = !groupNameFilter || 
        group.name.toLowerCase().includes(groupNameFilter.toLowerCase())
      const matchUserName = !userNameFilter || 
        (group.userGroups?.some(ug => 
          ug.user.email?.toLowerCase().includes(userNameFilter.toLowerCase())
        ) ?? false)
      
      return matchGroupName && matchUserName
    })
  }, [initialGroups, groupNameFilter, userNameFilter])

  // 페이징 훅 사용 (필터링된 데이터)
  const pagination = useClientPagination(filteredGroups, { initialPageSize: 20 })

  // 필터 초기화
  const handleResetFilters = () => {
    setGroupNameFilter('')
    setUserNameFilter('')
  }

  const hasFilters = groupNameFilter || userNameFilter

  const handleCreate = () => {
    setSelectedGroup(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (group: Group) => {
    setSelectedGroup(group)
    setIsDialogOpen(true)
  }

  const handleDelete = (group: Group) => {
    setGroupToDelete(group)
    setIsDeleteDialogOpen(true)
  }

  const handleToggleActive = async (group: Group) => {
    startTransition(async () => {
      try {
        const result = await updateGroup(group.id, {
          isActive: !group.isActive,
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
      {/* 헤더 카드: 타이틀 + 설명 + 버튼 */}
      <div className="admin-header-wrapper">
        <Card>
          <CardContent className="admin-header-card-content flex-col items-start">
            <div className="flex items-center w-full gap-2">
              <h1 className="text-lg font-bold tracking-tight">Group 관리</h1>
              <p className="text-sm text-muted-foreground">사용자 그룹을 생성하고 관리합니다 (총 {filteredGroups.length}개 / {initialGroups.length}개)</p>
              <div className="flex-1" />
              <Button onClick={handleCreate}>
                <PlusCircle className="mr-2 h-4 w-4" />
                새 Group 생성
              </Button>
            </div>
            <div className="flex gap-2 items-center w-full mt-2">
              <Input placeholder="Group Name..." value={groupNameFilter} onChange={(e) => setGroupNameFilter(e.target.value)} className="w-48" />
              <Input placeholder="User Email..." value={userNameFilter} onChange={(e) => setUserNameFilter(e.target.value)} className="w-48" />
              <Button variant="outline" size="icon" title="필터 적용" disabled={!hasFilters}><Search className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" onClick={handleResetFilters} title="필터 초기화" disabled={!hasFilters}><XCircle className="h-4 w-4" /></Button>
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
              <TableHead className="w-40">부모 그룹</TableHead>
              <TableHead className="w-24">상태</TableHead>
              <TableHead className="w-24">하위</TableHead>
              <TableHead className="w-32">권한 수</TableHead>
              <TableHead className="w-32">사용자 수</TableHead>
              <TableHead className="w-40">생성일</TableHead>
              <TableHead className="w-40">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagination.paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  {hasFilters ? '조건에 맞는 Group이 없습니다' : '등록된 Group이 없습니다'}
                </TableCell>
              </TableRow>
            ) : (
              pagination.paginatedData.map((group) => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">
                    <a
                      href={`/admin/groups/${group.id}`}
                      className="hover:underline text-primary"
                    >
                      {group.name}
                    </a>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {group.description || '-'}
                  </TableCell>
                  <TableCell>
                    {group.parent ? (
                      <Badge variant="outline">{group.parent.name}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant={group.isActive ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleToggleActive(group)}
                    >
                      {group.isActive ? '활성' : '비활성'}
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    {group._count?.children || 0}
                  </TableCell>
                  <TableCell className="text-center">
                    {group._count?.permissions || 0}
                  </TableCell>
                  <TableCell className="text-center">
                    {group._count?.userGroups || 0}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(group.createdAt), 'PPP', { locale: ko })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link href={`/admin/groups/${group.id}`}>
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
                        onClick={() => handleDelete(group)}
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

      <GroupDialog
        group={selectedGroup}
        allGroups={initialGroups}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={() => {
          setIsDialogOpen(false)
          startTransition(() => {
            router.refresh()
          })
        }}
      />

      <DeleteGroupDialog
        group={groupToDelete}
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

