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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollableTable } from '@/components/ui/scrollable-table'
import { ClientPagination } from '@/components/ui/client-pagination'
import { useClientPagination } from '@/hooks/useClientPagination'
import { Search, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

type BusinessObject = {
  id: string
  name: string | null
  revision: string | null
  currentState: string
  description: string | null
  owner: string | null
  createdAt: Date
  updatedAt: Date
  type: {
    id: string
    name: string | null
    description: string | null
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
  // 필터 상태
  const [typeFilter, setTypeFilter] = useState('')
  const [nameFilter, setNameFilter] = useState('')
  const [revisionFilter, setRevisionFilter] = useState('')
  const [stateFilter, setStateFilter] = useState('')

  // 렌더링 성능 측정
  if (typeof window !== 'undefined') {
    const renderStart = performance.now()
    setTimeout(() => {
      const renderTime = performance.now() - renderStart
      console.log(`🎨 [BusinessObjectList] Render: ${renderTime.toFixed(2)}ms`)
    }, 0)
  }

  // 필터링된 데이터
  const filteredObjects = useMemo(() => {
    return initialObjects.filter((obj) => {
      const matchType = !typeFilter || 
        (obj.type?.name || '').toLowerCase().includes(typeFilter.toLowerCase())
      const matchName = !nameFilter || 
        (obj.name || '').toLowerCase().includes(nameFilter.toLowerCase())
      const matchRevision = !revisionFilter || 
        (obj.revision || '').toLowerCase().includes(revisionFilter.toLowerCase())
      const matchState = !stateFilter || 
        obj.currentState.toLowerCase().includes(stateFilter.toLowerCase())
      
      return matchType && matchName && matchRevision && matchState
    })
  }, [initialObjects, typeFilter, nameFilter, revisionFilter, stateFilter])

  // 페이징 훅 사용 (필터링된 데이터)
  const pagination = useClientPagination(filteredObjects, { initialPageSize: 10 })

  // 필터 초기화
  const handleResetFilters = () => {
    setTypeFilter('')
    setNameFilter('')
    setRevisionFilter('')
    setStateFilter('')
  }

  const hasFilters = typeFilter || nameFilter || revisionFilter || stateFilter

  return (
    <div className="flex flex-col h-full mt-2.5">
      {/* 헤더 카드: 타이틀 + 설명 + 필터 */}
      <div className="admin-header-wrapper">
        <Card>
          <CardContent className="admin-header-card-content flex-col items-start">
            {/* 타이틀 행 */}
            <div className="flex items-center w-full gap-2">
              <h1 className="text-lg font-bold tracking-tight">BusinessObject 관리</h1>
              <p className="text-sm text-muted-foreground">
                비즈니스 객체 인스턴스를 관리합니다 (총 {filteredObjects.length}개 / {initialObjects.length}개)
              </p>
            </div>

            {/* 필터 행 */}
            <div className="flex gap-2 items-center w-full mt-2">
              <Input
                placeholder="Type..."
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-48"
              />
              <Input
                placeholder="Name..."
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                className="w-48"
              />
              <Input
                placeholder="Revision..."
                value={revisionFilter}
                onChange={(e) => setRevisionFilter(e.target.value)}
                className="w-32"
              />
              <Input
                placeholder="State..."
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="w-32"
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
              <TableHead className="w-48">Name</TableHead>
              <TableHead className="w-20">Revision</TableHead>
              <TableHead className="w-40">Type</TableHead>
              <TableHead className="w-48">Policy</TableHead>
              <TableHead className="w-32">State</TableHead>
              <TableHead className="w-32">Owner</TableHead>
              <TableHead className="w-40">생성일</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagination.paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {hasFilters
                    ? '조건에 맞는 BusinessObject가 없습니다'
                    : '등록된 BusinessObject가 없습니다'}
                </TableCell>
              </TableRow>
            ) : (
              pagination.paginatedData.map((obj) => (
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
                        <div className="font-medium">{obj.type.name || '(이름 없음)'}</div>
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
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(obj.createdAt), 'yyyy-MM-dd HH:mm', { locale: ko })}
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
    </div>
  )
}

