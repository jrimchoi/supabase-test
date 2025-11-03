import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { TypeList } from '@/components/admin/types/TypeList'

export const metadata = {
  title: 'Type 관리',
  description: '비즈니스 타입 관리 페이지 (계층 구조, 리비전 시스템, Attribute 연결)',
}

// ISR: 60초 캐싱, 데이터 변경 시 자동 revalidate
// searchParams 제거로 Static/ISR 가능!
export const revalidate = 60

async function getAllTypes() {
  const types = await prisma.type.findMany({
    include: {
      policy: {
        select: {
          name: true,
          revisionSequence: true,
        },
      },
      parent: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
      _count: {
        select: {
          children: true,
          objects: true,
          typeAttributes: true,
        },
      },
    },
    orderBy: [
      { name: 'asc' },
    ],
  })

  return types
}

export default async function TypesPage() {
  const types = await getAllTypes()

  return (
    <div className="admin-page-container">
      <div className="flex-1 min-h-0">
        <Suspense fallback={<div>로딩 중...</div>}>
          <TypeList initialTypes={types} />
        </Suspense>
      </div>
    </div>
  )
}

