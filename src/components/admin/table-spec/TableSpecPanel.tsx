'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Database, Loader2, Table as TableIcon, Key, BarChart } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

type TableInfo = {
  tableName: string
  columns: any[]
  indexes: any[]
  constraints: any[]
  stats: any
  size: any
  ddl: string
  executionTime: number
}

const PRISMA_TABLES = [
  'Policy',
  'State',
  'StateTransition',
  'Permission',
  'Role',
  'Group',
  'Type',
  'Attribute',
  'TypeAttribute',
  'BusinessObject',
  'UserRole',
  'UserGroup',
]

export function TableSpecPanel() {
  const [selectedTable, setSelectedTable] = useState<string>('BusinessObject')
  const [isLoading, setIsLoading] = useState(false)
  const [tableInfo, setTableInfo] = useState<TableInfo | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadTableInfo = async (tableName: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/table-spec?table=${tableName}`)
      const data = await response.json()

      if (response.ok) {
        setTableInfo(data)
      } else {
        setError(data.error || '테이블 정보 조회 실패')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '네트워크 오류')
    } finally {
      setIsLoading(false)
    }
  }

  // 초기 로드
  useEffect(() => {
    if (selectedTable) {
      loadTableInfo(selectedTable)
    }
  }, [selectedTable])

  return (
    <div className="flex flex-col gap-4 p-6 h-full overflow-y-auto">
      {/* 헤더 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TableIcon className="h-5 w-5" />
            DB 테이블 스펙
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            PostgreSQL 테이블의 DDL, 인덱스, 통계 정보를 확인합니다.
          </p>
        </CardContent>
      </Card>

      {/* 테이블 선택 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            테이블 선택
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Select value={selectedTable} onValueChange={setSelectedTable}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRISMA_TABLES.map((table) => (
                <SelectItem key={table} value={table}>
                  {table}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={() => loadTableInfo(selectedTable)}
            disabled={isLoading || !selectedTable}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                조회 중...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                조회
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 에러 */}
      {error && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* 테이블 정보 */}
      {tableInfo && (
        <>
          {/* 기본 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <BarChart className="h-8 w-8 text-blue-500 mb-2" />
                  <p className="text-sm text-muted-foreground">Row Count</p>
                  <p className="text-2xl font-bold">
                    {tableInfo.stats?.row_count?.toLocaleString() || '0'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <Database className="h-8 w-8 text-green-500 mb-2" />
                  <p className="text-sm text-muted-foreground">Table Size</p>
                  <p className="text-2xl font-bold">{tableInfo.size?.table_size || '-'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <Key className="h-8 w-8 text-orange-500 mb-2" />
                  <p className="text-sm text-muted-foreground">Indexes Size</p>
                  <p className="text-2xl font-bold">{tableInfo.size?.indexes_size || '-'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <TableIcon className="h-8 w-8 text-purple-500 mb-2" />
                  <p className="text-sm text-muted-foreground">Total Size</p>
                  <p className="text-2xl font-bold">{tableInfo.size?.total_size || '-'}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* DDL */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>DDL (CREATE TABLE)</span>
                <Badge variant="outline">조회 시간: {tableInfo.executionTime}ms</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded-md overflow-x-auto font-mono">
                {tableInfo.ddl}
              </pre>
            </CardContent>
          </Card>

          {/* 컬럼 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>컬럼 정보 ({tableInfo.columns.length}개)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-48">컬럼명</TableHead>
                      <TableHead className="w-32">타입</TableHead>
                      <TableHead className="w-24">Nullable</TableHead>
                      <TableHead>Default</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableInfo.columns.map((col) => (
                      <TableRow key={col.column_name}>
                        <TableCell className="font-mono text-sm">{col.column_name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{col.data_type}</Badge>
                        </TableCell>
                        <TableCell>
                          {col.is_nullable === 'YES' ? (
                            <Badge variant="outline">NULL</Badge>
                          ) : (
                            <Badge variant="default">NOT NULL</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          {col.column_default || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* 인덱스 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                인덱스 ({tableInfo.indexes.length}개)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tableInfo.indexes.length === 0 ? (
                <p className="text-sm text-muted-foreground">인덱스가 없습니다</p>
              ) : (
                <div className="space-y-3">
                  {tableInfo.indexes.map((idx) => (
                    <div key={idx.indexname} className="border rounded-md p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="default">{idx.indexname}</Badge>
                        {idx.indexname.includes('_pkey') && (
                          <Badge variant="outline">PRIMARY KEY</Badge>
                        )}
                      </div>
                      <pre className="text-xs bg-muted p-2 rounded font-mono overflow-x-auto">
                        {idx.indexdef}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 제약 조건 */}
          {tableInfo.constraints.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>제약 조건 ({tableInfo.constraints.length}개)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tableInfo.constraints.map((constraint) => (
                    <div key={constraint.constraint_name} className="border rounded-md p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="default">{constraint.constraint_name}</Badge>
                        <Badge variant="outline">
                          {constraint.constraint_type === 'p' && 'PRIMARY KEY'}
                          {constraint.constraint_type === 'f' && 'FOREIGN KEY'}
                          {constraint.constraint_type === 'u' && 'UNIQUE'}
                          {constraint.constraint_type === 'c' && 'CHECK'}
                        </Badge>
                      </div>
                      <pre className="text-xs bg-muted p-2 rounded font-mono overflow-x-auto">
                        {constraint.definition}
                      </pre>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 통계 정보 */}
          {tableInfo.stats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5" />
                  통계 정보
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium mb-1">Live Rows</p>
                    <p className="text-muted-foreground">
                      {tableInfo.stats.row_count?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Dead Rows</p>
                    <p className="text-muted-foreground">
                      {tableInfo.stats.dead_rows?.toLocaleString() || '0'}
                    </p>
                  </div>
                  {tableInfo.stats.last_vacuum && (
                    <div>
                      <p className="font-medium mb-1">Last Vacuum</p>
                      <p className="text-muted-foreground text-xs">
                        {(() => {
                          try {
                            const date = new Date(tableInfo.stats.last_vacuum)
                            return isNaN(date.getTime())
                              ? '-'
                              : format(date, 'yyyy-MM-dd HH:mm:ss', { locale: ko })
                          } catch {
                            return '-'
                          }
                        })()}
                      </p>
                    </div>
                  )}
                  {tableInfo.stats.last_analyze && (
                    <div>
                      <p className="font-medium mb-1">Last Analyze</p>
                      <p className="text-muted-foreground text-xs">
                        {(() => {
                          try {
                            const date = new Date(tableInfo.stats.last_analyze)
                            return isNaN(date.getTime())
                              ? '-'
                              : format(date, 'yyyy-MM-dd HH:mm:ss', { locale: ko })
                          } catch {
                            return '-'
                          }
                        })()}
                      </p>
                    </div>
                  )}
                  {tableInfo.stats.last_autovacuum && (
                    <div>
                      <p className="font-medium mb-1">Last Autovacuum</p>
                      <p className="text-muted-foreground text-xs">
                        {(() => {
                          try {
                            const date = new Date(tableInfo.stats.last_autovacuum)
                            return isNaN(date.getTime())
                              ? '-'
                              : format(date, 'yyyy-MM-dd HH:mm:ss', { locale: ko })
                          } catch {
                            return '-'
                          }
                        })()}
                      </p>
                    </div>
                  )}
                  {tableInfo.stats.last_autoanalyze && (
                    <div>
                      <p className="font-medium mb-1">Last Autoanalyze</p>
                      <p className="text-muted-foreground text-xs">
                        {(() => {
                          try {
                            const date = new Date(tableInfo.stats.last_autoanalyze)
                            return isNaN(date.getTime())
                              ? '-'
                              : format(date, 'yyyy-MM-dd HH:mm:ss', { locale: ko })
                          } catch {
                            return '-'
                          }
                        })()}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

