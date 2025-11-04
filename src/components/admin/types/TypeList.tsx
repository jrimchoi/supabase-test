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
import { TypeDialog } from './TypeDialog'
import { PlusCircle, Edit, Trash2, GitBranch, Search, XCircle } from 'lucide-react'
import { deleteType } from '@/app/admin/types/actions'
import type { TypeListItem } from '@/types'

export function TypeList({
  initialTypes,
}: {
  initialTypes: TypeListItem[]
}) {
  const [selectedType, setSelectedType] = useState<TypeListItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // 필터 상태
  const [typeNameFilter, setTypeNameFilter] = useState('')
  const [policyNameFilter, setPolicyNameFilter] = useState('')

  // 필터링된 데이터
  const filteredTypes = useMemo(() => {
    return initialTypes.filter((type) => {
      const matchTypeName = !typeNameFilter || 
        (type.name && type.name.toLowerCase().includes(typeNameFilter.toLowerCase()))
      const matchPolicyName = !policyNameFilter || 
        type.policy.name.toLowerCase().includes(policyNameFilter.toLowerCase())
      
      return matchTypeName && matchPolicyName
    })
  }, [initialTypes, typeNameFilter, policyNameFilter])

  // 페이징 훅 사용 (필터링된 데이터)
  const pagination = useClientPagination(filteredTypes, { initialPageSize: 20 })

  // 필터 초기화
  const handleResetFilters = () => {
    setTypeNameFilter('')
    setPolicyNameFilter('')
  }

  const hasFilters = typeNameFilter || policyNameFilter

  const handleCreate = () => {
    setSelectedType(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (type: TypeListItem) => {
    setSelectedType(type)
    setIsDialogOpen(true)
  }

  const handleDelete = async (type: TypeListItem) => {
    if (!confirm(`"${type.name || '(이름 없음)'}" 타입을 삭제하시겠습니까?`)) {
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
          <CardContent className="admin-header-card-content flex-col items-start">
            <div className="flex items-center w-full gap-2">
              <h1 className="text-lg font-bold tracking-tight">Type 관리</h1>
              <p className="text-sm text-muted-foreground">비즈니스 타입을 생성하고 관리합니다 (총 {filteredTypes.length}개 / {initialTypes.length}개)</p>
              <div className="flex-1" />
              <Button onClick={handleCreate} disabled={isPending}>
                <PlusCircle className="mr-2 h-4 w-4" />
                새 Type 생성
              </Button>
            </div>
            <div className="flex gap-2 items-center w-full mt-2">
              <Input placeholder="Type Name..." value={typeNameFilter} onChange={(e) => setTypeNameFilter(e.target.value)} className="w-48" />
              <Input placeholder="Policy Name..." value={policyNameFilter} onChange={(e) => setPolicyNameFilter(e.target.value)} className="w-48" />
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
            {pagination.paginatedData.map((type) => (
              <TableRow key={type.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                      {type.name || '(이름 없음)'}
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

      <TypeDialog
        type={selectedType}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  )
}
