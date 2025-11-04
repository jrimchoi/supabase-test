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
import { deleteRole, getRoleDependencies } from '@/app/admin/roles/actions'

type Role = {
  id: string
  name: string
  _count?: {
    permissions: number
    userRoles: number
  }
}

type Props = {
  role: Role | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function DeleteRoleDialog({ role, open, onOpenChange, onSuccess }: Props) {
  const [isPending, startTransition] = useTransition()
  const [dependencies, setDependencies] = useState<{
    permissions: number
    userRoles: number
  } | null>(null)

  useEffect(() => {
    if (role && open) {
      checkDependencies()
    }
  }, [role, open])

  const checkDependencies = async () => {
    if (!role) return

    try {
      const result = await getRoleDependencies(role.id)
      if (result.success && result.data) {
        setDependencies(result.data)
      }
    } catch (error) {
      console.error('종속성 체크 에러:', error)
    }
  }

  const handleDelete = async () => {
    if (!role) return

    startTransition(async () => {
      try {
        const result = await deleteRole(role.id)

        if (!result.success) {
          throw new Error(result.error || '삭제 실패')
        }

        onSuccess()
      } catch (error) {
        console.error('Role 삭제 에러:', error)
        alert(error instanceof Error ? error.message : '삭제 실패')
      }
    })
  }

  if (!role) return null

  const hasDependencies =
    (dependencies?.permissions || 0) > 0 ||
    (dependencies?.userRoles || 0) > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Role 삭제</DialogTitle>
          <DialogDescription>
            정말로 이 Role을 삭제하시겠습니까?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-md border p-4">
            <p className="text-sm font-medium">{role.name}</p>
          </div>

          {hasDependencies && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>경고: 종속 데이터 존재</AlertTitle>
              <AlertDescription>
                <p className="mb-2">이 Role을 삭제하면 다음 데이터도 함께 삭제됩니다:</p>
                <ul className="list-disc list-inside space-y-1">
                  {(dependencies?.permissions || 0) > 0 && (
                    <li>Permission: {dependencies?.permissions}개</li>
                  )}
                  {(dependencies?.userRoles || 0) > 0 && (
                    <li>User 할당: {dependencies?.userRoles}개</li>
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

