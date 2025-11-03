'use client'

import { useState, useTransition, useMemo } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StateDialog } from './StateDialog'
import { DeleteStateDialog } from './DeleteStateDialog'
import { PlusCircle, Edit, Trash2, CheckCircle, Circle, ChevronLeft, ChevronRight } from 'lucide-react'
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
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const router = useRouter()

  // 페이징 처리 (클라이언트 사이드)
  const { paginatedStates, totalPages } = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    const paginated = initialStates.slice(start, end)
    const total = Math.ceil(initialStates.length / pageSize)
    return { paginatedStates: paginated, totalPages: total }
  }, [initialStates, currentPage, pageSize])

  const handlePageSizeChange = (value: string) => {
    setPageSize(value === 'all' ? initialStates.length : parseInt(value, 10))
    setCurrentPage(1)
  }

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
            {paginatedStates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  등록된 State가 없습니다
                </TableCell>
              </TableRow>
            ) : (
              paginatedStates.map((state) => (
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

      {/* 페이징 */}
      <div className="admin-table-spacing flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          총 {initialStates.length}개 중 {(currentPage - 1) * pageSize + 1}-
          {Math.min(currentPage * pageSize, initialStates.length)}개 표시
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

