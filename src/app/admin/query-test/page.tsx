import { QueryTestPanel } from '@/components/admin/query-test/QueryTestPanel'

export const metadata = {
  title: 'DB 쿼리 성능 테스트',
  description: 'DB 쿼리 실행 시간 측정',
}

export default function QueryTestPage() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <QueryTestPanel />
    </div>
  )
}

