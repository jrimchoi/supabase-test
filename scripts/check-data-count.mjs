import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const [
    businessObjectCount,
    typeCount,
    attributeCount,
    policyCount,
  ] = await Promise.all([
    prisma.businessObject.count(),
    prisma.type.count(),
    prisma.attribute.count(),
    prisma.policy.count(),
  ])

  console.log('📊 데이터 개수:')
  console.log('BusinessObject:', businessObjectCount)
  console.log('Type:', typeCount)
  console.log('Attribute:', attributeCount)
  console.log('Policy:', policyCount)
  
  // BusinessObject 크기 체크
  if (businessObjectCount > 0) {
    const sampleObjects = await prisma.businessObject.findMany({
      take: 5,
      include: {
        type: { select: { id: true, name: true, description: true, prefix: true } },
        policy: { select: { id: true, name: true, revisionSequence: true } },
      },
    })
    console.log('\n샘플 데이터 크기:', JSON.stringify(sampleObjects).length, 'bytes')
    console.log('예상 전체 크기:', Math.round(JSON.stringify(sampleObjects).length * businessObjectCount / 5 / 1024), 'KB')
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())

