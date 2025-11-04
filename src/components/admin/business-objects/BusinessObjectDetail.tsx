'use client'

import { createContext, useContext } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Attribute = {
  id: string
  name: string
  label: string
  description: string | null
  attrType: string
  isRequired: boolean
  defaultValue: string | null
  validation: string | null
}

type TypeAttribute = {
  id: string
  attribute: Attribute
}

// Context for sharing handlers
export const BusinessObjectContext = createContext<{
  handleSave: () => void
  handleDelete: () => void
  isPending: boolean
} | null>(null)

export function useBusinessObjectContext() {
  const context = useContext(BusinessObjectContext)
  if (!context) {
    throw new Error('useBusinessObjectContext must be used within BusinessObjectPageClient')
  }
  return context
}

type BusinessObjectData = {
  id: string
  typeId: string | null
  name: string | null
  revision: string | null
  policyId: string
  currentState: string
  description: string | null
  data: unknown
  createdAt: Date
  updatedAt: Date
  type: {
    id: string
    name: string | null
    description: string | null
    prefix: string | null
    policy: {
      id: string
      name: string
    }
    typeAttributes: TypeAttribute[]
  } | null
  policy: {
    id: string
    name: string
    revisionSequence: string
  }
}

export function BusinessObjectDetail({ 
  object,
  currentState,
  setCurrentState,
  description,
  setDescription,
  customData,
  setCustomData,
  availableStates
}: { 
  object: BusinessObjectData
  currentState: string
  setCurrentState: (value: string) => void
  description: string
  setDescription: (value: string) => void
  customData: Record<string, any>
  setCustomData: (value: Record<string, any>) => void
  availableStates: any[]
}) {
  // 디버깅: type과 typeAttributes 확인
  console.log('BusinessObjectDetail - object.type:', object.type)
  console.log('BusinessObjectDetail - typeAttributes:', object.type?.typeAttributes)
  console.log('BusinessObjectDetail - customData:', customData)
  
  // 사용자 정의 속성 값 업데이트
  const handleCustomDataChange = (key: string, value: any) => {
    setCustomData({ ...customData, [key]: value })
  }

  // 속성 값 렌더링 헬퍼
  const renderAttributeInput = (attr: Attribute) => {
    const value = customData[attr.name] ?? ''

    switch (attr.attrType) {
      case 'STRING':
      case 'ENUM':
        return (
          <Input
            value={value}
            onChange={(e) => handleCustomDataChange(attr.name, e.target.value)}
            placeholder={attr.defaultValue || `${attr.label} 입력`}
            required={attr.isRequired}
          />
        )
      case 'INTEGER':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleCustomDataChange(attr.name, e.target.value ? parseInt(e.target.value, 10) : '')}
            placeholder={attr.defaultValue || '0'}
            required={attr.isRequired}
          />
        )
      case 'REAL':
        return (
          <Input
            type="number"
            step="0.01"
            value={value}
            onChange={(e) => handleCustomDataChange(attr.name, e.target.value ? parseFloat(e.target.value) : '')}
            placeholder={attr.defaultValue || '0.00'}
            required={attr.isRequired}
          />
        )
      case 'DATE':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleCustomDataChange(attr.name, e.target.value)}
            required={attr.isRequired}
          />
        )
      case 'BOOLEAN':
        return (
          <Select 
            value={String(value)} 
            onValueChange={(v) => handleCustomDataChange(attr.name, v === 'true')}
          >
            <SelectTrigger>
              <SelectValue placeholder="선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">예</SelectItem>
              <SelectItem value="false">아니오</SelectItem>
            </SelectContent>
          </Select>
        )
      case 'JSON':
        return (
          <Textarea
            value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value)
                handleCustomDataChange(attr.name, parsed)
              } catch {
                handleCustomDataChange(attr.name, e.target.value)
              }
            }}
            placeholder='{"key": "value"}'
            rows={4}
            className="font-mono text-xs"
          />
        )
      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleCustomDataChange(attr.name, e.target.value)}
            placeholder={attr.label}
          />
        )
    }
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto space-y-6 pb-5 pr-1">
      {/* 기본 정보 편집 (전체 폭) */}
      <Card>
        <CardHeader>
          <CardTitle>기본 정보 편집</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 타입 정보 (최상위) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b">
            {object.type && (
              <div>
                <Label className="text-xs text-muted-foreground">Type</Label>
                <div className="mt-1">
                  <div className="font-medium text-sm">{object.type.name || '(이름 없음)'}</div>
                  {object.type.description && (
                    <div className="text-xs text-muted-foreground">{object.type.description}</div>
                  )}
                </div>
              </div>
            )}
            {object.type && (
              <div>
                <Label className="text-xs text-muted-foreground">Type (EAV)</Label>
                <div className="mt-1 text-sm">{object.type.name || '(이름 없음)'}</div>
              </div>
            )}
            <div>
              <Label className="text-xs text-muted-foreground">Policy</Label>
              <div className="mt-1">
                <div className="text-sm">{object.policy.name}</div>
              </div>
            </div>
          </div>

          {/* 기본 속성 (2열 그리드) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 왼쪽 열 */}
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label className="text-xs text-muted-foreground">ID</Label>
                <div className="text-xs font-mono bg-muted px-3 py-2 rounded">
                  {object.id}
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-xs text-muted-foreground">Name</Label>
                <div className="text-sm font-mono bg-muted px-3 py-2 rounded">
                  {object.name || '-'}
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-xs text-muted-foreground">Revision</Label>
                <div className="bg-muted px-3 py-2 rounded">
                  {object.revision ? (
                    <Badge variant="secondary">{object.revision}</Badge>
                  ) : (
                    <span className="text-sm">-</span>
                  )}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="currentState">Current State *</Label>
                <Select value={currentState} onValueChange={setCurrentState}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStates.map((state) => (
                      <SelectItem key={state.id} value={state.name}>
                        {state.name}
                        {state.description && ` - ${state.description}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 오른쪽 열 */}
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label className="text-xs text-muted-foreground">Owner</Label>
                <div className="text-xs font-mono bg-muted px-3 py-2 rounded">
                  {object.owner || '-'}
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-xs text-muted-foreground">Created By</Label>
                <div className="text-xs font-mono bg-muted px-3 py-2 rounded">
                  {object.createdBy || '-'}
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-xs text-muted-foreground">Updated By</Label>
                <div className="text-xs font-mono bg-muted px-3 py-2 rounded">
                  {object.updatedBy || '-'}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="BusinessObject 설명"
                  rows={4}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 사용자 정의 속성 편집 */}
      <Card>
        <CardHeader>
          <CardTitle>사용자 정의 속성 (Type/Attribute 기반)</CardTitle>
        </CardHeader>
        <CardContent>
          {!object.type ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Type이 할당되지 않았습니다</p>
              <p className="text-xs mt-1">Type을 할당하면 사용자 정의 속성을 관리할 수 있습니다</p>
            </div>
          ) : !object.type.typeAttributes || object.type.typeAttributes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Type에 Attribute가 할당되지 않았습니다</p>
              <p className="text-xs mt-1">Type 페이지에서 Attribute를 할당해주세요</p>
            </div>
          ) : (
            <>
              {/* data가 null이어도 속성 입력 가능 */}
              {!object.data && (
                <div className="mb-4 p-3 bg-muted/50 rounded-md">
                  <p className="text-sm text-muted-foreground">
                    현재 저장된 데이터가 없습니다. 아래 필드에 값을 입력하고 저장하세요.
                  </p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {object.type.typeAttributes.map((ta) => (
                  <div key={ta.id} className="grid gap-2">
                    <Label htmlFor={ta.attribute.name}>
                      {ta.attribute.label}
                      {ta.attribute.isRequired && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    {ta.attribute.description && (
                      <p className="text-xs text-muted-foreground -mt-1 mb-1">
                        {ta.attribute.description}
                      </p>
                    )}
                    {renderAttributeInput(ta.attribute)}
                    <div className="flex gap-1">
                      <Badge variant="outline" className="text-xs">
                        {ta.attribute.attrType}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-mono">
                        {ta.attribute.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
