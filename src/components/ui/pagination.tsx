'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type PaginationProps = {
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
  baseUrl: string
}

const PAGE_SIZE_OPTIONS = [
  { value: '10', label: '10개' },
  { value: '20', label: '20개' },
  { value: '50', label: '50개' },
  { value: '100', label: '100개' },
  { value: 'all', label: '전체' },
]

export function Pagination({ currentPage, totalPages, totalCount, pageSize, baseUrl }: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const pages: (number | 'ellipsis')[] = []
  
  // 페이지 번호 생성 (최대 7개 표시)
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    if (currentPage <= 3) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('ellipsis')
      pages.push(totalPages)
    } else if (currentPage >= totalPages - 2) {
      pages.push(1)
      pages.push('ellipsis')
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('ellipsis')
      for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
      pages.push('ellipsis')
      pages.push(totalPages)
    }
  }

  const createUrl = (page: number, newPageSize?: string) => {
    const url = new URL(baseUrl, 'http://localhost')
    url.searchParams.set('page', page.toString())
    const size = newPageSize || searchParams.get('pageSize') || '20'
    if (size !== '20') {
      url.searchParams.set('pageSize', size)
    }
    return url.pathname + url.search
  }

  const handlePageSizeChange = (value: string) => {
    const url = createUrl(1, value) // 페이지 크기 변경 시 1페이지로 이동
    router.push(url)
  }

  // 전체 항목 표시 시 페이징 숨김
  if (pageSize >= totalCount && totalCount > 0) {
    return (
      <div className="flex items-center justify-between px-2 py-1">
        <div className="text-sm text-muted-foreground">
          총 {totalCount}개 항목 (전체 표시)
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">페이지당 표시:</span>
          <Select value="all" onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-[100px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between px-2 py-1">
      <div className="text-sm text-muted-foreground">
        총 {totalCount}개 항목
      </div>
      
      <div className="flex items-center gap-2">
        {/* 페이지 크기 선택 */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">페이지당:</span>
          <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-[90px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 페이지 네비게이션 */}
        <div className="flex items-center gap-1">
          {/* 이전 페이지 */}
          {currentPage > 1 ? (
            <Link href={createUrl(currentPage - 1)}>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}

          {/* 페이지 번호 */}
          {pages.map((page, idx) =>
            page === 'ellipsis' ? (
              <Button key={`ellipsis-${idx}`} variant="ghost" size="sm" className="h-8 w-8 p-0" disabled>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            ) : (
              <Link key={page} href={createUrl(page)}>
                <Button
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  {page}
                </Button>
              </Link>
            )
          )}

          {/* 다음 페이지 */}
          {currentPage < totalPages ? (
            <Link href={createUrl(currentPage + 1)}>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled>
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

