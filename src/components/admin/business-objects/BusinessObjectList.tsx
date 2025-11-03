'use client'

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
import { ClientPagination } from '@/components/ui/client-pagination'
import { useClientPagination } from '@/hooks/useClientPagination'
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
  // 페이징 훅 사용
  const pagination = useClientPagination(initialObjects, { initialPageSize: 20 })

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
            {pagination.paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  등록된 BusinessObject가 없습니다
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

