'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Plus } from 'lucide-react'

type Attribute = {
  id: string
  name: string
  label: string
  attrType: string
  isRequired: boolean
  defaultValue: string | null
  validation: string | null
}

type Props = {
  typeId: string
  onAdd: (attributeId: string) => void
  isPending: boolean
}

export function AttributeSearchPanel({ typeId, onAdd, isPending }: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Attribute[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchAttributes(searchQuery)
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const searchAttributes = async (query: string) => {
    setIsSearching(true)
    try {
      const response = await fetch(
        `/api/attributes/search?q=${encodeURIComponent(query)}&typeId=${typeId}`
      )
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      console.error('Attribute 검색 실패:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Name, Label로 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="space-y-2">
        {searchQuery.length < 2 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            2글자 이상 입력하세요
          </p>
        )}

        {searchQuery.length >= 2 && isSearching && (
          <p className="text-sm text-muted-foreground text-center py-4">검색 중...</p>
        )}

        {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            검색 결과가 없습니다
          </p>
        )}

        {searchResults.map((attr) => (
          <div
            key={attr.id}
            className="flex items-start justify-between p-3 border rounded-lg"
          >
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{attr.label}</p>
              </div>
              <p className="text-xs text-muted-foreground font-mono">{attr.name}</p>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {attr.attrType}
                </Badge>
                {attr.isRequired && (
                  <Badge variant="secondary" className="text-xs">
                    필수
                  </Badge>
                )}
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onAdd(attr.id)}
              disabled={isPending}
              className="ml-2"
            >
              <Plus className="h-4 w-4 text-green-600" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

