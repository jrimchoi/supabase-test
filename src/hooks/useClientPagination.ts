import { useState, useMemo } from 'react'

type UseClientPaginationOptions = {
  initialPageSize?: number
}

export function useClientPagination<T>(
  data: T[],
  options: UseClientPaginationOptions = {}
) {
  const { initialPageSize = 20 } = options
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)

  // 페이징 처리
  const { paginatedData, totalPages } = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    const paginated = data.slice(start, end)
    const total = Math.ceil(data.length / pageSize)
    return { paginatedData: paginated, totalPages: total }
  }, [data, currentPage, pageSize])

  // 페이지 크기 변경
  const handlePageSizeChange = (value: string) => {
    setPageSize(value === 'all' ? data.length : parseInt(value, 10))
    setCurrentPage(1)
  }

  // 페이지 변경
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, page)))
  }

  const goToPreviousPage = () => {
    setCurrentPage(p => Math.max(1, p - 1))
  }

  const goToNextPage = () => {
    setCurrentPage(p => Math.min(totalPages, p + 1))
  }

  return {
    paginatedData,
    currentPage,
    pageSize,
    totalPages,
    totalCount: data.length,
    goToPage,
    goToPreviousPage,
    goToNextPage,
    handlePageSizeChange,
    canGoPrevious: currentPage > 1,
    canGoNext: currentPage < totalPages,
  }
}

