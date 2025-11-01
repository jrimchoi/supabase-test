'use client'

import { useState, useEffect, useTransition } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createType, updateType } from '@/app/admin/types/actions'

type Type = { id: string; name: string; policyId: string }
type Policy = { id: string; name: string; version: number }
type Props = { type: Type | null; availablePolicies: Policy[]; open: boolean; onOpenChange: (open: boolean) => void; onSuccess: () => void }

export function TypeDialog({ type, availablePolicies, open, onOpenChange, onSuccess }: Props) {
  const [name, setName] = useState('')
  const [policyId, setPolicyId] = useState('')
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (type) {
      setName(type.name)
      setPolicyId(type.policyId)
    } else {
      setName('')
      setPolicyId(availablePolicies[0]?.id || '')
    }
  }, [type, availablePolicies, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      try {
        const result = type ? await updateType(type.id, { name }) : await createType({ name, policyId })
        if (!result.success) throw new Error(result.error || '저장 실패')
        onSuccess()
      } catch (error) {
        alert(error instanceof Error ? error.message : '저장 실패')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{type ? 'Type 수정' : '새 Type 생성'}</DialogTitle>
            <DialogDescription>비즈니스 타입 정보를 입력하세요 (예: Invoice, Contract)</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">이름 * (unique)</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="예: Invoice" required />
            </div>
            {!type && (
              <div className="grid gap-2">
                <Label htmlFor="policyId">Policy *</Label>
                <Select value={policyId} onValueChange={setPolicyId}>
                  <SelectTrigger><SelectValue placeholder="Policy 선택" /></SelectTrigger>
                  <SelectContent>
                    {availablePolicies.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name} v{p.version}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>취소</Button>
            <Button type="submit" disabled={isPending}>{isPending ? '저장 중...' : '저장'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

