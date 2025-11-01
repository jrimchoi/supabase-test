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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { deletePolicy, getDependencies } from '@/app/admin/policies/actions'

type Policy = {
  id: string
  name: string
  version: number
  _count?: {
    states: number
    types: number
    businessObjects: number
  }
}

type Props = {
  policy: Policy | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function DeletePolicyDialog({ policy, open, onOpenChange, onSuccess }: Props) {
  const [isPending, startTransition] = useTransition()
  const [dependencies, setDependencies] = useState<{
    states: number
    types: number
    businessObjects: number
  } | null>(null)

  useEffect(() => {
    if (policy && open) {
      checkDependencies()
    }
  }, [policy, open])

  const checkDependencies = async () => {
    if (!policy) return

    try {
      const result = await getDependencies(policy.id)
      if (result.success && result.data) {
        setDependencies(result.data)
      }
    } catch (error) {
      console.error('종속성 체크 에러:', error)
    }
  }

  const handleDelete = async () => {
    if (!policy) return

    startTransition(async () => {
      try {
        const result = await deletePolicy(policy.id)

        if (!result.success) {
          throw new Error(result.error || '삭제 실패')
        }

        onSuccess()
      } catch (error) {
        console.error('Policy 삭제 에러:', error)
        alert(error instanceof Error ? error.message : '삭제 실패')
      }
    })
  }

  if (!policy) return null

  const hasDependencies =
    (dependencies?.states || 0) > 0 ||
    (dependencies?.types || 0) > 0 ||
    (dependencies?.businessObjects || 0) > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Policy 삭제</DialogTitle>
          <DialogDescription>
            정말로 이 Policy를 삭제하시겠습니까?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-md border p-4">
            <p className="text-sm font-medium">{policy.name}</p>
            <p className="text-sm text-muted-foreground">버전: v{policy.version}</p>
          </div>

          {hasDependencies && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>경고: 종속 데이터 존재</AlertTitle>
              <AlertDescription>
                <p className="mb-2">이 Policy를 삭제하면 다음 데이터도 함께 삭제됩니다:</p>
                <ul className="list-disc list-inside space-y-1">
                  {(dependencies?.states || 0) > 0 && (
                    <li>State: {dependencies?.states}개</li>
                  )}
                  {(dependencies?.types || 0) > 0 && (
                    <li>Type: {dependencies?.types}개</li>
                  )}
                  {(dependencies?.businessObjects || 0) > 0 && (
                    <li>BusinessObject: {dependencies?.businessObjects}개</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}
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
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? '삭제 중...' : '삭제'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

