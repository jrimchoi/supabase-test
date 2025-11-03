'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
import { AttributeDialog } from './AttributeDialog'
import { PlusCircle, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { deleteAttribute } from '@/app/admin/attributes/actions'

type Attribute = {
  id: string
  name: string
  label: string
  attrType: string
  isRequired: boolean
  typeAttributes: Array<{ type: { id: string; name: string } }>
}

export function AttributeList({ initialAttributes }: { initialAttributes: Attribute[] }) {
  const [selected, setSelected] = useState<Attribute | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const router = useRouter()

  // 페이징 처리 (클라이언트 사이드)
  const { paginatedAttributes, totalPages } = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    const paginated = initialAttributes.slice(start, end)
    const total = Math.ceil(initialAttributes.length / pageSize)
    return { paginatedAttributes: paginated, totalPages: total }
  }, [initialAttributes, currentPage, pageSize])

  const handlePageSizeChange = (value: string) => {
    setPageSize(value === 'all' ? initialAttributes.length : parseInt(value, 10))
    setCurrentPage(1)
  }

  const handleDelete = (attr: Attribute) => {
    if (!confirm(`"${attr.label}" Attribute를 삭제하시겠습니까?\n\n⚠️ 모든 Type에서 제거됩니다!`)) return
    startTransition(async () => {
      const result = await deleteAttribute(attr.id)
      if (result.success) router.refresh()
      else alert('삭제 실패')
    })
  }

  return (
    <div className="flex flex-col h-full mt-2.5">
      {/* 헤더 카드: 타이틀 + 설명 + 버튼 */}
      <div className="admin-header-wrapper">
        <Card>
          <CardContent className="admin-header-card-content">
            <h1 className="text-lg font-bold tracking-tight">Attribute 관리</h1>
            <p className="text-sm text-muted-foreground">공통 속성을 정의하고 Type에 할당합니다 (총 {initialAttributes.length}개)</p>
            <div className="flex-1" />
            <Button onClick={() => { setSelected(null); setIsDialogOpen(true) }}>
              <PlusCircle className="mr-2 h-4 w-4" />
              새 Attribute 생성
            </Button>
          </CardContent>
        </Card>
      </div>

      <ScrollableTable>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-48">Name</TableHead>
              <TableHead className="w-48">Label</TableHead>
              <TableHead>설명</TableHead>
              <TableHead className="w-24">타입</TableHead>
              <TableHead className="w-24">필수</TableHead>
              <TableHead className="w-48">사용 중인 Types</TableHead>
              <TableHead className="w-40">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAttributes.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">등록된 Attribute가 없습니다</TableCell></TableRow>
            ) : (
              paginatedAttributes.map((attr) => (
                <TableRow key={attr.id}>
                  <TableCell className="font-mono text-sm">{attr.name}</TableCell>
                  <TableCell>{attr.label}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {(attr as any).description || '-'}
                  </TableCell>
                  <TableCell><Badge variant="outline">{attr.attrType}</Badge></TableCell>
                  <TableCell className="text-center">{attr.isRequired ? '✓' : '-'}</TableCell>
                  <TableCell>
                    {attr.typeAttributes.length === 0 ? (
                      <span className="text-xs text-muted-foreground">미사용</span>
                    ) : (
                      <div className="flex gap-1 flex-wrap">
                        {attr.typeAttributes.map((ta) => (
                          <Badge key={ta.type.id} variant="secondary" className="text-xs">
                            {ta.type.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setSelected(attr); setIsDialogOpen(true) }}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(attr)} disabled={isPending}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
          총 {initialAttributes.length}개 중 {(currentPage - 1) * pageSize + 1}-
          {Math.min(currentPage * pageSize, initialAttributes.length)}개 표시
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

      <AttributeDialog attribute={selected} open={isDialogOpen} onOpenChange={setIsDialogOpen} onSuccess={() => { setIsDialogOpen(false); startTransition(() => router.refresh()) }} />
    </div>
  )
}

