import { TableSpecPanel } from '@/components/admin/table-spec/TableSpecPanel'

export const metadata = {
  title: 'DB 테이블 스펙',
  description: 'DB 테이블 구조 및 인덱스 정보',
}

export default function TableSpecPage() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <TableSpecPanel />
    </div>
  )
}

