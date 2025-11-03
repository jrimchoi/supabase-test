'use client'

import { useState, useEffect, useTransition } from 'react'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { createState, updateState } from '@/app/admin/states/actions'

type State = {
  id: string
  name: string
  description: string | null
  policyId: string
  order: number
  isInitial: boolean
  isFinal: boolean
}

type Policy = {
  id: string
  name: string
}

type Props = {
  state: State | null
  availablePolicies: Policy[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function StateDialog({
  state,
  availablePolicies,
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [policyId, setPolicyId] = useState('')
  const [order, setOrder] = useState(0)
  const [isInitial, setIsInitial] = useState(false)
  const [isFinal, setIsFinal] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (state) {
      setName(state.name)
      setDescription(state.description || '')
      setPolicyId(state.policyId)
      setOrder(state.order)
      setIsInitial(state.isInitial)
      setIsFinal(state.isFinal)
    } else {
      setName('')
      setDescription('')
      setPolicyId(availablePolicies[0]?.id || '')
      setOrder(0)
      setIsInitial(false)
      setIsFinal(false)
    }
  }, [state, availablePolicies, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      try {
        const result = state
          ? await updateState(state.id, {
              name,
              description: description || null,
              order,
              isInitial,
              isFinal,
            })
          : await createState({
              name,
              description: description || null,
              policyId,
              order,
              isInitial,
              isFinal,
            })

        if (!result.success) {
          throw new Error(result.error || '저장 실패')
        }

        onSuccess()
      } catch (error) {
        console.error('State 저장 에러:', error)
        alert(error instanceof Error ? error.message : '저장 실패')
      }
    })
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="h-screen w-[500px] max-w-[90vw]">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <DrawerHeader className="flex-shrink-0 border-b">
            <DrawerTitle>{state ? 'State 수정' : '새 State 생성'}</DrawerTitle>
            <DrawerDescription>상태 정보를 입력하세요</DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-4">
            <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">이름 *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: Draft, Review, Complete"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="상태에 대한 설명"
                rows={2}
              />
            </div>

            {!state && (
              <div className="grid gap-2">
                <Label htmlFor="policyId">Policy *</Label>
                <Select value={policyId} onValueChange={setPolicyId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Policy 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePolicies.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="order">순서 *</Label>
              <Input
                id="order"
                type="number"
                min="0"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                required
              />
              <p className="text-sm text-muted-foreground">
                State Diagram에서 표시될 순서입니다
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isInitial"
                  checked={isInitial}
                  onCheckedChange={(checked) => setIsInitial(checked as boolean)}
                />
                <Label
                  htmlFor="isInitial"
                  className="text-sm font-normal cursor-pointer"
                >
                  초기 상태 (워크플로우 시작 상태)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isFinal"
                  checked={isFinal}
                  onCheckedChange={(checked) => setIsFinal(checked as boolean)}
                />
                <Label
                  htmlFor="isFinal"
                  className="text-sm font-normal cursor-pointer"
                >
                  최종 상태 (워크플로우 종료 상태)
                </Label>
              </div>
            </div>
            </div>
          </div>

          <DrawerFooter className="flex-shrink-0 border-t">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
                className="flex-1"
              >
                취소
              </Button>
              <Button type="submit" disabled={isPending} className="flex-1">
                {isPending ? '저장 중...' : '저장'}
              </Button>
            </div>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}

