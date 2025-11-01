// Policy 버전 관리 유틸리티 (수동 버전 업)

import { prisma } from '@/lib/prisma'

/**
 * Policy의 새 버전을 수동으로 생성하고 이전 버전을 비활성화
 * @param policyId 현재 Policy ID
 * @param options 새 버전 옵션
 * @returns 새로 생성된 Policy
 */
export async function createNewPolicyVersion(
  policyId: string,
  options?: {
    description?: string
    copyStates?: boolean // States 복사 여부 (기본: true)
    deactivateOld?: boolean // 이전 버전 비활성화 (기본: true)
  }
): Promise<any> {
  const { description, copyStates = true, deactivateOld = true } = options || {}

  // 1. 현재 Policy 조회
  const currentPolicy = await prisma.policy.findUnique({
    where: { id: policyId },
    include: {
      states: copyStates
        ? {
            include: {
              permissions: true,
            },
          }
        : false,
    },
  })

  if (!currentPolicy) {
    throw new Error('Policy를 찾을 수 없습니다.')
  }

  // 2. 트랜잭션으로 처리
  return await prisma.$transaction(async (tx) => {
    // 2-1. 이전 버전 비활성화 (옵션)
    if (deactivateOld) {
      await tx.policy.update({
        where: { id: policyId },
        data: { isActive: false },
      })
    }

    // 2-2. 새 버전 생성
    const newPolicy = await tx.policy.create({
      data: {
        name: currentPolicy.name,
        description: description || currentPolicy.description,
        version: currentPolicy.version + 1,
        isActive: true,
        createdBy: currentPolicy.updatedBy || currentPolicy.createdBy,
        updatedBy: currentPolicy.updatedBy,
      },
    })

    // 2-3. States 복사 (옵션)
    if (copyStates && currentPolicy.states) {
      for (const state of currentPolicy.states) {
        const newState = await tx.state.create({
          data: {
            policyId: newPolicy.id,
            name: state.name,
            description: state.description,
            order: state.order,
            isInitial: state.isInitial,
            isFinal: state.isFinal,
          },
        })

        // 2-4. Permissions 복사
        for (const permission of state.permissions) {
          await tx.permission.create({
            data: {
              stateId: newState.id,
              resource: permission.resource,
              action: permission.action,
              targetType: permission.targetType,
              roleId: permission.roleId,
              groupId: permission.groupId,
              userId: permission.userId,
              expression: permission.expression,
              isAllowed: permission.isAllowed,
            },
          })
        }
      }
    }

    console.log(
      `✅ Policy 버전 업: ${currentPolicy.name} v${currentPolicy.version} → v${newPolicy.version} (수동)`
    )

    return newPolicy
  })
}
