'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

type User = {
  id: string
  email: string | null
  full_name: string | null
  name: string | null
  avatar_url: string | null
}

type Props = {
  users: User[]
  onRemove: (userId: string) => void
  isPending?: boolean
}

export function AssignedUsersList({ users, onRemove, isPending = false }: Props) {
  const getUserDisplayName = (user: User) => {
    return user.full_name || user.name || user.email || '이름 없음'
  }

  const getUserInitials = (user: User) => {
    const name = getUserDisplayName(user)
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        할당된 사용자가 없습니다
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {users.map((user) => (
        <div
          key={user.id}
          className="flex items-center justify-between p-3 border rounded-lg"
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{getUserDisplayName(user)}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onRemove(user.id)}
            disabled={isPending}
          >
            <X className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ))}
    </div>
  )
}

