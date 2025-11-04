import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type TableSkeletonProps = {
  rows?: number
  cols?: number
}

export function TableSkeleton({ rows = 5, cols = 5 }: TableSkeletonProps) {
  return (
    <div className="flex flex-col h-full mt-2.5">
      {/* Header Skeleton */}
      <div className="admin-header-wrapper">
        <div className="border rounded-lg">
          <div className="admin-header-card-content">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
            <div className="flex-1" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="flex-1 min-h-0 border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: cols }).map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-4 w-full" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: cols }).map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Skeleton */}
      <div className="admin-table-spacing flex justify-between items-center">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
    </div>
  )
}

