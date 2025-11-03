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
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollableTable } from '@/components/ui/scrollable-table'
import { ClientPagination } from '@/components/ui/client-pagination'
import { useClientPagination } from '@/hooks/useClientPagination'
import { StateDialog } from './StateDialog'
import { DeleteStateDialog } from './DeleteStateDialog'
import { PlusCircle, Edit, Trash2, CheckCircle, Circle } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

type State = {
  id: string
  name: string
  description: string | null
  policyId: string
  order: number
  isInitial: boolean
  isFinal: boolean
  createdAt: Date
  updatedAt: Date
  policy: {
    id: string
    name: string
  }
  _count?: {
    permissions: number
    fromTransitions: number
    toTransitions: number
  }
}

type Policy = {
  id: string
  name: string
}

export function StateList({
  initialStates,
  availablePolicies,
}: {
  initialStates: State[]
  availablePolicies: Policy[]
}) {
  const [selectedState, setSelectedState] = useState<State | null>(null)
  const [stateToDelete, setStateToDelete] = useState<State | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // 페이징 훅 사용
  const pagination = useClientPagination(initialStates, { initialPageSize: 20 })

  const handleCreate = () => {
    setSelectedState(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (state: State) => {
    setSelectedState(state)
    setIsDialogOpen(true)
  }

  const handleDelete = (state: State) => {
    setStateToDelete(state)
    setIsDeleteDialogOpen(true)
  }

  return (
    <div className="flex flex-col h-full mt-2.5">
      {/* 헤더 카드: 타이틀 + 설명 + 버튼 */}
      <div className="admin-header-wrapper">
        <Card>
          <CardContent className="admin-header-card-content">
            <h1 className="text-lg font-bold tracking-tight">State 관리</h1>
            <p className="text-sm text-muted-foreground">Policy별 상태를 정의하고 관리합니다 (총 {initialStates.length}개)</p>
            <div className="flex-1" />
            <Button onClick={handleCreate}>
              <PlusCircle className="mr-2 h-4 w-4" />
              새 State 생성
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
              <TableHead className="w-48">Policy</TableHead>
              <TableHead className="w-20">순서</TableHead>
              <TableHead className="w-24">초기</TableHead>
              <TableHead className="w-24">최종</TableHead>
              <TableHead className="w-28">권한</TableHead>
              <TableHead className="w-28">전이</TableHead>
              <TableHead className="w-40">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagination.paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  등록된 State가 없습니다
                </TableCell>
              </TableRow>
            ) : (
              pagination.paginatedData.map((state) => (
                <TableRow key={state.id}>
                  <TableCell className="font-medium">{state.name}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {state.description || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {state.policy.name}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{state.order}</TableCell>
                  <TableCell className="text-center">
                    {state.isInitial ? (
                      <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {state.isFinal ? (
                      <CheckCircle className="h-4 w-4 text-blue-600 mx-auto" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {state._count?.permissions || 0}
                  </TableCell>
                  <TableCell className="text-center">
                    {(state._count?.fromTransitions || 0) +
                      (state._count?.toTransitions || 0)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(state)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(state)}
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

      <StateDialog
        state={selectedState}
        availablePolicies={availablePolicies}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={() => {
          setIsDialogOpen(false)
          startTransition(() => {
            router.refresh()
          })
        }}
      />

      <DeleteStateDialog
        state={stateToDelete}
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

