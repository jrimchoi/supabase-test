'use client'

import { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

type BusinessObject = {
  id: string
  typeId: string | null
  name: string | null
  revision: string | null
  policyId: string
  currentState: string
  description: string | null
  owner: string | null
  createdBy: string | null
  updatedBy: string | null
  data: unknown
  createdAt: Date
  updatedAt: Date
  type: {
    id: string
    name: string
    description: string | null
    prefix: string | null
  } | null
  policy: {
    id: string
    name: string
    revisionSequence: string
  }
}

export function BusinessObjectList({
  initialObjects,
}: {
  initialObjects: BusinessObject[]
}) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // 페이징 처리 (클라이언트 사이드)
  const { paginatedObjects, totalPages } = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    const paginated = initialObjects.slice(start, end)
    const total = Math.ceil(initialObjects.length / pageSize)
    return { paginatedObjects: paginated, totalPages: total }
  }, [initialObjects, currentPage, pageSize])

  const handlePageSizeChange = (value: string) => {
    setPageSize(value === 'all' ? initialObjects.length : parseInt(value, 10))
    setCurrentPage(1)
  }

  return (
    <div className="flex flex-col h-full mt-2.5">
      {/* 헤더 카드: 타이틀 + 설명 */}
      <div className="admin-header-wrapper">
        <Card>
          <CardContent className="admin-header-card-content">
            <h1 className="text-lg font-bold tracking-tight">BusinessObject 관리</h1>
            <p className="text-sm text-muted-foreground">
              비즈니스 객체 인스턴스를 관리합니다 (총 {initialObjects.length}개)
            </p>
          </CardContent>
        </Card>
      </div>

      <ScrollableTable>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-48">Name</TableHead>
              <TableHead className="w-20">Revision</TableHead>
              <TableHead className="w-40">Type</TableHead>
              <TableHead className="w-48">Policy</TableHead>
              <TableHead className="w-32">State</TableHead>
              <TableHead className="w-32">Owner</TableHead>
              <TableHead className="w-32">Data 필드</TableHead>
              <TableHead className="w-40">생성일</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedObjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  등록된 BusinessObject가 없습니다
                </TableCell>
              </TableRow>
            ) : (
              paginatedObjects.map((obj) => (
                <TableRow key={obj.id}>
                  <TableCell>
                    <a
                      href={`/admin/business-objects/${obj.id}`}
                      className="hover:underline text-primary"
                    >
                      {obj.name ? (
                        <div className="font-mono text-sm">{obj.name}</div>
                      ) : (
                        <div className="text-xs font-mono">{obj.id.substring(0, 8)}...</div>
                      )}
                    </a>
                  </TableCell>
                  <TableCell>
                    {obj.revision ? (
                      <Badge variant="secondary">{obj.revision}</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {obj.type ? (
                      <div className="text-xs">
                        <div className="font-medium">{obj.type.name}</div>
                        {obj.type.description && (
                          <div className="text-muted-foreground">{obj.type.description}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">
                      <div>{obj.policy.name}</div>
                      <div className="text-muted-foreground">
                        ({obj.policy.revisionSequence})
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{obj.currentState}</Badge>
                  </TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">
                    {obj.owner ? obj.owner.substring(0, 8) + '...' : '-'}
                  </TableCell>
                  <TableCell className="text-center text-xs text-muted-foreground">
                    {obj.data && typeof obj.data === 'object' 
                      ? `${Object.keys(obj.data).length}개 속성`
                      : '-'
                    }
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(obj.createdAt), 'yyyy-MM-dd HH:mm', { locale: ko })}
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
          총 {initialObjects.length}개 중 {(currentPage - 1) * pageSize + 1}-
          {Math.min(currentPage * pageSize, initialObjects.length)}개 표시
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
    </div>
  )
}

