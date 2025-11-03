'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  createType,
  updateType,
  getAllPolicies,
  getAllTypes,
} from '@/app/admin/types/actions'

type Type = {
  id: string
  name: string
  description: string | null
  prefix: string | null
  policy: {
    name: string
    revisionSequence: string
  }
  parent: {
    id: string
    name: string
    description: string | null
  } | null
}

type Policy = {
  id: string
  name: string
  revisionSequence: string
}

type ParentType = {
  id: string
  name: string
  description: string | null
  prefix: string | null
}

export function TypeDialog({
  type,
  open,
  onOpenChange,
}: {
  type: Type | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    prefix: '',
    policyId: '',
    parentId: '',
  })
  const [policies, setPolicies] = useState<Policy[]>([])
  const [types, setTypes] = useState<ParentType[]>([])
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // 데이터 로드
  useEffect(() => {
    if (open) {
      startTransition(async () => {
        const [policiesResult, typesResult] = await Promise.all([
          getAllPolicies(),
          getAllTypes(),
        ])

        if (policiesResult.success) {
          setPolicies(policiesResult.data as Policy[])
        }

        if (typesResult.success) {
          setTypes(typesResult.data as ParentType[])
        }
      })
    }
  }, [open])

  // 수정 시 초기값 설정
  useEffect(() => {
    if (type) {
      setFormData({
        name: type.name,
        description: type.description || '',
        prefix: type.prefix || '',
        policyId: type.policy.name, // Policy 정보로 표시 (실제로는 ID 필요)
        parentId: type.parent?.id || '',
      })
    } else {
      setFormData({
        name: '',
        description: '',
        prefix: '',
        policyId: '',
        parentId: '',
      })
    }
  }, [type])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.policyId) {
      alert('Name과 Policy는 필수입니다.')
      return
    }

    startTransition(async () => {
      const data = {
        name: formData.name,
        description: formData.description || undefined,
        prefix: formData.prefix || undefined,
        policyId: formData.policyId,
        parentId: formData.parentId || null,
      }

      let result
      if (type) {
        result = await updateType(type.id, data)
      } else {
        result = await createType(data)
      }

      if (result.success) {
        alert(type ? '수정되었습니다.' : '생성되었습니다.')
        onOpenChange(false)
        router.refresh()
      } else {
        alert(result.error || '실패했습니다.')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] w-[1200px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {type ? 'Type 수정' : '새 Type 생성'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-1 py-4 space-y-4">
          {/* Name (필수) */}
          <div>
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="예: invoice, contract"
              disabled={!!type || isPending}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              고유한 타입 식별자 (영문, 소문자, 하이픈 사용)
            </p>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="예: 일반 송장"
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground mt-1">
              타입 설명 (선택)
            </p>
          </div>

          {/* Prefix */}
          <div>
            <Label htmlFor="prefix">Prefix</Label>
            <Input
              id="prefix"
              value={formData.prefix}
              onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
              placeholder="예: INV, CON"
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground mt-1">
              객체 이름 접두사 (선택, 부모로부터 상속 가능)
            </p>
            </div>

          {/* Policy (필수) */}
          <div>
            <Label htmlFor="policyId">
              Policy <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.policyId}
              onValueChange={(value) => setFormData({ ...formData, policyId: value })}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Policy 선택" />
              </SelectTrigger>
              <SelectContent>
                {policies.map((policy) => (
                  <SelectItem key={policy.id} value={policy.id}>
                    {policy.name} ({policy.revisionSequence})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              리비전 순서를 정의하는 Policy
            </p>
          </div>

          {/* Parent (선택) */}
          <div>
            <Label htmlFor="parentId">부모 타입 (선택)</Label>
            <Select
              value={formData.parentId || 'none'}
              onValueChange={(value) => setFormData({ ...formData, parentId: value === 'none' ? '' : value })}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="없음 (최상위)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">없음 (최상위)</SelectItem>
                {types
                  .filter((t) => t.id !== type?.id)
                  .map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} ({t.description || '설명 없음'})
                      {t.prefix && ` - ${t.prefix}`}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              계층 구조 설정 (prefix, name 상속 가능)
            </p>
          </div>
          </div>

          <DialogFooter className="flex-shrink-0 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              취소
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? '처리 중...' : type ? '수정' : '생성'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
