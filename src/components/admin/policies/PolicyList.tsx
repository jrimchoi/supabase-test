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
import { Card, CardContent } from '@/components/ui/card'
import { ScrollableTable } from '@/components/ui/scrollable-table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PolicyDialog } from './PolicyDialog'
import { DeletePolicyDialog } from './DeletePolicyDialog'
import { PlusCircle, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { updatePolicy } from '@/app/admin/policies/actions'

type Policy = {
  id: string
  name: string
  description?: string | null
  revisionSequence: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

type Props = Readonly<{
  initialPolicies: Policy[]
}>

export function PolicyList({ initialPolicies }: Props) {
  const [policyToDelete, setPolicyToDelete] = useState<Policy | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [, startTransition] = useTransition()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const router = useRouter()

  // 페이징 처리 (클라이언트 사이드)
  const { paginatedPolicies, totalPages } = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    const paginated = initialPolicies.slice(start, end)
    const total = Math.ceil(initialPolicies.length / pageSize)
    return { paginatedPolicies: paginated, totalPages: total }
  }, [initialPolicies, currentPage, pageSize])

  const handlePageSizeChange = (value: string) => {
    setPageSize(value === 'all' ? initialPolicies.length : parseInt(value, 10))
    setCurrentPage(1)
  }

  const handleCreate = () => {
    setIsDialogOpen(true)
  }

  const handleDelete = (policy: Policy) => {
    setPolicyToDelete(policy)
    setIsDeleteDialogOpen(true)
  }

  const handleToggleActive = async (policy: Policy) => {
    startTransition(async () => {
      try {

        // 현재 정책 활성화 상태 토글
        const result = await updatePolicy(policy.id, {
          isActive: !policy.isActive,
        })

        if (!result.success) {
          throw new Error(result.error || '활성화 상태 변경 실패')
        }

        router.refresh()
      } catch (error) {
        console.error('활성화 토글 에러:', error)
        alert(error instanceof Error ? error.message : '활성화 상태 변경 실패')
      }
    })
  }

  return (
    <div className="flex flex-col h-full mt-2.5">
      {/* 헤더 카드: 타이틀 + 설명 + 버튼 */}
      <div className="admin-header-wrapper">
        <Card>
          <CardContent className="admin-header-card-content">
            <h1 className="text-lg font-bold tracking-tight">Policy 관리</h1>
            <p className="text-sm text-muted-foreground">권한 정책을 생성하고 관리합니다 (총 {initialPolicies.length}개)</p>
            <div className="flex-1" />
            <Button onClick={handleCreate}>
              <PlusCircle className="mr-2 h-4 w-4" />
              새 Policy 생성
            </Button>
          </CardContent>
        </Card>
      </div>

      <ScrollableTable>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-48">이름</TableHead>
              <TableHead>설명</TableHead>
              <TableHead className="w-32">Revision Seq</TableHead>
              <TableHead className="w-24">상태</TableHead>
              <TableHead className="w-40">생성일</TableHead>
              <TableHead className="w-40">수정일</TableHead>
              <TableHead className="w-48">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
              {paginatedPolicies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    등록된 Policy가 없습니다
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPolicies.map((policy) => (
                  <TableRow key={policy.id}>
                    <TableCell className="font-medium">{policy.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {policy.description || '-'}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                        {policy.revisionSequence}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant={policy.isActive ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleToggleActive(policy)}
                      >
                        {policy.isActive ? '활성' : '비활성'}
                      </Button>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(policy.createdAt), 'PPP', { locale: ko })}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(policy.updatedAt), 'PPP', { locale: ko })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link href={`/admin/policies/${policy.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(policy)}
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
          총 {initialPolicies.length}개 중 {(currentPage - 1) * pageSize + 1}-
          {Math.min(currentPage * pageSize, initialPolicies.length)}개 표시
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

      <PolicyDialog
        policy={null}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={() => {
          setIsDialogOpen(false)
          startTransition(() => {
            router.refresh()
          })
        }}
      />

      <DeletePolicyDialog
        policy={policyToDelete}
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

