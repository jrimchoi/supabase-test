'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { PlayCircle, Loader2, Clock, Database, CheckCircle } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type QueryResult = {
  success: boolean
  queryName: string
  sql: string
  executionTime: number
  serverExecutionTime: number
  resultCount: number
  data: any[]
  timestamp: string
  error?: string
}

const PRESET_QUERIES = [
  { key: 'businessObjects', name: 'BusinessObject (50개, JOIN 포함)' },
  { key: 'businessObjectsNoJoin', name: 'BusinessObject (50개, JOIN 없음)' },
  { key: 'businessObjectsCount', name: 'BusinessObject 개수' },
  { key: 'types', name: 'Type 전체' },
  { key: 'policies', name: 'Policy 전체' },
  { key: 'states', name: 'State 전체' },
  { key: 'permissions', name: 'Permission 전체' },
]

export function QueryTestPanel() {
  const [selectedQuery, setSelectedQuery] = useState<string>('businessObjects')
  const [customSql, setCustomSql] = useState<string>('')
  const [useCustomSql, setUseCustomSql] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [result, setResult] = useState<QueryResult | null>(null)
  const [clientTime, setClientTime] = useState<number>(0)

  const executeQuery = async () => {
    setIsExecuting(true)
    setResult(null)

    const clientStartTime = performance.now()

    try {
      const response = await fetch('/api/query-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queryKey: useCustomSql ? undefined : selectedQuery,
          customSql: useCustomSql ? customSql : undefined,
        }),
      })

      const clientEndTime = performance.now()
      const clientExecutionTime = clientEndTime - clientStartTime

      setClientTime(parseFloat(clientExecutionTime.toFixed(2)))

      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setResult({
          success: false,
          queryName: 'Error',
          sql: '',
          executionTime: 0,
          serverExecutionTime: 0,
          resultCount: 0,
          data: [],
          timestamp: new Date().toISOString(),
          error: data.error || '쿼리 실행 실패',
        })
      }
    } catch (error) {
      setResult({
        success: false,
        queryName: 'Error',
        sql: '',
        executionTime: 0,
        serverExecutionTime: 0,
        resultCount: 0,
        data: [],
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : '네트워크 오류',
      })
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-6 h-full overflow-y-auto">
      {/* 헤더 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            DB 쿼리 성능 테스트
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            DB 쿼리 실행 시간을 측정하여 성능을 분석합니다.
            <br />
            로컬 개발 환경과 Vercel 배포 환경의 성능 차이를 확인할 수 있습니다.
          </p>
        </CardContent>
      </Card>

      {/* 쿼리 선택 */}
      <Card>
        <CardHeader>
          <CardTitle>1. 쿼리 선택</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              variant={!useCustomSql ? 'default' : 'outline'}
              onClick={() => setUseCustomSql(false)}
            >
              미리 정의된 쿼리
            </Button>
            <Button
              variant={useCustomSql ? 'default' : 'outline'}
              onClick={() => setUseCustomSql(true)}
            >
              커스텀 SQL
            </Button>
          </div>

          {!useCustomSql ? (
            <div>
              <label className="text-sm font-medium mb-2 block">쿼리 선택</label>
              <Select value={selectedQuery} onValueChange={setSelectedQuery}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRESET_QUERIES.map((query) => (
                    <SelectItem key={query.key} value={query.key}>
                      {query.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium mb-2 block">
                SQL 입력 (SELECT만 허용)
              </label>
              <Textarea
                value={customSql}
                onChange={(e) => setCustomSql(e.target.value)}
                placeholder="SELECT * FROM &quot;BusinessObject&quot; LIMIT 10"
                rows={8}
                className="font-mono text-sm"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* 실행 버튼 */}
      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={executeQuery}
          disabled={isExecuting || (useCustomSql && !customSql.trim())}
        >
          {isExecuting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              실행 중...
            </>
          ) : (
            <>
              <PlayCircle className="mr-2 h-5 w-5" />
              쿼리 실행
            </>
          )}
        </Button>
      </div>

      {/* 결과 */}
      {result && (
        <>
          {/* 성능 지표 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <Clock className="h-8 w-8 text-blue-500 mb-2" />
                  <p className="text-sm text-muted-foreground">클라이언트 시간</p>
                  <p className="text-2xl font-bold">{clientTime}ms</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    (네트워크 + 서버)
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <Database className="h-8 w-8 text-green-500 mb-2" />
                  <p className="text-sm text-muted-foreground">서버 실행 시간</p>
                  <p className="text-2xl font-bold">{result.executionTime}ms</p>
                  <p className="text-xs text-muted-foreground mt-1">(DB 쿼리)</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <Clock className="h-8 w-8 text-orange-500 mb-2" />
                  <p className="text-sm text-muted-foreground">네트워크 시간</p>
                  <p className="text-2xl font-bold">
                    {(clientTime - result.executionTime).toFixed(2)}ms
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    (클라이언트 - 서버)
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <CheckCircle className="h-8 w-8 text-purple-500 mb-2" />
                  <p className="text-sm text-muted-foreground">결과 개수</p>
                  <p className="text-2xl font-bold">{result.resultCount}</p>
                  <p className="text-xs text-muted-foreground mt-1">행</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 쿼리 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>쿼리 정보</span>
                <Badge variant={result.success ? 'default' : 'destructive'}>
                  {result.success ? '성공' : '실패'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">쿼리 이름</p>
                <p className="text-sm text-muted-foreground">{result.queryName}</p>
              </div>

              {result.sql && (
                <div>
                  <p className="text-sm font-medium mb-1">실행된 SQL</p>
                  <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
                    {result.sql}
                  </pre>
                </div>
              )}

              {result.error && (
                <div>
                  <p className="text-sm font-medium mb-1 text-destructive">에러</p>
                  <p className="text-sm text-destructive">{result.error}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium mb-1">실행 시간</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(result.timestamp).toLocaleString('ko-KR')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 결과 데이터 미리보기 */}
          {result.success && result.data.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>결과 데이터 (최대 10개)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <pre className="text-xs bg-muted p-4 rounded-md">
                    {JSON.stringify(result.data.slice(0, 10), null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

