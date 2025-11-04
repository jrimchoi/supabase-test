'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PlusCircle, Pencil, Trash2, Search, XCircle } from 'lucide-react'
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
  const [relationshipNameFilter, setRelationshipNameFilter] = useState('')
  const [fromTypeFilter, setFromTypeFilter] = useState('')
  const [toTypeFilter, setToTypeFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const handleCreate = () => {
    router.push('/admin/business-relations/new')
  }

  const handleEdit = (id: string) => {
    router.push(`/admin/business-relations/${id}`)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('이 관계 인스턴스를 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/business-relations/${id}`, {
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

  // 필터링 로직
  const filteredRelationships = relationships.filter((rel) => {
    const matchRelationshipName = !relationshipNameFilter || 
      rel.relationship.name.toLowerCase().includes(relationshipNameFilter.toLowerCase())
    const matchFromType = !fromTypeFilter || 
      rel.relationship.fromType.name.toLowerCase().includes(fromTypeFilter.toLowerCase())
    const matchToType = !toTypeFilter || 
      rel.relationship.toType.name.toLowerCase().includes(toTypeFilter.toLowerCase())
    
    return matchRelationshipName && matchFromType && matchToType
  })

  // 페이징
  const totalFiltered = filteredRelationships.length
  const totalPages = Math.ceil(totalFiltered / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedRelationships = filteredRelationships.slice(startIndex, endIndex)

  // 필터 변경 시 페이지 1로 리셋
  const handleRelationshipNameFilterChange = (value: string) => {
    setRelationshipNameFilter(value)
    setCurrentPage(1)
  }

  const handleFromTypeFilterChange = (value: string) => {
    setFromTypeFilter(value)
    setCurrentPage(1)
  }

  const handleToTypeFilterChange = (value: string) => {
    setToTypeFilter(value)
    setCurrentPage(1)
  }

  const handleResetFilters = () => {
    setRelationshipNameFilter('')
    setFromTypeFilter('')
    setToTypeFilter('')
    setCurrentPage(1)
  }

  return (
    <div className="flex flex-col h-full mt-2.5">
      <div className="admin-header-wrapper">
        <Card>
          <CardContent className="admin-header-card-content flex-col items-start">
            {/* 타이틀 행 */}
            <div className="flex items-center w-full gap-2">
              <h1 className="text-lg font-bold tracking-tight">Business Object Relationships</h1>
              <p className="text-sm text-muted-foreground">
                실제 BusinessObject 인스턴스 간의 관계
              </p>
              <div className="flex-1" />
              <Button onClick={handleCreate}>
                <PlusCircle className="mr-2 h-4 w-4" />
                새 관계 생성
              </Button>
            </div>

            {/* 필터 행 */}
            <div className="flex gap-2 items-center w-full mt-2">
              <Input
                placeholder="Relationship Name..."
                value={relationshipNameFilter}
                onChange={(e) => handleRelationshipNameFilterChange(e.target.value)}
                className="w-48"
              />
              <Input
                placeholder="From Type..."
                value={fromTypeFilter}
                onChange={(e) => handleFromTypeFilterChange(e.target.value)}
                className="w-48"
              />
              <Input
                placeholder="To Type..."
                value={toTypeFilter}
                onChange={(e) => handleToTypeFilterChange(e.target.value)}
                className="w-48"
              />
              <Button
                variant="outline"
                size="icon"
                title="필터 적용"
                disabled={!relationshipNameFilter && !fromTypeFilter && !toTypeFilter}
              >
                <Search className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleResetFilters}
                title="필터 초기화"
                disabled={!relationshipNameFilter && !fromTypeFilter && !toTypeFilter}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
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
            {paginatedRelationships.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground">
                  {relationshipNameFilter || fromTypeFilter || toTypeFilter
                    ? '조건에 맞는 관계 인스턴스가 없습니다.'
                    : '관계 인스턴스가 없습니다.'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedRelationships.map((rel) => (
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

      {/* 클라이언트 사이드 페이징 */}
      <div className="admin-table-spacing flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          총 {totalFiltered}개 항목 ({relationshipNameFilter || fromTypeFilter || toTypeFilter ? '필터링됨' : '전체'})
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              setPageSize(value === 'all' ? 999999 : Number(value))
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10개씩</SelectItem>
              <SelectItem value="20">20개씩</SelectItem>
              <SelectItem value="50">50개씩</SelectItem>
              <SelectItem value="100">100개씩</SelectItem>
              <SelectItem value="all">전체</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              이전
            </Button>
            <div className="flex items-center px-3 text-sm">
              {currentPage} / {totalPages || 1}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
            >
              다음
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

