'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Plus } from 'lucide-react'

type TypeData = {
  id: string
  name: string
  description: string | null
  prefix: string | null
}

type Props = Readonly<{
  onAddType: (typeId: string) => void
  excludeTypeIds: string[]
  isPending: boolean
}>

export function TypeSearchPanel({ onAddType, excludeTypeIds, isPending }: Props) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<TypeData[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    const searchTypes = async () => {
      if (searchTerm.trim().length < 2) {
        setSearchResults([])
        return
      }

      setIsSearching(true)
      try {
        const response = await fetch(`/api/types?search=${encodeURIComponent(searchTerm)}`)
        if (response.ok) {
          const data = await response.json()
          setSearchResults(data.types || [])
        }
      } catch (error) {
        console.error('Type 검색 실패:', error)
      } finally {
        setIsSearching(false)
      }
    }

    const debounce = setTimeout(searchTypes, 300)
    return () => clearTimeout(debounce)
  }, [searchTerm])

  const filteredResults = searchResults.filter((type) => !excludeTypeIds.includes(type.id))

  return (
    <div className="space-y-4">
      {/* 검색 입력 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Type 검색 (2자 이상)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
          disabled={isPending}
        />
      </div>

      {/* 검색 결과 */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {isSearching ? (
          <div className="text-center py-8 text-sm text-muted-foreground">검색 중...</div>
        ) : searchTerm.trim().length < 2 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            2자 이상 입력하세요
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            검색 결과가 없습니다
          </div>
        ) : (
          filteredResults.map((type) => (
            <div
              key={type.id}
              className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">
                    {type.name}
                  </p>
                  {type.prefix && (
                    <Badge variant="outline" className="text-xs">
                      {type.prefix}
                    </Badge>
                  )}
                </div>
                {type.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {type.description}
                  </p>
                )}
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="ml-2 shrink-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={() => onAddType(type.id)}
                disabled={isPending}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

