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

type Relationship = {
  id: string
  name: string
  description: string | null
  cardinality: string
  isRequired: boolean
  isActive: boolean
  fromType: {
    id: string
    name: string
    description: string | null
  }
  toType: {
    id: string
    name: string
    description: string | null
  }
  _count: {
    relationshipAttributes: number
    objectRelationships: number
  }
}

type Props = {
  initialData: Relationship[]
}

const cardinalityLabels: Record<string, string> = {
  ONE_TO_ONE: '1:1',
  ONE_TO_MANY: '1:N',
  MANY_TO_ONE: 'N:1',
  MANY_TO_MANY: 'N:M',
}

const cardinalityColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  ONE_TO_ONE: 'default',
  ONE_TO_MANY: 'secondary',
  MANY_TO_ONE: 'outline',
  MANY_TO_MANY: 'destructive',
}

export function RelationshipList({ initialData }: Props) {
  const router = useRouter()
  const [relationships] = useState<Relationship[]>(initialData)

  const handleCreate = () => {
    router.push('/admin/relationships/new')
  }

  const handleEdit = (id: string) => {
    router.push(`/admin/relationships/${id}`)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" 관계를 삭제하시겠습니까?`)) return

    try {
      const response = await fetch(`/api/relationships/${id}`, {
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
            <h1 className="text-lg font-bold tracking-tight">Relationships</h1>
            <p className="text-sm text-muted-foreground">
              Type 간 관계 정의 (카디널리티, 속성)
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
              <TableHead className="w-48">관계 이름</TableHead>
              <TableHead className="w-32">From Type</TableHead>
              <TableHead className="w-16 text-center">→</TableHead>
              <TableHead className="w-32">To Type</TableHead>
              <TableHead className="w-24 text-center">카디널리티</TableHead>
              <TableHead className="w-20 text-center">필수</TableHead>
              <TableHead className="w-20 text-center">활성</TableHead>
              <TableHead className="w-24 text-center">속성</TableHead>
              <TableHead className="w-24 text-center">인스턴스</TableHead>
              <TableHead className="w-64">설명</TableHead>
              <TableHead className="w-32 text-center">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {relationships.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center text-muted-foreground">
                  관계가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              relationships.map((rel) => (
                <TableRow key={rel.id}>
                  <TableCell className="font-mono">{rel.name}</TableCell>
                  <TableCell>
                    <code className="text-xs">{rel.fromType.name}</code>
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">→</TableCell>
                  <TableCell>
                    <code className="text-xs">{rel.toType.name}</code>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={cardinalityColors[rel.cardinality]}>
                      {cardinalityLabels[rel.cardinality] || rel.cardinality}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {rel.isRequired ? (
                      <Badge variant="destructive" className="text-xs">
                        필수
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        선택
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {rel.isActive ? (
                      <Badge variant="default" className="text-xs">
                        활성
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        비활성
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{rel._count.relationshipAttributes}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{rel._count.objectRelationships}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {rel.description || '-'}
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
                        onClick={() => handleDelete(rel.id, rel.name)}
                        disabled={rel._count.objectRelationships > 0}
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

