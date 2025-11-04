'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PlusCircle, Pencil, Trash2 } from 'lucide-react'
import { ScrollableTable } from '@/components/ui/scrollable-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type ObjectRelationship = {
  id: string
  relationship: {
    id: string
    name: string
    cardinality: string
    fromType: {
      id: string
      name: string
    }
    toType: {
      id: string
      name: string
    }
  }
  fromObject: {
    id: string
    name: string | null
    description: string | null
    type: {
      name: string
    } | null
  }
  toObject: {
    id: string
    name: string | null
    description: string | null
    type: {
      name: string
    } | null
  }
  data: unknown
  createdAt: Date
}

type Props = {
  initialData: ObjectRelationship[]
}

const cardinalityLabels: Record<string, string> = {
  ONE_TO_ONE: '1:1',
  ONE_TO_MANY: '1:N',
  MANY_TO_ONE: 'N:1',
  MANY_TO_MANY: 'N:M',
}

export function BusinessObjectRelationshipList({ initialData }: Props) {
  const router = useRouter()
  const [relationships] = useState<ObjectRelationship[]>(initialData)

  const handleCreate = () => {
    router.push('/admin/business-object-relationships/new')
  }

  const handleEdit = (id: string) => {
    router.push(`/admin/business-object-relationships/${id}`)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('이 관계 인스턴스를 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/business-object-relationships/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '삭제 실패')
      }

      alert('삭제되었습니다.')
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : '삭제 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="flex flex-col h-full mt-2.5">
      <div className="admin-header-wrapper">
        <Card>
          <CardContent className="admin-header-card-content">
            <h1 className="text-lg font-bold tracking-tight">Business Object Relationships</h1>
            <p className="text-sm text-muted-foreground">
              실제 BusinessObject 인스턴스 간의 관계
            </p>
            <div className="flex-1" />
            <Button onClick={handleCreate}>
              <PlusCircle className="mr-2 h-4 w-4" />
              새 관계 생성
            </Button>
          </CardContent>
        </Card>
      </div>

      <ScrollableTable>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-48">관계 정의</TableHead>
              <TableHead className="w-24 text-center">카디널리티</TableHead>
              <TableHead className="w-48">From Object</TableHead>
              <TableHead className="w-32">From Type</TableHead>
              <TableHead className="w-16 text-center">→</TableHead>
              <TableHead className="w-48">To Object</TableHead>
              <TableHead className="w-32">To Type</TableHead>
              <TableHead className="w-64">데이터 (JSON)</TableHead>
              <TableHead className="w-40">생성일</TableHead>
              <TableHead className="w-32 text-center">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {relationships.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground">
                  관계 인스턴스가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              relationships.map((rel) => (
                <TableRow key={rel.id}>
                  <TableCell className="font-mono text-xs">
                    {rel.relationship.name}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="text-xs">
                      {cardinalityLabels[rel.relationship.cardinality]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <code className="text-xs">
                        {rel.fromObject.name || rel.fromObject.id.slice(0, 8)}
                      </code>
                      {rel.fromObject.description && (
                        <div className="text-xs text-muted-foreground">
                          {rel.fromObject.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {rel.fromObject.type?.name || '-'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">→</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <code className="text-xs">
                        {rel.toObject.name || rel.toObject.id.slice(0, 8)}
                      </code>
                      {rel.toObject.description && (
                        <div className="text-xs text-muted-foreground">
                          {rel.toObject.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {rel.toObject.type?.name || '-'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs">
                      {rel.data ? JSON.stringify(rel.data).slice(0, 50) + '...' : '-'}
                    </code>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(rel.createdAt).toLocaleString('ko-KR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(rel.id)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(rel.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollableTable>
    </div>
  )
}

