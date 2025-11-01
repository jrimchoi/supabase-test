// Prisma Client 싱글턴
// Next.js의 Hot Reload 시 multiple instance 방지

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
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

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

