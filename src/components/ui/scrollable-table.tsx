'use client'

import { useEffect, useRef, ReactNode } from 'react'

type ScrollableTableProps = {
  children: ReactNode
}

/**
 * ScrollableTable: 단일 테이블, Sticky 헤더
 * - 헤더와 데이터가 하나의 테이블이므로 컬럼 너비가 자동으로 일치
 * - 헤더는 sticky로 고정, 바디만 스크롤
 */
export function ScrollableTable({ children }: ScrollableTableProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // 셀에 title 속성 추가 (네이티브 툴팁)
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const table = container.querySelector('table')
    if (!table) return

    // 모든 셀에 title 추가
    const addTitleToCell = (cell: HTMLElement) => {
      const textContent = cell.textContent?.trim()
      if (textContent && !cell.title) {
        cell.title = textContent
      }
    }

    // 헤더 셀
    table.querySelectorAll('thead th').forEach((cell) => addTitleToCell(cell as HTMLElement))
    
    // 바디 셀
    table.querySelectorAll('tbody td').forEach((cell) => addTitleToCell(cell as HTMLElement))
  }, [children])

  // 컬럼 리사이즈 기능 추가
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const table = container.querySelector('table')
    if (!table) return

    const headerCells = table.querySelectorAll('thead th')
    
    headerCells.forEach((cell, index) => {
      const th = cell as HTMLElement
      
      // 기존 리사이저 제거
      const existingResizer = th.querySelector('.column-resizer')
      if (existingResizer) return

      // 리사이저 추가
      const resizer = document.createElement('div')
      resizer.className = 'column-resizer'
      th.style.position = 'relative'
      th.appendChild(resizer)

      const handleMouseDown = (e: MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        
        const startX = e.pageX
        const startWidth = th.offsetWidth

        const handleMouseMove = (moveEvent: MouseEvent) => {
          const diff = moveEvent.pageX - startX
          const newWidth = Math.max(50, startWidth + diff)
          
          // 헤더 셀 너비 변경
          th.style.width = `${newWidth}px`
          th.style.minWidth = `${newWidth}px`
          th.style.maxWidth = `${newWidth}px`
          
          // 바디 셀들도 동일한 너비로 변경
          const rows = table.querySelectorAll('tbody tr')
          rows.forEach((row) => {
            const cell = row.querySelectorAll('td')[index]
            if (cell) {
              ;(cell as HTMLElement).style.width = `${newWidth}px`
              ;(cell as HTMLElement).style.minWidth = `${newWidth}px`
              ;(cell as HTMLElement).style.maxWidth = `${newWidth}px`
            }
          })
        }

        const handleMouseUp = () => {
          document.removeEventListener('mousemove', handleMouseMove)
          document.removeEventListener('mouseup', handleMouseUp)
          document.body.style.cursor = 'default'
          resizer.classList.remove('resizing')
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = 'col-resize'
        resizer.classList.add('resizing')
      }

      resizer.addEventListener('mousedown', handleMouseDown)
    })
  }, [children])

  return (
    <div ref={containerRef} className="scrollable-table-container-single">
        {children}
    </div>
  )
}
