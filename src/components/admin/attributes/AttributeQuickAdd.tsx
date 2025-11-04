'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createAttribute } from '@/app/admin/attributes/actions'
import { Plus } from 'lucide-react'

const ATTR_TYPES = ['STRING', 'INTEGER', 'REAL', 'DATE', 'BOOLEAN', 'JSON', 'ENUM']

type Props = {
  typeId: string
  onSuccess: () => void
}

export function AttributeQuickAdd({ typeId, onSuccess }: Props) {
  const [name, setName] = useState('')
  const [label, setLabel] = useState('')
  const [attrType, setAttrType] = useState('STRING')
  const [isRequired, setIsRequired] = useState(false)
  const [defaultValue, setDefaultValue] = useState('')
  const [validation, setValidation] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      try {
        const result = await createAttribute({
          name,
          label,
          attrType: attrType as any,
          isRequired,
          defaultValue: defaultValue || null,
          validation: validation || null,
        })

        if (!result.success) {
          throw new Error(result.error || '추가 실패')
        }

        // 폼 초기화
        setName('')
        setLabel('')
        setAttrType('STRING')
        setIsRequired(false)
        setDefaultValue('')
        setValidation('')

        onSuccess()
      } catch (error) {
        alert(error instanceof Error ? error.message : '추가 실패')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-3">
        <div className="grid gap-2">
          <Label htmlFor="name" className="text-sm">
            Name * (예: invoiceNumber)
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="invoiceNumber"
            className="font-mono text-sm"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="label" className="text-sm">
            Label * (예: 송장 번호)
          </Label>
          <Input
            id="label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="송장 번호"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="attrType" className="text-sm">
            속성 타입 *
          </Label>
          <Select value={attrType} onValueChange={setAttrType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ATTR_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="defaultValue" className="text-sm">
            기본값 (선택)
          </Label>
          <Input
            id="defaultValue"
            value={defaultValue}
            onChange={(e) => setDefaultValue(e.target.value)}
            placeholder="JSON 형식"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="validation" className="text-sm">
            검증 규칙 (선택)
          </Label>
          <Textarea
            id="validation"
            value={validation}
            onChange={(e) => setValidation(e.target.value)}
            placeholder="예: regex, min, max 등"
            rows={2}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="isRequired"
            checked={isRequired}
            onCheckedChange={(checked) => setIsRequired(checked as boolean)}
          />
          <Label htmlFor="isRequired" className="text-sm cursor-pointer">
            필수 항목
          </Label>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        <Plus className="h-4 w-4 mr-2" />
        {isPending ? '추가 중...' : 'Attribute 추가'}
      </Button>
    </form>
  )
}

