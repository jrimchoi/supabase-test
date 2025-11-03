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
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollableTable } from '@/components/ui/scrollable-table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GroupDialog } from './GroupDialog'
import { DeleteGroupDialog } from './DeleteGroupDialog'
import { PlusCircle, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
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
}

export function GroupList({ initialGroups }: { initialGroups: Group[] }) {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const router = useRouter()

  // 페이징 처리 (클라이언트 사이드)
  const { paginatedGroups, totalPages } = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    const paginated = initialGroups.slice(start, end)
    const total = Math.ceil(initialGroups.length / pageSize)
    return { paginatedGroups: paginated, totalPages: total }
  }, [initialGroups, currentPage, pageSize])

  const handlePageSizeChange = (value: string) => {
    setPageSize(value === 'all' ? initialGroups.length : parseInt(value, 10))
    setCurrentPage(1)
  }

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
          <CardContent className="admin-header-card-content">
            <h1 className="text-lg font-bold tracking-tight">Group 관리</h1>
            <p className="text-sm text-muted-foreground">사용자 그룹을 생성하고 관리합니다 (총 {initialGroups.length}개)</p>
            <div className="flex-1" />
            <Button onClick={handleCreate}>
              <PlusCircle className="mr-2 h-4 w-4" />
              새 Group 생성
            </Button>
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
            {paginatedGroups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  등록된 Group이 없습니다
                </TableCell>
              </TableRow>
            ) : (
              paginatedGroups.map((group) => (
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

      {/* 페이징 */}
      <div className="admin-table-spacing flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          총 {initialGroups.length}개 중 {(currentPage - 1) * pageSize + 1}-
          {Math.min(currentPage * pageSize, initialGroups.length)}개 표시
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm">
            {currentPage} / {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
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
      </div>

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

