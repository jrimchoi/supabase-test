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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollableTable } from '@/components/ui/scrollable-table'
import { TransitionDialog } from './TransitionDialog'
import { PlusCircle, Edit, Trash2, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { deleteTransition } from '@/app/admin/transitions/actions'

type Transition = {
  id: string
  fromStateId: string
  toStateId: string
  condition: string | null
  order: number | null
  createdAt: Date
  fromState: {
    id: string
    name: string
    policy: {
      id: string
      name: string
    }
  }
  toState: {
    id: string
    name: string
  }
}

type State = {
  id: string
  name: string
  policyId: string
  policy: {
    name: string
  }
}

export function TransitionList({
  initialTransitions,
  availableStates,
}: {
  initialTransitions: Transition[]
  availableStates: State[]
}) {
  const [selectedTransition, setSelectedTransition] = useState<Transition | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [policySearch, setPolicySearch] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const router = useRouter()

  const handleCreate = () => {
    setSelectedTransition(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (transition: Transition) => {
    setSelectedTransition(transition)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말로 이 Transition을 삭제하시겠습니까?')) return

    startTransition(async () => {
      const result = await deleteTransition(id)
      if (result.success) {
        router.refresh()
      } else {
        alert(result.error || '삭제 실패')
      }
    })
  }

  // Policy 목록 추출 (검색용)
  const uniquePolicies = Array.from(
    new Set(initialTransitions.map((t) => t.fromState.policy.name))
  ).sort()

  // Policy 검색 필터링 (2자 이상)
  const filteredPolicyOptions = policySearch.length >= 2
    ? uniquePolicies.filter((policy) =>
        policy.toLowerCase().includes(policySearch.toLowerCase())
      )
    : []

  // 필터링
  const filteredTransitions = initialTransitions.filter((transition) => {
    return !policySearch || policySearch.length < 2 || 
      transition.fromState.policy.name.toLowerCase().includes(policySearch.toLowerCase())
  })

  // 페이징
  const totalFiltered = filteredTransitions.length
  const totalPages = Math.ceil(totalFiltered / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedTransitions = filteredTransitions.slice(startIndex, endIndex)

  // 필터 변경 시 페이지 1로 리셋
  const handlePolicySearchChange = (value: string) => {
    setPolicySearch(value)
    setCurrentPage(1)
  }

  return (
    <div className="flex flex-col h-full mt-2.5">
      {/* 헤더 카드: 타이틀 + 설명 + 버튼 + 필터 */}
      <div className="admin-header-wrapper">
        <Card>
          <CardContent className="admin-header-card-content flex-col items-start">
            {/* 타이틀 행 */}
            <div className="flex items-center w-full gap-2">
              <h1 className="text-lg font-bold tracking-tight">StateTransition 관리</h1>
              <p className="text-sm text-muted-foreground">
                State 간 전이 관계를 정의합니다 (다중 next state 지원)
              </p>
              <div className="flex-1" />
              <Button onClick={handleCreate}>
                <PlusCircle className="mr-2 h-4 w-4" />
                새 Transition 생성
              </Button>
            </div>
            
            {/* 필터 행 */}
            <div className="flex gap-2 items-center w-full mt-2">
              <div className="relative w-48">
                <Input
                  placeholder="Policy 검색 (2자 이상)..."
                  value={policySearch}
                  onChange={(e) => handlePolicySearchChange(e.target.value)}
                  className="w-full"
                  autoComplete="off"
                />
                {policySearch.length >= 2 && filteredPolicyOptions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredPolicyOptions.map((policy) => (
                      <button
                        key={policy}
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm hover:bg-accent cursor-pointer"
                        onClick={() => {
                          setPolicySearch(policy)
                          setCurrentPage(1)
                        }}
                      >
                        {policy}
                      </button>
                    ))}
                  </div>
                )}
                {policySearch.length >= 2 && filteredPolicyOptions.length === 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg p-2">
                    <p className="text-xs text-muted-foreground text-center">검색 결과 없음</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ScrollableTable>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-40">Policy</TableHead>
              <TableHead className="w-40">From State</TableHead>
              <TableHead className="w-12"></TableHead>
              <TableHead className="w-40">To State</TableHead>
              <TableHead className="w-64">Condition</TableHead>
              <TableHead className="w-20">순서</TableHead>
              <TableHead className="w-40">생성일</TableHead>
              <TableHead className="w-32">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransitions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  {policySearch ? '조건에 맞는 Transition이 없습니다' : '등록된 Transition이 없습니다'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransitions.map((transition) => (
                <TableRow key={transition.id}>
                  <TableCell>
                    <Badge variant="outline">{transition.fromState.policy.name}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{transition.fromState.name}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{transition.toState.name}</span>
                  </TableCell>
                  <TableCell>
                    {transition.condition ? (
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {transition.condition}
                      </code>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {transition.order ?? '-'}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(transition.createdAt), 'yyyy-MM-dd', { locale: ko })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(transition)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(transition.id)}
                        disabled={isPending}
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

      <TransitionDialog
        transition={selectedTransition}
        availableStates={availableStates}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={() => {
          setIsDialogOpen(false)
          startTransition(() => {
            router.refresh()
          })
        }}
      />

      {/* 클라이언트 사이드 페이징 */}
      <div className="admin-table-spacing flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          총 {totalFiltered}개 항목 ({policySearch ? '필터링됨' : '전체'})
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              setPageSize(value === 'all' ? 999999 : Number(value))
              setCurrentPage(1)
            }}
          >
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
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              이전
            </Button>
            <div className="flex items-center px-3 text-sm">
              {currentPage} / {totalPages || 1}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
            >
              다음
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

