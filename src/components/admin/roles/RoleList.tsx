'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollableTable } from '@/components/ui/scrollable-table'
import { RoleDialog } from './RoleDialog'
import { DeleteRoleDialog } from './DeleteRoleDialog'
import { PlusCircle, Edit, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { updateRole } from '@/app/admin/roles/actions'

type Role = {
  id: string
  name: string
  description: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  _count?: {
    permissions: number
    userRoles: number
  }
}

export function RoleList({ initialRoles }: { initialRoles: Role[] }) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleCreate = () => {
    setSelectedRole(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (role: Role) => {
    setSelectedRole(role)
    setIsDialogOpen(true)
  }

  const handleDelete = (role: Role) => {
    setRoleToDelete(role)
    setIsDeleteDialogOpen(true)
  }

  const handleToggleActive = async (role: Role) => {
    startTransition(async () => {
      try {
        const result = await updateRole(role.id, {
          isActive: !role.isActive,
        })

        if (!result.success) {
          throw new Error(result.error || '활성화 상태 변경 실패')
        }

        router.refresh()
      } catch (error) {
        console.error('활성화 토글 에러:', error)
        alert(error instanceof Error ? error.message : '활성화 상태 변경 실패')
      }
    })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 mb-2">
        <Button onClick={handleCreate}>
          <PlusCircle className="mr-2 h-4 w-4" />
          새 Role 생성
        </Button>
      </div>

      <div className="scrollable-table-container">
        <div className="table-header-wrapper">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>설명</TableHead>
                <TableHead className="w-24">상태</TableHead>
                <TableHead className="w-32">권한 수</TableHead>
                <TableHead className="w-32">사용자 수</TableHead>
                <TableHead className="w-40">생성일</TableHead>
                <TableHead className="w-40">수정일</TableHead>
                <TableHead className="w-40">작업</TableHead>
              </TableRow>
            </TableHeader>
          </Table>
        </div>
        <div className="scrollable-table-wrapper">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>설명</TableHead>
                <TableHead className="w-24">상태</TableHead>
                <TableHead className="w-32">권한 수</TableHead>
                <TableHead className="w-32">사용자 수</TableHead>
                <TableHead className="w-40">생성일</TableHead>
                <TableHead className="w-40">수정일</TableHead>
                <TableHead className="w-40">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {initialRoles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  등록된 Role이 없습니다
                </TableCell>
              </TableRow>
            ) : (
              initialRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">
                    <a
                      href={`/admin/roles/${role.id}`}
                      className="hover:underline text-primary"
                    >
                      {role.name}
                    </a>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {role.description || '-'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant={role.isActive ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleToggleActive(role)}
                    >
                      {role.isActive ? '활성' : '비활성'}
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    {role._count?.permissions || 0}
                  </TableCell>
                  <TableCell className="text-center">
                    {role._count?.userRoles || 0}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(role.createdAt), 'PPP', { locale: ko })}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(role.updatedAt), 'PPP', { locale: ko })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(role)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(role)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      <RoleDialog
        role={selectedRole}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={() => {
          setIsDialogOpen(false)
          startTransition(() => {
            router.refresh()
          })
        }}
      />

      <DeleteRoleDialog
        role={roleToDelete}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onSuccess={() => {
          setIsDeleteDialogOpen(false)
          startTransition(() => {
            router.refresh()
          })
        }}
      />
    </div>
  )
}

