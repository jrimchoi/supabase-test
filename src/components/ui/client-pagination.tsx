import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type ClientPaginationProps = {
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
  onPreviousPage: () => void
  onNextPage: () => void
  onPageSizeChange: (value: string) => void
  canGoPrevious: boolean
  canGoNext: boolean
}

export function ClientPagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPreviousPage,
  onNextPage,
  onPageSizeChange,
  canGoPrevious,
  canGoNext,
}: ClientPaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalCount)

  return (
    <div className="admin-table-spacing flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        총 {totalCount}개 중 {startItem}-{endItem}개 표시
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPreviousPage}
          disabled={!canGoPrevious}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <span className="text-sm">
          {currentPage} / {totalPages}
        </span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onNextPage}
          disabled={!canGoNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <Select value={String(pageSize)} onValueChange={onPageSizeChange}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="10">10개씩</SelectItem>
          <SelectItem value="20">20개씩</SelectItem>
          <SelectItem value="50">50개씩</SelectItem>
          <SelectItem value="100">100개씩</SelectItem>
          <SelectItem value="all">전체</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

