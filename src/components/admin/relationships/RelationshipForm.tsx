'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Save, Search } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

type Type = {
  id: string
  name: string | null
  description: string | null
}

type Relationship = {
  id: string
  name: string
  description: string | null
  fromTypeId: string
  toTypeId: string
  cardinality: string
  isRequired: boolean
  isActive: boolean
  fromType: Type
  toType: Type
  relationshipAttributes?: Array<{
    id: string
    attribute: {
      id: string
      name: string
      label: string
    }
  }>
  objectRelationships?: Array<{
    id: string
    fromObject: {
      id: string
      name: string | null
      description: string | null
    }
    toObject: {
      id: string
      name: string | null
      description: string | null
    }
  }>
}

type Props = {
  relationship?: Relationship
}

export function RelationshipForm({ relationship }: Props) {
  const router = useRouter()
  const isNew = !relationship

  const [name, setName] = useState(relationship?.name || '')
  const [description, setDescription] = useState(relationship?.description || '')
  const [fromTypeId, setFromTypeId] = useState(relationship?.fromTypeId || '')
  const [toTypeId, setToTypeId] = useState(relationship?.toTypeId || '')
  const [cardinality, setCardinality] = useState(relationship?.cardinality || 'MANY_TO_ONE')
  const [isRequired, setIsRequired] = useState(relationship?.isRequired || false)
  const [isActive, setIsActive] = useState(relationship?.isActive ?? true)
  const [saving, setSaving] = useState(false)

  // Type 검색
  const [fromTypeSearch, setFromTypeSearch] = useState('')
  const [toTypeSearch, setToTypeSearch] = useState('')
  const [fromTypeResults, setFromTypeResults] = useState<Type[]>([])
  const [toTypeResults, setToTypeResults] = useState<Type[]>([])
  const [showFromTypeResults, setShowFromTypeResults] = useState(false)
  const [showToTypeResults, setShowToTypeResults] = useState(false)

  // 초기 Type 설정
  useEffect(() => {
    if (relationship?.fromType) {
      setFromTypeSearch(relationship.fromType.name || '')
    }
    if (relationship?.toType) {
      setToTypeSearch(relationship.toType.name || '')
    }
  }, [relationship])

  // From Type 검색
  useEffect(() => {
    if (fromTypeSearch.length < 2) {
      setFromTypeResults([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/types?search=${encodeURIComponent(fromTypeSearch)}`)
        if (response.ok) {
          const data = await response.json()
          setFromTypeResults(data.data || [])
        }
      } catch (error) {
        console.error('From Type 검색 오류:', error)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [fromTypeSearch])

  // To Type 검색
  useEffect(() => {
    if (toTypeSearch.length < 2) {
      setToTypeResults([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/types?search=${encodeURIComponent(toTypeSearch)}`)
        if (response.ok) {
          const data = await response.json()
          setToTypeResults(data.data || [])
        }
      } catch (error) {
        console.error('To Type 검색 오류:', error)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [toTypeSearch])

  const handleSave = async () => {
    if (!name.trim()) {
      alert('관계 이름을 입력하세요.')
      return
    }

    if (!fromTypeId || !toTypeId) {
      alert('From Type과 To Type을 선택하세요.')
      return
    }

    setSaving(true)
    try {
      const payload = {
        name,
        description: description || null,
        fromTypeId,
        toTypeId,
        cardinality,
        isRequired,
        isActive,
      }

      const url = isNew ? '/api/relationships' : `/api/relationships/${relationship.id}`
      const method = isNew ? 'POST' : 'PATCH'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '저장 실패')
      }

      alert(isNew ? '생성되었습니다.' : '수정되었습니다.')
      router.push('/admin/relationships')
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : '저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">
          {isNew ? '새 관계 생성' : '관계 수정'}
        </h1>
      </div>

      <div className="grid gap-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">관계 이름 *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: invoice_to_customer"
              />
            </div>

            <div>
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="관계에 대한 설명"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Label htmlFor="fromType">From Type *</Label>
                <div className="relative">
                  <Input
                    id="fromType"
                    value={fromTypeSearch}
                    onChange={(e) => {
                      setFromTypeSearch(e.target.value)
                      setShowFromTypeResults(true)
                    }}
                    onFocus={() => setShowFromTypeResults(true)}
                    placeholder="Type 검색 (2자 이상)"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                {showFromTypeResults && fromTypeResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {fromTypeResults.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        className="w-full px-4 py-2 text-left hover:bg-accent"
                        onClick={() => {
                          setFromTypeId(type.id)
                          setFromTypeSearch(type.name || '')
                          setShowFromTypeResults(false)
                        }}
                      >
                        <div className="font-medium">{type.name || '(이름 없음)'}</div>
                        {type.description && (
                          <div className="text-xs text-muted-foreground">
                            {type.description}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <Label htmlFor="toType">To Type *</Label>
                <div className="relative">
                  <Input
                    id="toType"
                    value={toTypeSearch}
                    onChange={(e) => {
                      setToTypeSearch(e.target.value)
                      setShowToTypeResults(true)
                    }}
                    onFocus={() => setShowToTypeResults(true)}
                    placeholder="Type 검색 (2자 이상)"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                {showToTypeResults && toTypeResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {toTypeResults.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        className="w-full px-4 py-2 text-left hover:bg-accent"
                        onClick={() => {
                          setToTypeId(type.id)
                          setToTypeSearch(type.name || '')
                          setShowToTypeResults(false)
                        }}
                      >
                        <div className="font-medium">{type.name || '(이름 없음)'}</div>
                        {type.description && (
                          <div className="text-xs text-muted-foreground">
                            {type.description}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="cardinality">카디널리티 *</Label>
              <Select value={cardinality} onValueChange={setCardinality}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ONE_TO_ONE">ONE_TO_ONE (1:1)</SelectItem>
                  <SelectItem value="ONE_TO_MANY">ONE_TO_MANY (1:N)</SelectItem>
                  <SelectItem value="MANY_TO_ONE">MANY_TO_ONE (N:1)</SelectItem>
                  <SelectItem value="MANY_TO_MANY">MANY_TO_MANY (N:M)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isRequired"
                  checked={isRequired}
                  onCheckedChange={(checked) => setIsRequired(checked as boolean)}
                />
                <Label htmlFor="isRequired" className="cursor-pointer">
                  필수 관계
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={(checked) => setIsActive(checked as boolean)}
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  활성
                </Label>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? '저장 중...' : '저장'}
              </Button>
              <Button variant="outline" onClick={() => router.back()}>
                취소
              </Button>
            </div>
          </CardContent>
        </Card>

        {!isNew && (
          <>
            {relationship.relationshipAttributes && relationship.relationshipAttributes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>연결된 속성 ({relationship.relationshipAttributes.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {relationship.relationshipAttributes.map((ra) => (
                      <Badge key={ra.id} variant="secondary">
                        {ra.attribute.label} ({ra.attribute.name})
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {relationship.objectRelationships && relationship.objectRelationships.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    최근 인스턴스 ({relationship.objectRelationships.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {relationship.objectRelationships.map((or) => (
                      <div
                        key={or.id}
                        className="flex items-center gap-2 p-2 border rounded text-sm"
                      >
                        <code className="text-xs">
                          {or.fromObject.name || or.fromObject.id.slice(0, 8)}
                        </code>
                        <span className="text-muted-foreground">→</span>
                        <code className="text-xs">
                          {or.toObject.name || or.toObject.id.slice(0, 8)}
                        </code>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}

