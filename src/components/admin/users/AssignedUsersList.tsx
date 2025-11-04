'use client'

import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

type Props = {
  userIds: string[]
  onRemove: (userId: string) => void
  isPending?: boolean
}

export function AssignedUsersList({ userIds, onRemove, isPending = false }: Props) {
  if (userIds.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        할당된 사용자가 없습니다
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {userIds.map((userId) => (
        <div
          key={userId}
          className="flex items-center justify-between p-3 border rounded-lg"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <span className="text-xs font-medium">{userId.slice(0, 2).toUpperCase()}</span>
            </div>
            <div>
              <p className="text-sm font-medium font-mono">{userId}</p>
              <p className="text-xs text-muted-foreground">User ID</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onRemove(userId)}
            disabled={isPending}
          >
            <X className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ))}
    </div>
  )
}

