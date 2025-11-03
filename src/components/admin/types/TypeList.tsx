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
import { TypeDialog } from './TypeDialog'
import { PlusCircle, Edit, Trash2, GitBranch, ChevronLeft, ChevronRight } from 'lucide-react'
import { deleteType } from '@/app/admin/types/actions'

type TypeListItem = {
  id: string
  name: string
  description: string | null
  prefix: string | null
  createdAt: Date
  updatedAt: Date
  policy: {
    name: string
    revisionSequence: string
  }
  parent: {
    id: string
    name: string
    description: string | null
  } | null
  _count?: {
    children: number
    objects: number
    typeAttributes: number
  }
}

export function TypeList({
  initialTypes,
}: {
  initialTypes: TypeListItem[]
}) {
  const [selectedType, setSelectedType] = useState<TypeListItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const router = useRouter()

  // 페이징 처리 (클라이언트 사이드)
  const { paginatedTypes, totalPages } = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    const paginated = initialTypes.slice(start, end)
    const total = Math.ceil(initialTypes.length / pageSize)
    return { paginatedTypes: paginated, totalPages: total }
  }, [initialTypes, currentPage, pageSize])

  const handlePageSizeChange = (value: string) => {
    setPageSize(value === 'all' ? initialTypes.length : parseInt(value, 10))
    setCurrentPage(1)
  }

  const handleCreate = () => {
    setSelectedType(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (type: TypeListItem) => {
    setSelectedType(type)
    setIsDialogOpen(true)
  }

  const handleDelete = async (type: TypeListItem) => {
    if (!confirm(`"${type.name}" 타입을 삭제하시겠습니까?`)) {
      return
    }

    startTransition(async () => {
      const result = await deleteType(type.id)
      if (result.success) {
        alert('삭제되었습니다.')
        router.refresh()
      } else {
        alert(result.error || '삭제 실패')
      }
    })
  }

  return (
    <div className="flex flex-col h-full mt-2.5">
      {/* 헤더 카드: 타이틀 + 설명 + 버튼 */}
      <div className="admin-header-wrapper">
        <Card>
          <CardContent className="admin-header-card-content">
            <h1 className="text-lg font-bold tracking-tight">Type 관리</h1>
            <p className="text-sm text-muted-foreground">비즈니스 타입을 생성하고 관리합니다 (총 {initialTypes.length}개)</p>
            <div className="flex-1" />
            <Button onClick={handleCreate} disabled={isPending}>
              <PlusCircle className="mr-2 h-4 w-4" />
              새 Type 생성
            </Button>
          </CardContent>
        </Card>
      </div>

      <ScrollableTable>
          <Table>
            <TableHeader>
            <TableRow>
              <TableHead className="w-40">Name</TableHead>
              <TableHead className="w-20">Prefix</TableHead>
              <TableHead className="w-56">Policy</TableHead>
              <TableHead className="w-44">Revision Seq</TableHead>
              <TableHead className="w-32">부모</TableHead>
              <TableHead className="w-16 text-center">자식</TableHead>
              <TableHead className="w-16 text-center">객체</TableHead>
              <TableHead className="w-16 text-center">속성</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-24">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTypes.map((type) => (
              <TableRow key={type.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                      {type.name}
                    </code>
                    {type.parent && (
                      <GitBranch className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {type.prefix ? (
                    <Badge variant="outline">{type.prefix}</Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">상속</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {type.policy.name}
                  </div>
                </TableCell>
                <TableCell>
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                    {type.policy.revisionSequence}
                  </code>
                </TableCell>
                <TableCell>
                  {type.parent ? (
                    <span className="text-xs">
                      {type.parent.name}
                      {type.parent.description && ` (${type.parent.description})`}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {type._count?.children || 0}
                </TableCell>
                <TableCell className="text-center">
                  {type._count?.objects || 0}
                </TableCell>
                <TableCell className="text-center">
                  {type._count?.typeAttributes || 0}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {type.description || '-'}
                  </TableCell>
                  <TableCell>
                  <div className="flex gap-1">
                    <Link href={`/admin/types/${type.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="상세보기 (Attribute 관리)"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(type)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                    </div>
                  </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollableTable>

      {/* 페이징 */}
      <div className="admin-table-spacing flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          총 {initialTypes.length}개 중 {(currentPage - 1) * pageSize + 1}-
          {Math.min(currentPage * pageSize, initialTypes.length)}개 표시
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

      <TypeDialog
        type={selectedType}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  )
}
