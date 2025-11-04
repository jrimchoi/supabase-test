'use client'

import { useState, useEffect, useTransition } from 'react'
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { createAttribute, updateAttribute } from '@/app/admin/attributes/actions'

const ATTR_TYPES = ['STRING', 'INTEGER', 'REAL', 'DATE', 'BOOLEAN', 'JSON', 'ENUM']

type Attribute = { 
  id: string
  name: string
  label: string
  description?: string | null
  attrType: string
  isRequired: boolean
}

export function AttributeDialog({ attribute, open, onOpenChange, onSuccess }: any) {
  const [name, setName] = useState('')
  const [label, setLabel] = useState('')
  const [description, setDescription] = useState('')
  const [attrType, setAttrType] = useState('STRING')
  const [isRequired, setIsRequired] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (attribute) {
      setName(attribute.name)
      setLabel(attribute.label)
      setDescription(attribute.description || '')
      setAttrType(attribute.attrType)
      setIsRequired(attribute.isRequired)
    } else {
      setName('')
      setLabel('')
      setDescription('')
      setAttrType('STRING')
      setIsRequired(false)
    }
  }, [attribute, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      try {
        const result = attribute
          ? await updateAttribute(attribute.id, { name, label, description, attrType: attrType as any, isRequired })
          : await createAttribute({ name, label, description, attrType: attrType as any, isRequired })
        if (!result.success) throw new Error(result.error || '저장 실패')
        onSuccess()
      } catch (error) {
        alert(error instanceof Error ? error.message : '저장 실패')
      }
    })
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="h-screen w-[500px] max-w-[90vw]">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <DrawerHeader className="flex-shrink-0 border-b">
            <DrawerTitle>{attribute ? 'Attribute 수정' : '새 공통 Attribute 생성'}</DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto px-4">
            <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Name * (예: invoiceNumber)</Label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="camelCase로 입력"
                className="font-mono"
                required 
                disabled={!!attribute} 
              />
              {attribute && (
                <p className="text-xs text-muted-foreground">
                  ⚠️ Name은 수정할 수 없습니다 (전역 고유값)
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label>Label * (예: 송장 번호)</Label>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label>설명</Label>
              <Textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Attribute에 대한 설명을 입력하세요"
                rows={2}
              />
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
          </div>
          <DrawerFooter className="flex-shrink-0 border-t">
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending} className="flex-1">취소</Button>
              <Button type="submit" disabled={isPending} className="flex-1">{isPending ? '저장 중...' : '저장'}</Button>
            </div>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}

