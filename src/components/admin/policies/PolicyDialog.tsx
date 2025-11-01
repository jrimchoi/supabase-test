'use client'

import { useState, useEffect, useTransition } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { createPolicy, updatePolicy } from '@/app/admin/policies/actions'

type Policy = {
  id: string
  name: string
  version: number
  isActive: boolean
}

type Props = {
  policy: Policy | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function PolicyDialog({ policy, open, onOpenChange, onSuccess }: Props) {
  const [name, setName] = useState('')
  const [version, setVersion] = useState(1)
  const [isActive, setIsActive] = useState(true)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (policy) {
      setName(policy.name)
      setVersion(policy.version)
      setIsActive(policy.isActive)
    } else {
      setName('')
      setVersion(1)
      setIsActive(true)
    }
  }, [policy, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      try {
        const result = policy
          ? await updatePolicy(policy.id, { name, version, isActive })
          : await createPolicy({ name, version, isActive })

        if (!result.success) {
          throw new Error(result.error || '저장 실패')
        }

        onSuccess()
      } catch (error) {
        console.error('Policy 저장 에러:', error)
        alert(error instanceof Error ? error.message : '저장 실패')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {policy ? 'Policy 수정' : '새 Policy 생성'}
            </DialogTitle>
            <DialogDescription>
              권한 정책 정보를 입력하세요
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">이름 *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 문서_결재_정책"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="version">버전 *</Label>
              <Input
                id="version"
                type="number"
                min="1"
                value={version}
                onChange={(e) => setVersion(Number(e.target.value))}
                required
              />
              <p className="text-sm text-muted-foreground">
                같은 이름의 Policy는 버전으로 구분됩니다
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked) => setIsActive(checked as boolean)}
              />
              <Label
                htmlFor="isActive"
                className="text-sm font-normal cursor-pointer"
              >
                활성화 (활성화된 Policy만 적용됩니다)
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              취소
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? '저장 중...' : '저장'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

