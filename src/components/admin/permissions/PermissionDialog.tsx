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
import { createPermission, updatePermission } from '@/app/admin/permissions/actions'

type Permission = {
  id: string
  stateId: string
  resource: string
  action: string
  targetType: string
  roleId: string | null
  groupId: string | null
  userId: string | null
  expression: string | null
  isAllowed: boolean
}

type State = {
  id: string
  name: string
  policy: {
    name: string
  }
}

type Role = {
  id: string
  name: string
}

type Group = {
  id: string
  name: string
}

type Props = Readonly<{
  permission: Permission | null
  availableStates: State[]
  availableRoles: Role[]
  availableGroups: Group[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}>

const ACTIONS = ['create', 'view', 'modify', 'delete']
const TARGET_TYPES = ['user', 'role', 'group']

export function PermissionDialog({
  permission,
  availableStates,
  availableRoles,
  availableGroups,
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const [stateId, setStateId] = useState('')
  const [resource, setResource] = useState('')
  const [selectedActions, setSelectedActions] = useState<string[]>([])
  const [targetType, setTargetType] = useState('role')
  const [roleId, setRoleId] = useState('')
  const [groupId, setGroupId] = useState('')
  const [userId, setUserId] = useState('')
  const [expression, setExpression] = useState('')
  const [isAllowed, setIsAllowed] = useState(true)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (permission) {
      setStateId(permission.stateId)
      setResource(permission.resource)
      // action을 쉼표로 split하여 배열로 변환
      setSelectedActions(permission.action.split(',').map(a => a.trim()))
      setTargetType(permission.targetType)
      setRoleId(permission.roleId || '')
      setGroupId(permission.groupId || '')
      setUserId(permission.userId || '')
      setExpression(permission.expression || '')
      setIsAllowed(permission.isAllowed)
    } else {
      setStateId('')
      setResource('')
      setSelectedActions([])
      setTargetType('role')
      setRoleId('')
      setGroupId('')
      setUserId('')
      setExpression('')
      setIsAllowed(true)
    }
  }, [permission, open])

  const toggleAction = (actionName: string) => {
    setSelectedActions(prev => 
      prev.includes(actionName)
        ? prev.filter(a => a !== actionName)
        : [...prev, actionName]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedActions.length === 0) {
      alert('최소 1개 이상의 Action을 선택해야 합니다.')
      return
    }

    // 선택된 action들을 쉼표로 join
    const actionString = selectedActions.join(',')

    startTransition(async () => {
      try {
        const result = permission
          ? await updatePermission(permission.id, {
              resource,
              action: actionString,
              expression: expression || undefined,
              isAllowed,
            })
          : await createPermission({
              stateId,
              resource,
              action: actionString,
              targetType,
              roleId: targetType === 'role' ? roleId : undefined,
              groupId: targetType === 'group' ? groupId : undefined,
              userId: targetType === 'user' ? userId : undefined,
              expression: expression || undefined,
              isAllowed,
            })

        if (!result.success) {
          throw new Error(result.error || '저장 실패')
        }

        onSuccess()
      } catch (error) {
        console.error('Permission 저장 에러:', error)
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
              {permission ? 'Permission 수정' : '새 Permission 생성'}
            </DrawerTitle>
            <DrawerDescription>
              State별 권한을 정의하세요 (Resource + Action 기반)
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-4">
            <div className="grid gap-4 py-4">
              {!permission && (
                <div className="grid gap-2">
                  <Label htmlFor="stateId">State *</Label>
                  <Select value={stateId} onValueChange={setStateId}>
                    <SelectTrigger>
                      <SelectValue placeholder="State 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStates.map((state) => (
                        <SelectItem key={state.id} value={state.id}>
                          {state.policy.name} - {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="resource">Resource *</Label>
                <Input
                  id="resource"
                  value={resource}
                  onChange={(e) => setResource(e.target.value)}
                  placeholder="예: invoice, document, comment"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  권한을 적용할 리소스 타입
                </p>
              </div>

              <div className="grid gap-2">
                <Label>Actions * (멀티 선택 가능)</Label>
                <div className="space-y-2 border rounded-md p-3">
                  {ACTIONS.map((act) => (
                    <div key={act} className="flex items-center space-x-2">
                      <Checkbox
                        id={`action-${act}`}
                        checked={selectedActions.includes(act)}
                        onCheckedChange={() => toggleAction(act)}
                      />
                      <Label
                        htmlFor={`action-${act}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {act}
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  선택된 Action: {selectedActions.length > 0 ? selectedActions.join(', ') : '없음'}
                </p>
                <p className="text-xs text-muted-foreground">
                  ⚠️ 여러 개 선택 시 쉼표(,)로 구분하여 저장됩니다
                </p>
              </div>

              {!permission && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="targetType">Target Type *</Label>
                    <Select value={targetType} onValueChange={setTargetType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TARGET_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      user, role, group 중 선택
                    </p>
                  </div>

                  {targetType === 'role' && (
                    <div className="grid gap-2">
                      <Label htmlFor="roleId">Role *</Label>
                      <Select value={roleId} onValueChange={setRoleId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Role 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableRoles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {targetType === 'group' && (
                    <div className="grid gap-2">
                      <Label htmlFor="groupId">Group *</Label>
                      <Select value={groupId} onValueChange={setGroupId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Group 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableGroups.map((group) => (
                            <SelectItem key={group.id} value={group.id}>
                              {group.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {targetType === 'user' && (
                    <div className="grid gap-2">
                      <Label htmlFor="userId">User ID *</Label>
                      <Input
                        id="userId"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        placeholder="auth.users.id 입력"
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Supabase auth.users 테이블의 user ID
                      </p>
                    </div>
                  )}
                </>
              )}

              <div className="grid gap-2">
                <Label htmlFor="expression">Expression (조건)</Label>
                <Textarea
                  id="expression"
                  value={expression}
                  onChange={(e) => setExpression(e.target.value)}
                  placeholder='예: user.department === "Finance"'
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  권한 적용 조건 (JavaScript expression). 비워두면 항상 적용.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isAllowed"
                  checked={isAllowed}
                  onCheckedChange={(checked) => setIsAllowed(checked as boolean)}
                />
                <Label htmlFor="isAllowed" className="cursor-pointer">
                  허용 (체크 해제 시 거부)
                </Label>
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

