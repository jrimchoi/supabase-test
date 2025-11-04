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

type Relationship = {
  id: string
  name: string
  cardinality: string
  fromType: {
    id: string
    name: string | null
  }
  toType: {
    id: string
    name: string | null
  }
}

type BusinessObject = {
  id: string
  name: string | null
  description: string | null
  type: {
    id: string
    name: string | null
  } | null
}

type ObjectRelationship = {
  id: string
  relationshipId: string
  fromObjectId: string
  toObjectId: string
  data: unknown
  relationship: {
    id: string
    name: string
    cardinality: string
    fromType: {
      id: string
      name: string | null
    }
    toType: {
      id: string
      name: string | null
    }
  }
  fromObject: BusinessObject
  toObject: BusinessObject
}

type Props = {
  objectRelationship?: ObjectRelationship
  relationships: Relationship[]
}

export function BusinessObjectRelationshipForm({ objectRelationship, relationships }: Props) {
  const router = useRouter()
  const isNew = !objectRelationship

  const [relationshipId, setRelationshipId] = useState(objectRelationship?.relationshipId || '')
  const [fromObjectId, setFromObjectId] = useState(objectRelationship?.fromObjectId || '')
  const [toObjectId, setToObjectId] = useState(objectRelationship?.toObjectId || '')
  const [dataJson, setDataJson] = useState(
    objectRelationship?.data ? JSON.stringify(objectRelationship.data, null, 2) : '{}'
  )
  const [saving, setSaving] = useState(false)

  // 선택된 관계 정의
  const selectedRelationship = relationships.find((r) => r.id === relationshipId)

  // BusinessObject 검색
  const [fromObjectSearch, setFromObjectSearch] = useState('')
  const [toObjectSearch, setToObjectSearch] = useState('')
  const [fromObjectResults, setFromObjectResults] = useState<BusinessObject[]>([])
  const [toObjectResults, setToObjectResults] = useState<BusinessObject[]>([])
  const [showFromObjectResults, setShowFromObjectResults] = useState(false)
  const [showToObjectResults, setShowToObjectResults] = useState(false)

  // 초기 Object 설정
  useEffect(() => {
    if (objectRelationship?.fromObject) {
      setFromObjectSearch(
        objectRelationship.fromObject.name || objectRelationship.fromObject.id.slice(0, 8)
      )
    }
    if (objectRelationship?.toObject) {
      setToObjectSearch(
        objectRelationship.toObject.name || objectRelationship.toObject.id.slice(0, 8)
      )
    }
  }, [objectRelationship])

  // From Object 검색 (Type 필터링)
  useEffect(() => {
    if (fromObjectSearch.length < 2 || !selectedRelationship) {
      setFromObjectResults([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/business-objects?search=${encodeURIComponent(fromObjectSearch)}&typeId=${selectedRelationship.fromType.id}`
        )
        if (response.ok) {
          const data = await response.json()
          setFromObjectResults(data.data || [])
        }
      } catch (error) {
        console.error('From Object 검색 오류:', error)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [fromObjectSearch, selectedRelationship])

  // To Object 검색 (Type 필터링)
  useEffect(() => {
    if (toObjectSearch.length < 2 || !selectedRelationship) {
      setToObjectResults([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/business-objects?search=${encodeURIComponent(toObjectSearch)}&typeId=${selectedRelationship.toType.id}`
        )
        if (response.ok) {
          const data = await response.json()
          setToObjectResults(data.data || [])
        }
      } catch (error) {
        console.error('To Object 검색 오류:', error)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [toObjectSearch, selectedRelationship])

  const handleSave = async () => {
    if (!relationshipId) {
      alert('관계 정의를 선택하세요.')
      return
    }

    if (!fromObjectId || !toObjectId) {
      alert('From Object와 To Object를 선택하세요.')
      return
    }

    // JSON 유효성 검증
    let parsedData = null
    try {
      parsedData = JSON.parse(dataJson)
    } catch (error) {
      alert('유효하지 않은 JSON 형식입니다.')
      return
    }

    setSaving(true)
    try {
      const payload = {
        relationshipId,
        fromObjectId,
        toObjectId,
        data: parsedData,
      }

      const url = isNew
        ? '/api/business-relations'
        : `/api/business-relations/${objectRelationship.id}`
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
      router.push('/admin/business-relations')
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
          {isNew ? '새 관계 인스턴스 생성' : '관계 인스턴스 수정'}
        </h1>
      </div>

      <div className="grid gap-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="relationship">관계 정의 *</Label>
              <Select value={relationshipId} onValueChange={setRelationshipId}>
                <SelectTrigger>
                  <SelectValue placeholder="관계 선택" />
                </SelectTrigger>
                <SelectContent>
                  {relationships.map((rel) => (
                    <SelectItem key={rel.id} value={rel.id}>
                      {rel.name} ({rel.fromType.name || '(이름 없음)'} → {rel.toType.name || '(이름 없음)'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedRelationship && (
                <div className="mt-2 flex gap-2">
                  <Badge variant="outline">{selectedRelationship.cardinality}</Badge>
                  <Badge variant="secondary">{selectedRelationship.fromType.name || '(이름 없음)'}</Badge>
                  <span className="text-muted-foreground">→</span>
                  <Badge variant="secondary">{selectedRelationship.toType.name || '(이름 없음)'}</Badge>
                </div>
              )}
            </div>

            {selectedRelationship && (
              <>
                <div className="relative">
                  <Label htmlFor="fromObject">From Object ({selectedRelationship.fromType.name || '(이름 없음)'}) *</Label>
                  <div className="relative">
                    <Input
                      id="fromObject"
                      value={fromObjectSearch}
                      onChange={(e) => {
                        setFromObjectSearch(e.target.value)
                        setShowFromObjectResults(true)
                      }}
                      onFocus={() => setShowFromObjectResults(true)}
                      placeholder="Object 검색 (2자 이상)"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  {showFromObjectResults && fromObjectResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {fromObjectResults.map((obj) => (
                        <button
                          key={obj.id}
                          type="button"
                          className="w-full px-4 py-2 text-left hover:bg-accent"
                          onClick={() => {
                            setFromObjectId(obj.id)
                            setFromObjectSearch(obj.name || obj.id.slice(0, 8))
                            setShowFromObjectResults(false)
                          }}
                        >
                          <div className="font-medium">
                            {obj.name || obj.id.slice(0, 8)}
                          </div>
                          {obj.description && (
                            <div className="text-xs text-muted-foreground">
                              {obj.description}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            Type: {obj.type?.name || 'Unknown'}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <Label htmlFor="toObject">To Object ({selectedRelationship.toType.name || '(이름 없음)'}) *</Label>
                  <div className="relative">
                    <Input
                      id="toObject"
                      value={toObjectSearch}
                      onChange={(e) => {
                        setToObjectSearch(e.target.value)
                        setShowToObjectResults(true)
                      }}
                      onFocus={() => setShowToObjectResults(true)}
                      placeholder="Object 검색 (2자 이상)"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  {showToObjectResults && toObjectResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {toObjectResults.map((obj) => (
                        <button
                          key={obj.id}
                          type="button"
                          className="w-full px-4 py-2 text-left hover:bg-accent"
                          onClick={() => {
                            setToObjectId(obj.id)
                            setToObjectSearch(obj.name || obj.id.slice(0, 8))
                            setShowToObjectResults(false)
                          }}
                        >
                          <div className="font-medium">
                            {obj.name || obj.id.slice(0, 8)}
                          </div>
                          {obj.description && (
                            <div className="text-xs text-muted-foreground">
                              {obj.description}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            Type: {obj.type?.name || 'Unknown'}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            <div>
              <Label htmlFor="data">데이터 (JSON)</Label>
              <Textarea
                id="data"
                value={dataJson}
                onChange={(e) => setDataJson(e.target.value)}
                placeholder='{"key": "value"}'
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                관계별 커스텀 속성을 JSON 형식으로 입력하세요.
              </p>
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

        {!isNew && objectRelationship && (
          <Card>
            <CardHeader>
              <CardTitle>관계 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">From Object</Label>
                  <div className="mt-1">
                    <code className="text-sm">
                      {objectRelationship.fromObject.name || objectRelationship.fromObject.id.slice(0, 8)}
                    </code>
                    <div className="text-xs text-muted-foreground mt-1">
                      Type: {objectRelationship.fromObject.type?.name || 'Unknown'}
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">To Object</Label>
                  <div className="mt-1">
                    <code className="text-sm">
                      {objectRelationship.toObject.name || objectRelationship.toObject.id.slice(0, 8)}
                    </code>
                    <div className="text-xs text-muted-foreground mt-1">
                      Type: {objectRelationship.toObject.type?.name || 'Unknown'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

