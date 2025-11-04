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
import { createGroup, updateGroup } from '@/app/admin/groups/actions'

type Group = {
  id: string
  name: string
  description: string | null
  parentId: string | null
  isActive: boolean
}

type Props = {
  group: Group | null
  allGroups: Group[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function GroupDialog({ group, allGroups, open, onOpenChange, onSuccess }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [parentId, setParentId] = useState<string>('')
  const [isActive, setIsActive] = useState(true)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (group) {
      setName(group.name)
      setDescription(group.description || '')
      setParentId(group.parentId || '')
      setIsActive(group.isActive)
    } else {
      setName('')
      setDescription('')
      setParentId('')
      setIsActive(true)
    }
  }, [group, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      try {
        const result = group
          ? await updateGroup(group.id, {
              name,
              description: description || null,
              parentId: parentId || null,
              isActive,
            })
          : await createGroup({
              name,
              description: description || null,
              parentId: parentId || null,
              isActive,
            })

        if (!result.success) {
          throw new Error(result.error || '저장 실패')
        }

        onSuccess()
      } catch (error) {
        console.error('Group 저장 에러:', error)
        alert(error instanceof Error ? error.message : '저장 실패')
      }
    })
  }

  // 순환 참조 방지: 자기 자신과 자신의 하위 그룹은 부모로 선택 불가
  const availableParents = allGroups.filter((g) => g.id !== group?.id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {group ? 'Group 수정' : '새 Group 생성'}
          </DialogTitle>
          <DialogDescription>
            사용자 그룹 정보를 입력하세요
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-1">
            <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">이름 *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: Engineering Team"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="그룹에 대한 설명을 입력하세요"
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="parentId">부모 그룹 (선택)</Label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger>
                  <SelectValue placeholder="부모 그룹 선택 (없으면 최상위)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">없음 (최상위 그룹)</SelectItem>
                  {availableParents.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                계층 구조를 만들려면 부모 그룹을 선택하세요
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
                활성화 (활성화된 Group만 사용 가능합니다)
              </Label>
            </div>
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 border-t pt-4">
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

