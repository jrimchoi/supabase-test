'use client'

import { useState, useEffect, useTransition } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { deleteType, getTypeDependencies } from '@/app/admin/types/actions'

type Type = { id: string; name: string; _count?: { typeAttributes: number; instances: number } }
type Props = { type: Type | null; open: boolean; onOpenChange: (open: boolean) => void; onSuccess: () => void }

export function DeleteTypeDialog({ type, open, onOpenChange, onSuccess }: Props) {
  const [isPending, startTransition] = useTransition()
  const [dependencies, setDependencies] = useState<{ attributes: number; instances: number } | null>(null)

  useEffect(() => {
    if (type && open) {
      getTypeDependencies(type.id).then((result) => {
        if (result.success && result.data) setDependencies(result.data)
      })
    }
  }, [type, open])

  const handleDelete = () => {
    if (!type) return
    startTransition(async () => {
      try {
        const result = await deleteType(type.id)
        if (!result.success) throw new Error(result.error || '삭제 실패')
        onSuccess()
      } catch (error) {
        alert(error instanceof Error ? error.message : '삭제 실패')
      }
    })
  }

  if (!type) return null

  const hasDeps = (dependencies?.attributes || 0) > 0 || (dependencies?.instances || 0) > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Type 삭제</DialogTitle>
          <DialogDescription>정말로 이 Type을 삭제하시겠습니까?</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-md border p-4"><p className="text-sm font-medium">{type.name}</p></div>
          {hasDeps && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>경고: 종속 데이터 존재</AlertTitle>
              <AlertDescription>
                <p className="mb-2">이 Type을 삭제하면 다음 데이터도 함께 삭제됩니다:</p>
                <ul className="list-disc list-inside space-y-1">
                  {(dependencies?.attributes || 0) > 0 && <li>Attribute: {dependencies?.attributes}개</li>}
                  {(dependencies?.instances || 0) > 0 && <li>Business Object: {dependencies?.instances}개</li>}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>취소</Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isPending}>{isPending ? '삭제 중...' : '삭제'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

