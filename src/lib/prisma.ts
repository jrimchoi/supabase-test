// Prisma Client 싱글턴
// Next.js의 Hot Reload 시 multiple instance 방지

import { PrismaClient } from '@prisma/client'
import { createRevisionExtension } from './prisma/middleware'

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined
}

function createPrismaClient() {
  const basePrisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL + (
          // Pooler 사용 시 pgbouncer=true 자동 추가 (Prepared Statement 비활성화)
          process.env.DATABASE_URL?.includes('pooler.supabase.com') && 
          !process.env.DATABASE_URL?.includes('pgbouncer=true')
            ? '&pgbouncer=true'
            : ''
        ),
      },
    },
  })

  // Extension 적용 (통합 테스트에서는 스킵)
  if (process.env.SKIP_PRISMA_EXTENSIONS === 'true') {
    console.log('⚠️  Prisma Extensions 스킵 (통합 테스트 모드)')
    return basePrisma
  }

  return basePrisma.$extends(createRevisionExtension(basePrisma))
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

