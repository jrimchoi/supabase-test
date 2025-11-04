'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Trash2, Save } from 'lucide-react'
import { useBusinessObjectContext } from './BusinessObjectDetail'

export function BusinessObjectHeaderActions() {
  const router = useRouter()
  const { handleSave, handleDelete, isPending } = useBusinessObjectContext()

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={() => router.push('/admin/business-objects')}
        disabled={isPending}
      >
        취소
      </Button>
      <Button onClick={handleSave} disabled={isPending}>
        <Save className="mr-2 h-4 w-4" />
        저장
      </Button>
      <Button
        variant="destructive"
        onClick={handleDelete}
        disabled={isPending}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        삭제
      </Button>
    </div>
  )
}

