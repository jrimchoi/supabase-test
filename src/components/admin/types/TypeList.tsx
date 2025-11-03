'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
import { Card, CardContent } from '@/components/ui/card'
import { ScrollableTable } from '@/components/ui/scrollable-table'
import { TypeDialog } from './TypeDialog'
import { PlusCircle, Edit, Trash2, GitBranch } from 'lucide-react'
import { deleteType } from '@/app/admin/types/actions'

type Type = {
  id: string
  name: string
  description: string | null
  prefix: string | null
  createdAt: Date
  updatedAt: Date
  policy: {
    name: string
    version: number
    revisionSequence: string
  }
  parent: {
    id: string
    name: string
    description: string | null
  } | null
  _count?: {
    children: number
    objects: number
    typeAttributes: number
  }
}

export function TypeList({
  initialTypes,
}: {
  initialTypes: Type[]
}) {
  const [selectedType, setSelectedType] = useState<Type | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleCreate = () => {
    setSelectedType(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (type: Type) => {
    setSelectedType(type)
    setIsDialogOpen(true)
  }

  const handleDelete = async (type: Type) => {
    if (!confirm(`"${type.name}" 타입을 삭제하시겠습니까?`)) {
      return
    }

    startTransition(async () => {
      const result = await deleteType(type.id)
      if (result.success) {
        alert('삭제되었습니다.')
        router.refresh()
      } else {
        alert(result.error || '삭제 실패')
      }
    })
  }

  return (
    <div className="flex flex-col h-full mt-2.5">
      {/* 헤더 카드: 타이틀 + 설명 + 버튼 */}
      <div className="admin-header-wrapper">
        <Card>
          <CardContent className="admin-header-card-content">
            <h1 className="text-lg font-bold tracking-tight">Type 관리</h1>
            <p className="text-sm text-muted-foreground">비즈니스 타입을 생성하고 관리합니다 (계층 구조, 리비전 자동 할당, Attribute 연결)</p>
            <div className="flex-1" />
            <Button onClick={handleCreate} disabled={isPending}>
              <PlusCircle className="mr-2 h-4 w-4" />
              새 Type 생성
            </Button>
          </CardContent>
        </Card>
      </div>

      <ScrollableTable>
          <Table>
            <TableHeader>
            <TableRow>
              <TableHead className="w-40">Name</TableHead>
              <TableHead className="w-20">Prefix</TableHead>
              <TableHead className="w-56">Policy</TableHead>
              <TableHead className="w-44">Revision Seq</TableHead>
              <TableHead className="w-32">부모</TableHead>
              <TableHead className="w-16 text-center">자식</TableHead>
              <TableHead className="w-16 text-center">객체</TableHead>
              <TableHead className="w-16 text-center">속성</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-24">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialTypes.map((type) => (
              <TableRow key={type.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                      {type.name}
                    </code>
                    {type.parent && (
                      <GitBranch className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {type.prefix ? (
                    <Badge variant="outline">{type.prefix}</Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">상속</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {type.policy.name}
                  </div>
                </TableCell>
                <TableCell>
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                    {type.policy.revisionSequence}
                  </code>
                </TableCell>
                <TableCell>
                  {type.parent ? (
                    <span className="text-xs">
                      {type.parent.name}
                      {type.parent.description && ` (${type.parent.description})`}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {type._count?.children || 0}
                </TableCell>
                <TableCell className="text-center">
                  {type._count?.objects || 0}
                </TableCell>
                <TableCell className="text-center">
                  {type._count?.typeAttributes || 0}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {type.description || '-'}
                  </TableCell>
                  <TableCell>
                  <div className="flex gap-1">
                    <Link href={`/admin/types/${type.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="상세보기 (Attribute 관리)"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(type)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                    </div>
                  </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollableTable>

      <TypeDialog
        type={selectedType}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  )
}
