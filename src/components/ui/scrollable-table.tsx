'use client'

import { useEffect, useRef, ReactNode } from 'react'

type ScrollableTableProps = {
  header: ReactNode
  children: ReactNode
}

export function ScrollableTable({ header, children }: ScrollableTableProps) {
  const headerRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const headerEl = headerRef.current
    const bodyEl = bodyRef.current
    
    if (!headerEl || !bodyEl) return

    // 바디 스크롤 시 헤더 가로 스크롤 동기화
    const handleBodyScroll = () => {
      headerEl.scrollLeft = bodyEl.scrollLeft
    }

    bodyEl.addEventListener('scroll', handleBodyScroll)
    return () => bodyEl.removeEventListener('scroll', handleBodyScroll)
  }, [])

  return (
    <div className="scrollable-table-container">
      {/* 헤더 테이블 (고정) */}
      <div ref={headerRef} className="table-header-wrapper">
        {header}
      </div>

      {/* 바디 테이블 (스크롤) */}
      <div ref={bodyRef} className="scrollable-table-wrapper">
        {children}
      </div>
    </div>
  )
}
