'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TypeSearchPanel } from '../types/TypeSearchPanel'
import { AssignedTypesList } from '../types/AssignedTypesList'
import { addTypeToPolicy, removeTypeFromPolicy } from '@/app/admin/policies/[id]/actions'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'

type TypeData = {
  id: string
  name: string
  description: string | null
  prefix: string | null
}

type PolicyData = {
  id: string
  name: string
  description: string | null
  revisionSequence: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  types: TypeData[]
  _count: {
    states: number
    policyTypes: number
    types: number
    businessObjects: number
  }
}

export function PolicyDetail({ policy }: { policy: PolicyData }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleAddType = async (typeId: string) => {
    startTransition(async () => {
      const result = await addTypeToPolicy(policy.id, typeId)
      if (result.success) {
        router.refresh()
        setTimeout(() => router.refresh(), 100)
      } else {
        alert(result.error || 'Type 추가 실패')
      }
    })
  }

  const handleRemoveType = async (typeId: string) => {
    if (!confirm('이 Type을 Policy에서 제거하시겠습니까?')) return

    startTransition(async () => {
      const result = await removeTypeFromPolicy(policy.id, typeId)
      if (result.success) {
        router.refresh()
        setTimeout(() => router.refresh(), 100)
      } else {
        alert(result.error || 'Type 제거 실패')
      }
    })
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto pb-5 pr-1">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 왼쪽: Policy 정보 & Type 리스트 */}
      <div className="space-y-6">
        {/* Policy 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>Policy 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">이름</span>
              <span className="font-medium">{policy.name}</span>
            </div>
            {policy.description && (
              <div className="flex justify-between items-start">
                <span className="text-sm text-muted-foreground">설명</span>
                <span className="text-sm text-right max-w-xs">{policy.description}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">리비전 순서</span>
              <code className="text-xs bg-muted px-2 py-1 rounded">{policy.revisionSequence}</code>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">상태</span>
              <Badge variant={policy.isActive ? 'default' : 'secondary'}>
                {policy.isActive ? '활성' : '비활성'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">State 수</span>
              <span className="font-medium">{policy._count.states}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Type 수 (Many-to-Many)</span>
              <span className="font-medium">{policy._count.policyTypes}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">BusinessObject 수</span>
              <span className="font-medium">{policy._count.businessObjects}</span>
            </div>
          </CardContent>
        </Card>

        {/* Type 리스트 */}
        <Card>
          <CardHeader>
            <CardTitle>연결된 Type ({policy.types.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <AssignedTypesList
              types={policy.types}
              onRemove={handleRemoveType}
              isPending={isPending}
            />
          </CardContent>
        </Card>
      </div>

      {/* 오른쪽: Type 검색 및 추가 */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Type 검색 및 추가</CardTitle>
          </CardHeader>
          <CardContent>
            <TypeSearchPanel
              onAddType={handleAddType}
              excludeTypeIds={policy.types.map((t) => t.id)}
              isPending={isPending}
            />
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  )
}

