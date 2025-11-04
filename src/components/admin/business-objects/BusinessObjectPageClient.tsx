'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BusinessObjectDetail, BusinessObjectContext } from './BusinessObjectDetail'
import { BusinessObjectHeaderActions } from './BusinessObjectHeaderActions'
import { updateBusinessObject, deleteBusinessObject, getAvailableStates } from '@/app/admin/business-objects/actions'
import type { BusinessObjectDetail as BusinessObjectDetailType } from '@/types'

export function BusinessObjectPageClient({ objectData }: { objectData: BusinessObjectDetailType }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  // 편집 상태 - 기본 속성
  const [currentState, setCurrentState] = useState(objectData.currentState)
  const [description, setDescription] = useState(objectData.description || '')
  const [availableStates, setAvailableStates] = useState<any[]>([])
  
  // 편집 상태 - 사용자 정의 속성
  const initialData = objectData.data && typeof objectData.data === 'object' 
    ? (objectData.data as Record<string, any>)
    : {}
  const [customData, setCustomData] = useState<Record<string, any>>(initialData)
  
  // State 목록 로드
  useEffect(() => {
    startTransition(async () => {
      const result = await getAvailableStates(objectData.policyId)
      if (result.success) {
        setAvailableStates(result.data)
      }
    })
  }, [objectData.policyId])
  
  const handleSave = () => {
    startTransition(async () => {
      try {
        const cleanedData = Object.entries(customData).reduce((acc, [key, value]) => {
          if (value !== '' && value !== null && value !== undefined) {
            acc[key] = value
          }
          return acc
        }, {} as Record<string, any>)
        
        const result = await updateBusinessObject(objectData.id, {
          currentState,
          description: description || undefined,
          data: Object.keys(cleanedData).length > 0 ? cleanedData : null,
        })

        if (result.success) {
          alert('저장되었습니다')
          router.refresh()
        } else {
          alert(result.error || '저장 실패')
        }
      } catch (error) {
        alert(error instanceof Error ? error.message : '저장 실패')
      }
    })
  }

  const handleDelete = () => {
    if (!confirm('정말 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) return

    startTransition(async () => {
      const result = await deleteBusinessObject(objectData.id)
      if (result.success) {
        alert('삭제되었습니다')
        router.push('/admin/business-objects')
      } else {
        alert(result.error || '삭제 실패')
      }
    })
  }

  return (
    <BusinessObjectContext.Provider value={{ handleSave, handleDelete, isPending }}>
      <div className="admin-list-wrapper">
        {/* 헤더 카드: Type, Name, Revision + 작업 버튼 */}
        <div className="admin-header-wrapper">
          <Card>
            <CardContent className="admin-header-card-content flex-col items-start">
              {/* 첫 번째 행: Type, Name, Revision */}
              <div className="flex flex-col gap-1 w-full">
                {/* Type */}
                {objectData.type && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Type:</span>
                    <Badge variant="outline" className="text-sm">
                      {objectData.type.description || objectData.type.name}
                    </Badge>
                  </div>
                )}
                
                {/* Name */}
                <h1 className="text-base font-bold tracking-tight">
                  {objectData.name || objectData.id}
                </h1>
                
                {/* Revision */}
                {objectData.revision && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Revision:</span>
                    <Badge variant="secondary" className="text-sm">{objectData.revision}</Badge>
                  </div>
                )}
                
                {/* Policy (오른쪽 상단) */}
                <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                  <div className="text-xs text-muted-foreground">Policy</div>
                  <Badge variant="outline" className="text-xs">{objectData.policy.name}</Badge>
                </div>
              </div>
              
              {/* 두 번째 행: 작업 버튼 (오른쪽 정렬) */}
              <div className="flex justify-end w-full mt-2">
                <BusinessObjectHeaderActions />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* BusinessObjectDetail */}
        <BusinessObjectDetail 
          object={objectData}
          currentState={currentState}
          setCurrentState={setCurrentState}
          description={description}
          setDescription={setDescription}
          customData={customData}
          setCustomData={setCustomData}
          availableStates={availableStates}
        />
      </div>
    </BusinessObjectContext.Provider>
  )
}

