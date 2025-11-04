'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollableTable } from '@/components/ui/scrollable-table'
import { ClientPagination } from '@/components/ui/client-pagination'
import { useClientPagination } from '@/hooks/useClientPagination'
import { AttributeDialog } from './AttributeDialog'
import { PlusCircle, Edit, Trash2, Search, XCircle } from 'lucide-react'
import { deleteAttribute } from '@/app/admin/attributes/actions'
import type { AttributeListItem } from '@/types'

export function AttributeList({ initialAttributes }: { initialAttributes: AttributeListItem[] }) {
  const [selected, setSelected] = useState<AttributeListItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // 필터 상태
  const [nameFilter, setNameFilter] = useState('')
  const [labelFilter, setLabelFilter] = useState('')

  // 필터링된 데이터
  const filteredAttributes = useMemo(() => {
    return initialAttributes.filter((attr) => {
      const matchName = !nameFilter || 
        attr.name.toLowerCase().includes(nameFilter.toLowerCase())
      const matchLabel = !labelFilter || 
        attr.label.toLowerCase().includes(labelFilter.toLowerCase())
      
      return matchName && matchLabel
    })
  }, [initialAttributes, nameFilter, labelFilter])

  // 페이징 훅 사용 (필터링된 데이터)
  const pagination = useClientPagination(filteredAttributes, { initialPageSize: 20 })

  // 필터 초기화
  const handleResetFilters = () => {
    setNameFilter('')
    setLabelFilter('')
  }

  const hasFilters = nameFilter || labelFilter

  const handleDelete = (attr: AttributeListItem) => {
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
          <CardContent className="admin-header-card-content flex-col items-start">
            <div className="flex items-center w-full gap-2">
              <h1 className="text-lg font-bold tracking-tight">Attribute 관리</h1>
              <p className="text-sm text-muted-foreground">공통 속성을 정의하고 Type에 할당합니다 (총 {filteredAttributes.length}개 / {initialAttributes.length}개)</p>
              <div className="flex-1" />
              <Button onClick={() => { setSelected(null); setIsDialogOpen(true) }}>
                <PlusCircle className="mr-2 h-4 w-4" />
                새 Attribute 생성
              </Button>
            </div>
            <div className="flex gap-2 items-center w-full mt-2">
              <Input placeholder="Attribute Name..." value={nameFilter} onChange={(e) => setNameFilter(e.target.value)} className="w-48" />
              <Input placeholder="Label..." value={labelFilter} onChange={(e) => setLabelFilter(e.target.value)} className="w-48" />
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
            {pagination.paginatedData.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">{hasFilters ? '조건에 맞는 Attribute가 없습니다' : '등록된 Attribute가 없습니다'}</TableCell></TableRow>
            ) : (
              pagination.paginatedData.map((attr) => (
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
                            {ta.type.name || '(이름 없음)'}
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

      <AttributeDialog attribute={selected} open={isDialogOpen} onOpenChange={setIsDialogOpen} onSuccess={() => { setIsDialogOpen(false); startTransition(() => router.refresh()) }} />
    </div>
  )
}

