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
import { ScrollableTable } from '@/components/ui/scrollable-table'
import { PolicyDialog } from './PolicyDialog'
import { DeletePolicyDialog } from './DeletePolicyDialog'
import { PlusCircle, Edit, Trash2, Copy, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { deactivateOtherPolicies, updatePolicy } from '@/app/admin/policies/actions'

type Policy = {
  id: string
  name: string
  version: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  _count?: {
    states: number
    types: number
    businessObjects: number
  }
}

export function PolicyList({ initialPolicies }: { initialPolicies: Policy[] }) {
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null)
  const [policyToDelete, setPolicyToDelete] = useState<Policy | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleCreate = () => {
    setSelectedPolicy(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (policy: Policy) => {
    setSelectedPolicy(policy)
    setIsDialogOpen(true)
  }

  const handleDelete = (policy: Policy) => {
    setPolicyToDelete(policy)
    setIsDeleteDialogOpen(true)
  }

  const handleCreateVersion = async (policy: Policy) => {
    try {
      const response = await fetch('/api/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: policy.name,
          version: policy.version + 1,
          isActive: false,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '버전 생성 실패')
      }

      alert(`${policy.name} v${policy.version + 1} 생성 완료!`)
      
      // Server Component를 다시 렌더링하여 최신 데이터 가져오기
      startTransition(() => {
        router.refresh()
      })
    } catch (error) {
      console.error('버전 생성 에러:', error)
      alert(error instanceof Error ? error.message : '버전 생성 실패')
    }
  }

  const handleToggleActive = async (policy: Policy) => {
    startTransition(async () => {
      try {
        // 같은 이름의 다른 정책들을 비활성화
        if (!policy.isActive) {
          const deactivateResult = await deactivateOtherPolicies(policy.name, policy.id)
          if (!deactivateResult.success) {
            throw new Error('다른 정책 비활성화 실패')
          }
        }

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
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 mb-2">
        <Button onClick={handleCreate}>
          <PlusCircle className="mr-2 h-4 w-4" />
          새 Policy 생성
        </Button>
      </div>

      <ScrollableTable
        header={
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead className="w-20">버전</TableHead>
                <TableHead className="w-24">상태</TableHead>
                <TableHead className="w-32">State 수</TableHead>
                <TableHead className="w-32">Type 수</TableHead>
                <TableHead className="w-40">생성일</TableHead>
                <TableHead className="w-40">수정일</TableHead>
                <TableHead className="w-64">작업</TableHead>
              </TableRow>
            </TableHeader>
          </Table>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이름</TableHead>
              <TableHead className="w-20">버전</TableHead>
              <TableHead className="w-24">상태</TableHead>
              <TableHead className="w-32">State 수</TableHead>
              <TableHead className="w-32">Type 수</TableHead>
              <TableHead className="w-40">생성일</TableHead>
              <TableHead className="w-40">수정일</TableHead>
              <TableHead className="w-64">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
              {initialPolicies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    등록된 Policy가 없습니다
                  </TableCell>
                </TableRow>
              ) : (
                initialPolicies.map((policy) => (
                  <TableRow key={policy.id}>
                    <TableCell className="font-medium">{policy.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">v{policy.version}</Badge>
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
                    <TableCell className="text-center">
                      {policy._count?.states || 0}
                    </TableCell>
                    <TableCell className="text-center">
                      {policy._count?.types || 0}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(policy.createdAt), 'PPP', { locale: ko })}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(policy.updatedAt), 'PPP', { locale: ko })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(policy)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCreateVersion(policy)}
                          title="새 버전 생성"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
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

      <PolicyDialog
        policy={selectedPolicy}
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

