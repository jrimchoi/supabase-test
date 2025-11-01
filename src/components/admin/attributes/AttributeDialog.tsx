'use client'

import { useState, useEffect, useTransition } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { createAttribute, updateAttribute } from '@/app/admin/attributes/actions'

const ATTR_TYPES = ['STRING', 'INTEGER', 'REAL', 'DATE', 'BOOLEAN', 'JSON', 'ENUM']

type Attribute = { 
  id: string
  key: string
  label: string
  attrType: string
  isRequired: boolean
}

export function AttributeDialog({ attribute, open, onOpenChange, onSuccess }: any) {
  const [key, setKey] = useState('')
  const [label, setLabel] = useState('')
  const [attrType, setAttrType] = useState('STRING')
  const [isRequired, setIsRequired] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (attribute) {
      setKey(attribute.key)
      setLabel(attribute.label)
      setAttrType(attribute.attrType)
      setIsRequired(attribute.isRequired)
    } else {
      setKey('')
      setLabel('')
      setAttrType('STRING')
      setIsRequired(false)
    }
  }, [attribute, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      try {
        const result = attribute
          ? await updateAttribute(attribute.id, { key, label, attrType, isRequired })
          : await createAttribute({ key, label, attrType, isRequired })
        if (!result.success) throw new Error(result.error || '저장 실패')
        onSuccess()
      } catch (error) {
        alert(error instanceof Error ? error.message : '저장 실패')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{attribute ? 'Attribute 수정' : '새 공통 Attribute 생성'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Key * (예: invoiceNumber)</Label>
              <Input 
                value={key} 
                onChange={(e) => setKey(e.target.value)} 
                placeholder="camelCase로 입력"
                className="font-mono"
                required 
                disabled={!!attribute} 
              />
              {attribute && (
                <p className="text-xs text-muted-foreground">
                  ⚠️ Key는 수정할 수 없습니다 (전역 고유값)
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label>Label * (예: 송장 번호)</Label>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label>속성 타입 *</Label>
              <Select value={attrType} onValueChange={setAttrType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ATTR_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="isRequired" checked={isRequired} onCheckedChange={(c) => setIsRequired(c as boolean)} />
              <Label htmlFor="isRequired" className="cursor-pointer">필수 항목</Label>
            </div>
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

