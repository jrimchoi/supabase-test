'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2 } from 'lucide-react'

type TypeData = {
  id: string
  name: string
  description: string | null
  prefix: string | null
}

type Props = Readonly<{
  types: TypeData[]
  onRemove: (typeId: string) => void
  isPending: boolean
}>

export function AssignedTypesList({ types, onRemove, isPending }: Props) {
  if (types.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        연결된 Type이 없습니다
      </div>
    )
  }

  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto">
      {types.map((type) => (
        <div
          key={type.id}
          className="flex items-start justify-between p-3 border rounded-lg"
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
            className="ml-2 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onRemove(type.id)}
            disabled={isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}

