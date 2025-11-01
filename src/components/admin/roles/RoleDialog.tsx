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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { createRole, updateRole } from '@/app/admin/roles/actions'

type Role = {
  id: string
  name: string
  description: string | null
  isActive: boolean
}

type Props = {
  role: Role | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function RoleDialog({ role, open, onOpenChange, onSuccess }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (role) {
      setName(role.name)
      setDescription(role.description || '')
      setIsActive(role.isActive)
    } else {
      setName('')
      setDescription('')
      setIsActive(true)
    }
  }, [role, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      try {
        const result = role
          ? await updateRole(role.id, { name, description: description || null, isActive })
          : await createRole({ name, description: description || null, isActive })

        if (!result.success) {
          throw new Error(result.error || '저장 실패')
        }

        onSuccess()
      } catch (error) {
        console.error('Role 저장 에러:', error)
        alert(error instanceof Error ? error.message : '저장 실패')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {role ? 'Role 수정' : '새 Role 생성'}
            </DialogTitle>
            <DialogDescription>
              사용자 역할 정보를 입력하세요
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">이름 *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: Admin"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="역할에 대한 설명을 입력하세요"
                rows={3}
              />
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
                활성화 (활성화된 Role만 사용 가능합니다)
              </Label>
            </div>
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
            <Button type="submit" disabled={isPending}>
              {isPending ? '저장 중...' : '저장'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

