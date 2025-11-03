'use client'

import { useState, useTransition } from 'react'
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
import { ClientPagination } from '@/components/ui/client-pagination'
import { useClientPagination } from '@/hooks/useClientPagination'
import { PolicyDialog } from './PolicyDialog'
import { DeletePolicyDialog } from './DeletePolicyDialog'
import { PlusCircle, Edit, Trash2 } from 'lucide-react'
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
  const router = useRouter()

  // 페이징 훅 사용
  const pagination = useClientPagination(initialPolicies, { initialPageSize: 20 })

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
              {pagination.paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    등록된 Policy가 없습니다
                  </TableCell>
                </TableRow>
              ) : (
                pagination.paginatedData.map((policy) => (
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

