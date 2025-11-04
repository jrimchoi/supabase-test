/**
 * Prisma Client Extension: BusinessObject 리비전 자동 할당
 * 
 * BusinessObject 생성 시:
 * 1. typeId를 통해 Policy의 revisionSequence 조회
 * 2. policyId 자동 할당
 * 3. name이 없으면 자동 생성 (속성 상속 지원)
 * 4. 동일 typeId + policyId + name의 최신 revision 조회
 * 5. 다음 revision 계산 (순환)
 */

import { Prisma, PrismaClient } from '@prisma/client'
import { getInheritedTypeAttributes } from '../business-type-utils'

export function createRevisionExtension(prisma: PrismaClient) {
  return Prisma.defineExtension({
    name: 'revisionAutoAssignment',
    query: {
      businessObject: {
        async create({ args, query }) {
          const data = args.data as {
            typeId?: string
            name?: string
            policyId?: string
            revision?: string
            [key: string]: unknown
          }

          // 리비전 시스템 사용 시 (typeId가 있을 때)
          if (data.typeId) {
            // 1. Type → Policy 정보 가져오기
            const type = await prisma.type.findUnique({
              where: { id: data.typeId as string },
              select: {
                id: true,
                name: true,
                description: true,
                prefix: true, 
                policyId: true,
                policy: {
                  select: {
                    id: true,
                    revisionSequence: true,
                  },
                },
              },
            })

            if (!type) {
              throw new Error(`Type not found: ${data.typeId}`)
            }

            if (!type.policy) {
              throw new Error(`Policy not found for Type: ${data.typeId}`)
            }

            // 2. policyId 자동 할당
            if (!data.policyId) {
              data.policyId = type.policyId
            }

            // 3. name 자동 생성 (없을 경우)
            if (!data.name) {
              // prefix 가져오기 (상속 지원)
              const inheritedAttrs = await getInheritedTypeAttributes(data.typeId as string)
              const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '')
              const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
              data.name = `${inheritedAttrs.prefix}-${timestamp}-${random}`
            }

            // 4. revision 자동 할당 (없을 경우)
            if (!data.revision) {
              // revisionSequence 파싱
              const sequence = type.policy.revisionSequence
                .split(',')
                .map(s => s.trim())
                .filter(Boolean)

              if (sequence.length === 0) {
                throw new Error(`Invalid revisionSequence in Policy: ${type.policy.id}`)
              }

              // 동일 typeId + policyId + name의 최신 revision 조회
              const latestObject = await prisma.businessObject.findFirst({
                where: {
                  typeId: data.typeId as string,
                  policyId: data.policyId as string,
                  name: data.name as string,
                },
                orderBy: {
                  createdAt: 'desc', // 최신 생성 순
                },
                select: {
                  revision: true,
                },
              })

              let nextRevision: string

              if (!latestObject || !latestObject.revision) {
                // 첫 번째 객체 → 시퀀스의 첫 번째 revision
                nextRevision = sequence[0]
              } else {
                // 순환 로직
                const currentIndex = sequence.indexOf(latestObject.revision)
                
                if (currentIndex === -1) {
                  // 현재 revision이 sequence에 없으면 에러
                  throw new Error(
                    `Invalid revision "${latestObject.revision}" not in sequence: ${sequence.join(', ')}`
                  )
                }

                // 다음 revision (순환)
                const nextIndex = (currentIndex + 1) % sequence.length
                nextRevision = sequence[nextIndex]
              }

              data.revision = nextRevision
            }

            // 5. 수정된 데이터로 query 실행
            return query({ ...args, data: data as any })
          }

          // typeId가 없으면 원래대로 실행
          return query(args)
        },
      },
    },
  })
}
