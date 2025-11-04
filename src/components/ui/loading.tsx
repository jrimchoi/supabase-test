import { Loader2 } from 'lucide-react'

interface LoadingProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
}

export function Loading({ message = '로딩 중...', size = 'md' }: LoadingProps) {
  return (
    <div className="flex items-center justify-center h-full w-full min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
        {message && (
          <p className="text-sm text-muted-foreground">{message}</p>
        )}
      </div>
    </div>
  )
}

