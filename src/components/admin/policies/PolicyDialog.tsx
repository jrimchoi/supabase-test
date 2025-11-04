'use client'

import { useState, useEffect, useTransition, useRef } from 'react'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import {
  createPolicy,
  updatePolicy,
  getPolicyTypes,
  searchTypes,
  addPolicyType,
  removePolicyType,
} from '@/app/admin/policies/actions'

type Policy = {
  id: string
  name: string
  description?: string | null
  revisionSequence: string
  isActive: boolean
}

type Props = Readonly<{
  policy: Policy | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}>

export function PolicyDialog({ policy, open, onOpenChange, onSuccess }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [revisionSequence, setRevisionSequence] = useState('A,B,C')
  const [isActive, setIsActive] = useState(true)
  const [isPending, startTransition] = useTransition()
  
  // Type 검색 및 관리
  const [searchResults, setSearchResults] = useState<{ id: string; type: string; name: string | null }[]>([])
  const [selectedTypes, setSelectedTypes] = useState<{ id: string; type: string; name: string | null }[]>([])
  const [typeSearch, setTypeSearch] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const typeSearchInputRef = useRef<HTMLInputElement>(null)

  // Type 데이터 로드
  useEffect(() => {
    if (open) {
      startTransition(async () => {
        // Policy 수정 시 연결된 Type 로드
        if (policy) {
          const policyTypesResult = await getPolicyTypes(policy.id)
          if (policyTypesResult.success) {
            const types = policyTypesResult.data.map((pt: any) => pt.type)
            setSelectedTypes(types)
          }
        } else {
          setSelectedTypes([])
        }
      })
    }
  }, [open, policy])

  // Type 검색 (2자 이상 입력 시)
  useEffect(() => {
    if (typeSearch.length < 2) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    const timer = setTimeout(async () => {
      const result = await searchTypes(typeSearch)
      if (result.success) {
        // 이미 선택된 Type 제외
        const selectedIds = new Set(selectedTypes.map(t => t.id))
        const filtered = result.data.filter(t => !selectedIds.has(t.id))
        setSearchResults(filtered as any[])
      }
      setIsSearching(false)
      // 검색 완료 후 포커스 유지
      if (typeSearchInputRef.current) {
        typeSearchInputRef.current.focus()
      }
    }, 300) // 300ms 디바운스

    return () => clearTimeout(timer)
  }, [typeSearch, selectedTypes])

  useEffect(() => {
    if (policy) {
      setName(policy.name)
      setDescription(policy.description || '')
      setRevisionSequence(policy.revisionSequence)
      setIsActive(policy.isActive)
    } else {
      setName('')
      setDescription('')
      setRevisionSequence('A,B,C')
      setIsActive(true)
      setSelectedTypes([])
    }
  }, [policy, open])

  const handleAddType = (type: { id: string; type: string; name: string | null }) => {
    if (!selectedTypes.some((t) => t.id === type.id)) {
      setSelectedTypes([...selectedTypes, type])
      setTypeSearch('')
      // Type 추가 후 포커스 유지
      setTimeout(() => {
        if (typeSearchInputRef.current) {
          typeSearchInputRef.current.focus()
        }
      }, 0)
      setSearchResults([])

      // Policy 수정 모드에서는 즉시 DB에 반영
      if (policy) {
        startTransition(async () => {
          const result = await addPolicyType(policy.id, type.id)
          if (!result.success) {
            alert(result.error || '추가 실패')
            setSelectedTypes(selectedTypes.filter((t) => t.id !== type.id))
          }
        })
      }
    }
  }

  const handleRemoveType = (typeId: string) => {
    setSelectedTypes(selectedTypes.filter((t) => t.id !== typeId))

    // Policy 수정 모드에서는 즉시 DB에서 제거
    if (policy) {
      startTransition(async () => {
        const result = await removePolicyType(policy.id, typeId)
        if (!result.success) {
          alert(result.error || '제거 실패')
        }
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      try {
        const result = policy
          ? await updatePolicy(policy.id, { name, description, revisionSequence, isActive })
          : await createPolicy({ name, description, revisionSequence, isActive })

        if (!result.success) {
          throw new Error(result.error || '저장 실패')
        }

        // 새로 생성한 경우, PolicyType 관계 생성
        if (!policy && result.data) {
          const policyId = result.data.id
          for (const type of selectedTypes) {
            await addPolicyType(policyId, type.id)
          }
        }

        onSuccess()
      } catch (error) {
        console.error('Policy 저장 에러:', error)
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
              {policy ? 'Policy 수정' : '새 Policy 생성'}
            </DrawerTitle>
            <DrawerDescription>
              권한 정책 정보를 입력하세요
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-1">
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">이름 *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 문서_결재_정책"
                required
              />
                <p className="text-xs text-muted-foreground">
                  각 Policy는 고유한 이름을 가져야 합니다
                </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Policy에 대한 설명을 입력하세요"
                rows={2}
              />
            </div>

              {/* Type 검색 및 선택 (version 자리로 이동) */}
            <div className="grid gap-2">
                <Label>사용 가능한 Type (선택)</Label>
                
                {/* 선택된 Type 목록 */}
                {selectedTypes.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2 bg-muted rounded-md">
                    {selectedTypes.map((type) => (
                      <Badge key={type.id} variant="secondary" className="gap-1">
                        {type.type} {type.name && `(${type.name})`}
                        <button
                          type="button"
                          onClick={() => handleRemoveType(type.id)}
                          className="ml-1 hover:bg-destructive/20 rounded-sm"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Type 검색 */}
                <div className="space-y-2">
              <Input
                    ref={typeSearchInputRef}
                    placeholder="Type 검색 (2글자 이상)..."
                    value={typeSearch}
                    onChange={(e) => setTypeSearch(e.target.value)}
                    disabled={isPending}
                    autoComplete="off"
                  />
                  
                  {/* 검색 중 표시 */}
                  {isSearching && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      검색 중...
                    </p>
                  )}
                  
                  {/* 검색 결과 - 최대 높이 제한으로 스크롤 생성 */}
                  {!isSearching && typeSearch.length >= 2 && searchResults.length > 0 && (
                    <div className="max-h-[160px] overflow-y-auto border rounded-md">
                      {searchResults.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => handleAddType(type)}
                          onMouseDown={(e) => e.preventDefault()} // 포커스 유지
                          className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors border-b last:border-0"
                        >
                          <div className="font-medium">{type.type}</div>
                          {type.name && <div className="text-xs text-muted-foreground">{type.name}</div>}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {!isSearching && typeSearch.length >= 2 && searchResults.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      검색 결과 없음
                    </p>
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground">
                  2글자 이상 입력하여 Type을 검색하고 추가하세요
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="revisionSequence">Revision Sequence *</Label>
              <Input
                id="revisionSequence"
                value={revisionSequence}
                onChange={(e) => setRevisionSequence(e.target.value)}
                placeholder="예: A,B,C 또는 Draft,Review,Final"
                required
              />
              <p className="text-sm text-muted-foreground">
                BusinessObject의 리비전 순서 (콤마로 구분)
              </p>
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
                활성화 (활성화된 Policy만 적용됩니다)
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

