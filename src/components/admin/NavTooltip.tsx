'use client'

import { useState, useRef, useEffect, ReactNode } from 'react'

type NavTooltipProps = {
  title: string
  description?: string
  children: ReactNode
  show: boolean
}

export function NavTooltip({ title, description, children, show }: NavTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!show || !isVisible || !triggerRef.current) return

    const rect = triggerRef.current.getBoundingClientRect()
    setPosition({
      top: rect.top + rect.height / 2,
      left: rect.right + 8, // 8px 간격
    })
  }, [isVisible, show])

  if (!show) return <>{children}</>

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>

      {isVisible && show && (
        <div
          className="fixed px-3 py-2 bg-popover text-popover-foreground border rounded-md shadow-lg whitespace-nowrap pointer-events-none"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            transform: 'translateY(-50%)',
            zIndex: 9999,
          }}
        >
          <div className="text-sm font-medium">{title}</div>
          {description && (
            <div className="text-xs text-muted-foreground">{description}</div>
          )}
        </div>
      )}
    </>
  )
}

