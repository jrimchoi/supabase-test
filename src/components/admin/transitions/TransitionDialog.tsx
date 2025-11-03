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
import { createTransition, updateTransition } from '@/app/admin/transitions/actions'

type Transition = {
  id: string
  fromStateId: string
  toStateId: string
  condition: string | null
  order: number | null
}

type State = {
  id: string
  name: string
  policyId: string
  policy: {
    name: string
  }
}

type Props = Readonly<{
  transition: Transition | null
  availableStates: State[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}>

export function TransitionDialog({
  transition,
  availableStates,
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const [fromStateId, setFromStateId] = useState('')
  const [toStateId, setToStateId] = useState('')
  const [condition, setCondition] = useState('')
  const [order, setOrder] = useState('')
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (transition) {
      setFromStateId(transition.fromStateId)
      setToStateId(transition.toStateId)
      setCondition(transition.condition || '')
      setOrder(transition.order?.toString() || '')
    } else {
      setFromStateId('')
      setToStateId('')
      setCondition('')
      setOrder('')
    }
  }, [transition, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      try {
        const result = transition
          ? await updateTransition(transition.id, {
              condition: condition || undefined,
              order: order ? Number(order) : undefined,
            })
          : await createTransition({
              fromStateId,
              toStateId,
              condition: condition || undefined,
              order: order ? Number(order) : undefined,
            })

        if (!result.success) {
          throw new Error(result.error || '저장 실패')
        }

        onSuccess()
      } catch (error) {
        console.error('Transition 저장 에러:', error)
        alert(error instanceof Error ? error.message : '저장 실패')
      }
    })
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="h-screen w-[600px] max-w-[90vw]">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <DrawerHeader className="flex-shrink-0 border-b">
            <DrawerTitle>
              {transition ? 'Transition 수정' : '새 Transition 생성'}
            </DrawerTitle>
            <DrawerDescription>
              State 간 전이 관계를 정의하세요
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-4">
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="fromStateId">From State *</Label>
                <Select
                  value={fromStateId}
                  onValueChange={setFromStateId}
                  disabled={!!transition}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="시작 State 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStates.map((state) => (
                      <SelectItem key={state.id} value={state.id}>
                        {state.policy.name} - {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {transition && (
                  <p className="text-xs text-muted-foreground">
                    ⚠️ From State는 수정할 수 없습니다
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="toStateId">To State *</Label>
                <Select
                  value={toStateId}
                  onValueChange={setToStateId}
                  disabled={!!transition}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="도착 State 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStates
                      .filter((s) => s.id !== fromStateId)
                      .map((state) => (
                        <SelectItem key={state.id} value={state.id}>
                          {state.policy.name} - {state.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {transition && (
                  <p className="text-xs text-muted-foreground">
                    ⚠️ To State는 수정할 수 없습니다
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="condition">Condition (Expression)</Label>
                <Textarea
                  id="condition"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  placeholder='예: user.role === "Manager"'
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  전이 조건 (JavaScript expression). 비워두면 항상 허용.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="order">순서</Label>
                <Input
                  id="order"
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  placeholder="전이 순서 (같은 From State 내에서)"
                />
                <p className="text-xs text-muted-foreground">
                  동일한 From State에서 여러 To State가 있을 때 순서 지정
                </p>
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

