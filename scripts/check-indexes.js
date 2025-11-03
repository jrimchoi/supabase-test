const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkIndex() {
  console.log('🔍 인덱스 확인 중...\n')
  
  const result = await prisma.$queryRaw`
    SELECT indexname, indexdef 
    FROM pg_indexes 
    WHERE tablename = 'BusinessObject'
    ORDER BY indexname
  `
  
  console.log('📊 BusinessObject 테이블 인덱스:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  result.forEach((idx, i) => {
    console.log(`${i + 1}. ${idx.indexname}`)
    console.log(`   ${idx.indexdef}\n`)
  })
  
  // createdAt 인덱스 확인
  const hasCreatedAtIndex = result.some(idx => idx.indexname === 'BusinessObject_createdAt_idx')
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  if (hasCreatedAtIndex) {
    console.log('✅ createdAt 인덱스 존재!')
  } else {
    console.log('❌ createdAt 인덱스 없음! (추가 필요)')
    console.log('\n다음 SQL을 Supabase SQL Editor에서 실행하세요:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('CREATE INDEX IF NOT EXISTS "BusinessObject_createdAt_idx"')
    console.log('  ON "BusinessObject"("createdAt" DESC);')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  }
}

checkIndex()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

