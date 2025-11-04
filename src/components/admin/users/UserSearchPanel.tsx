'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Plus, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type User = {
  id: string
  email: string | null
  full_name: string | null
  name: string | null
  avatar_url: string | null
}

type Props = {
  onAddUser: (userId: string) => void
  excludeUserIds?: string[]
  isPending?: boolean
}

export function UserSearchPanel({ onAddUser, excludeUserIds = [], isPending = false }: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchUsers()
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const searchUsers = async () => {
    setIsSearching(true)
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        // 이미 할당된 사용자 제외
        const filtered = (data.users || []).filter(
          (u: User) => !excludeUserIds.includes(u.id)
        )
        setSearchResults(filtered)
      }
    } catch (error) {
      console.error('검색 에러:', error)
    } finally {
      setIsSearching(false)
    }
  }

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

  return (
    <div className="space-y-4">
      {/* 검색 입력 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="이메일, 이름으로 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* 검색 결과 */}
      <div className="space-y-2">
        {searchQuery.trim().length < 2 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            2글자 이상 입력하세요
          </p>
        )}

        {searchQuery.trim().length >= 2 && searchResults.length === 0 && !isSearching && (
          <p className="text-sm text-muted-foreground text-center py-4">
            검색 결과가 없습니다
          </p>
        )}

        {searchResults.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50"
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
              onClick={() => onAddUser(user.id)}
              disabled={isPending}
            >
              <Plus className="h-4 w-4 mr-1" />
              추가
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

