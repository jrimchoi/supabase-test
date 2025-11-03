'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AttributeSearchPanel } from '../attributes/AttributeSearchPanel'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2, CheckCircle } from 'lucide-react'
import { assignAttributeToType, unassignAttributeFromType } from '@/app/admin/attributes/actions'

type Attribute = {
  id: string
  name: string
  label: string
  attrType: string
  isRequired: boolean
  defaultValue: string | null
  validation: string | null
}

type TypeAttribute = {
  id: string
  attribute: Attribute
}

type TypeData = {
  id: string
  name: string
  description?: string | null
  createdAt: Date
  policy: {
    id: string
    name: string
  }
  policyTypes: {
    id: string
    policy: {
      id: string
      name: string
    }
  }[]
  typeAttributes: TypeAttribute[]
  _count: {
    typeAttributes: number
    objects: number
  }
}

export function TypeDetail({ type }: { type: TypeData }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleAddAttribute = async (attributeId: string) => {
    startTransition(async () => {
      const result = await assignAttributeToType(attributeId, type.id)
      if (result.success) {
        router.refresh()
        setTimeout(() => router.refresh(), 100)
      } else {
        alert(result.error || 'Attribute 할당 실패')
      }
    })
  }

  const handleRemoveAttribute = async (typeAttributeId: string, label: string) => {
    if (!confirm(`"${label}" Attribute를 제거하시겠습니까?`)) return

    startTransition(async () => {
      const result = await unassignAttributeFromType(typeAttributeId, type.id)
      if (result.success) {
        router.refresh()
        setTimeout(() => router.refresh(), 100)
      } else {
        alert(result.error || 'Attribute 제거 실패')
      }
    })
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto pb-5 pr-1">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 왼쪽: Type 정보 & Attribute 리스트 */}
      <div className="space-y-6">
        {/* Type 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>Type 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">이름</span>
              <span className="font-medium">{type.name}</span>
            </div>
            {type.description && (
              <div className="flex justify-between items-start">
                <span className="text-sm text-muted-foreground">설명</span>
                <span className="text-sm text-right max-w-xs">{type.description}</span>
              </div>
            )}
            <div className="flex justify-between items-start">
              <span className="text-sm text-muted-foreground">기본 Policy (리비전용)</span>
              <Badge variant="outline">
                {type.policy.name}
              </Badge>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-sm text-muted-foreground">연결된 Policy</span>
              <div className="flex flex-wrap gap-1 justify-end">
                {type.policyTypes.length > 0 ? (
                  type.policyTypes.map((pt) => (
                    <Badge key={pt.id} variant="secondary">
                      {pt.policy.name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">없음</span>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Attribute 수</span>
              <span className="font-medium">{type._count.typeAttributes}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Instance 수</span>
              <span className="font-medium">{type._count.objects}</span>
            </div>
          </CardContent>
        </Card>

        {/* Attribute 리스트 */}
        <Card>
          <CardHeader>
            <CardTitle>Attribute 목록 ({type.typeAttributes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {type.typeAttributes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                할당된 Attribute가 없습니다
              </div>
            ) : (
              <div className="space-y-2">
                {type.typeAttributes.map((ta) => (
                  <div
                    key={ta.id}
                    className="flex items-start justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{ta.attribute.label}</p>
                        {ta.attribute.isRequired && (
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-mono mt-1">
                        {ta.attribute.name}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {ta.attribute.attrType}
                        </Badge>
                        {ta.attribute.isRequired && (
                          <Badge variant="secondary" className="text-xs">
                            필수
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveAttribute(ta.id, ta.attribute.label)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 오른쪽: Attribute 검색 및 추가 */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Attribute 검색 및 추가</CardTitle>
          </CardHeader>
          <CardContent>
            <AttributeSearchPanel
              typeId={type.id}
              onAdd={handleAddAttribute}
              isPending={isPending}
            />
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  )
}

