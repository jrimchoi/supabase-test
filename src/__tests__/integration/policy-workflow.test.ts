/**
 * Policy Workflow 통합 테스트
 * 
 * 테스트 시나리오:
 * 1. Role 3개 생성 (Admin, Manager, Developer)
 * 2. Group 3개 생성 (Engineering, Design, QA)
 * 3. 사용자 3명 생성
 * 4. Group, Role에 사용자 배정
 * 5. Policy에 State 생성 (Create, Assign, In Work, Review, Complete)
 * 6. 각 상태별 Role, Group 할당
 * 7. Policy의 상태별 권한 리스트 조회
 */

import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

describe('Policy Workflow 통합 테스트', () => {
  // 테스트용 데이터 저장
  const createdRoles: any[] = []
  const createdGroups: any[] = []
  const userIds: string[] = []
  const createdUserRoles: any[] = []
  const createdUserGroups: any[] = []
  let createdPolicy: any
  const createdStates: any[] = []
  const createdStateTransitions: any[] = []
  const createdPermissions: any[] = []

  // 테스트 후 정리
  afterAll(async () => {
    try {
      // 역순 삭제 (외래 키 제약)
      if (createdPermissions.length > 0) {
        await prisma.permission.deleteMany({
          where: { id: { in: createdPermissions.map((p) => p.id) } },
        })
      }

      if (createdStateTransitions.length > 0) {
        await prisma.stateTransition.deleteMany({
          where: { id: { in: createdStateTransitions.map((st) => st.id) } },
        })
      }

      if (createdUserGroups.length > 0) {
        await prisma.userGroup.deleteMany({
          where: { id: { in: createdUserGroups.map((ug) => ug.id) } },
        })
      }

      if (createdUserRoles.length > 0) {
        await prisma.userRole.deleteMany({
          where: { id: { in: createdUserRoles.map((ur) => ur.id) } },
        })
      }

      // profiles는 auth.users와 연동되므로 테스트에서 삭제하지 않음
      // (기존 사용자 사용 방식이므로 삭제 불필요)

      if (createdStates.length > 0) {
        await prisma.state.deleteMany({
          where: { id: { in: createdStates.map((s) => s.id) } },
        })
      }

      if (createdPolicy) {
        await prisma.policy.delete({ where: { id: createdPolicy.id } })
      }

      if (createdGroups.length > 0) {
        await prisma.group.deleteMany({
          where: { id: { in: createdGroups.map((g) => g.id) } },
        })
      }

      if (createdRoles.length > 0) {
        await prisma.role.deleteMany({
          where: { id: { in: createdRoles.map((r) => r.id) } },
        })
      }

      console.log('\n✅ 테스트 데이터 정리 완료!')
    } catch (error) {
      console.error('❌ 정리 중 에러:', error)
    } finally {
      await prisma.$disconnect()
    }
  })

  it('전체 워크플로우 테스트: Role, Group, User, Policy, State, Permission 생성 및 조회', async () => {
    console.log('\n==============================================')
    console.log('📋 Policy Workflow 통합 테스트 시작')
    console.log('==============================================')

    // ============================================
    // 1. Role 생성
    // ============================================
    console.log('1️⃣ Role 생성 중...')
    const roleNames = ['Admin', 'Manager', 'Developer']
    for (const name of roleNames) {
      const role = await prisma.role.create({
        data: {
          name: `Test_${name}_${Date.now()}`,
          description: `${name} 역할`,
        },
      })
      createdRoles.push(role)
      console.log(`   ✅ ${name} 역할 생성: ${role.id}`)
    }
    console.log(`   총 ${createdRoles.length}개 Role 생성 완료\n`)

    // ============================================
    // 2. Group 생성
    // ============================================
    console.log('2️⃣ Group 생성 중...')
    const groupNames = ['Engineering', 'Design', 'QA']
    for (const name of groupNames) {
      const group = await prisma.group.create({
        data: {
          name: `Test_${name}_${Date.now()}`,
          description: `${name} 그룹`,
        },
      })
      createdGroups.push(group)
      console.log(`   ✅ ${name} 그룹 생성: ${group.id}`)
    }
    console.log(`   총 ${createdGroups.length}개 Group 생성 완료\n`)

    // ============================================
    // 3. 사용자 ID 생성 (profiles FK 제약조건으로 인해 직접 생성 불가)
    // ============================================
    console.log('3️⃣ 사용자 ID 생성 중 (UUID)...')
    const timestamp = Date.now()
    
    // Supabase의 profiles 테이블은 auth.users를 참조하므로
    // 테스트에서는 실제 auth.users의 UUID를 사용하거나
    // profiles FK를 제거해야 합니다.
    // 여기서는 실제 존재하는 사용자 ID를 사용합니다.
    
    // 실제 profiles에서 사용자 가져오기
    const existingUsers = await prisma.profile.findMany({
      take: 3,
      select: { id: true, email: true },
    })
    
    if (existingUsers.length >= 3) {
      // 기존 사용자 사용
      existingUsers.forEach((user, idx) => {
        userIds.push(user.id)
        console.log(`   ✅ User ${idx + 1}: ${user.email} (UUID: ${user.id})`)
      })
    } else {
      // 기존 사용자가 부족하면 UUID만 생성 (UserRole/UserGroup 생성은 스킵)
      console.log('   ⚠️  profiles에 사용자가 부족합니다. UUID만 생성합니다.')
      for (let i = 1; i <= 3; i++) {
        const userId = randomUUID()
        userIds.push(userId)
        console.log(`   ✅ User ${i}: (UUID: ${userId}) - FK 제약조건으로 UserRole/UserGroup 생성 스킵`)
      }
    }
    console.log(`   총 ${userIds.length}명 사용자 ID 준비 완료\n`)

    // ============================================
    // 4. 사용자에게 Role 및 Group 할당
    // ============================================
    console.log('4️⃣ 사용자에게 Role 및 Group 할당 중...')

    // 실제 profiles에 있는 사용자만 할당 가능
    const existingUserCheck = await prisma.profile.findMany({
      where: { id: { in: userIds } },
      select: { id: true },
    })

    if (existingUserCheck.length >= 3) {
      // User 1: Admin Role + Engineering Group
      const userRole1 = await prisma.userRole.create({
        data: {
          userId: userIds[0],
          roleId: createdRoles[0].id, // Admin
        },
      })
      createdUserRoles.push(userRole1)
      console.log(`   ✅ ${userIds[0]} → Admin Role`)

      const userGroup1 = await prisma.userGroup.create({
        data: {
          userId: userIds[0],
          groupId: createdGroups[0].id, // Engineering
        },
      })
      createdUserGroups.push(userGroup1)
      console.log(`   ✅ ${userIds[0]} → Engineering Group\n`)

      // User 2: Manager Role + Design Group
      const userRole2 = await prisma.userRole.create({
        data: {
          userId: userIds[1],
          roleId: createdRoles[1].id, // Manager
        },
      })
      createdUserRoles.push(userRole2)
      console.log(`   ✅ ${userIds[1]} → Manager Role`)

      const userGroup2 = await prisma.userGroup.create({
        data: {
          userId: userIds[1],
          groupId: createdGroups[1].id, // Design
        },
      })
      createdUserGroups.push(userGroup2)
      console.log(`   ✅ ${userIds[1]} → Design Group\n`)

      // User 3: Developer Role + QA Group
      const userRole3 = await prisma.userRole.create({
        data: {
          userId: userIds[2],
          roleId: createdRoles[2].id, // Developer
        },
      })
      createdUserRoles.push(userRole3)
      console.log(`   ✅ ${userIds[2]} → Developer Role`)

      const userGroup3 = await prisma.userGroup.create({
        data: {
          userId: userIds[2],
          groupId: createdGroups[2].id, // QA
        },
      })
      createdUserGroups.push(userGroup3)
      console.log(`   ✅ ${userIds[2]} → QA Group\n`)
    } else {
      console.log(`   ⚠️  profiles에 사용자가 없어서 UserRole/UserGroup 생성을 스킵합니다.\n`)
    }

    // ============================================
    // 5. Policy 및 State 생성
    // ============================================
    console.log('5️⃣ Policy 생성 중...')
    createdPolicy = await prisma.policy.create({
      data: {
        name: `Test_문서_결재_정책_${Date.now()}`,
        isActive: true,
      },
    })
    console.log(`   ✅ Policy: ${createdPolicy.name} (${createdPolicy.id})`)
    console.log(`   활성화: ${createdPolicy.isActive}\n`)

    // ============================================
    // 6. State 생성 (Create, Assign, In Work, Review, Complete)
    // ============================================
    console.log('6️⃣ State 생성 중...')
    const stateNames = ['Create', 'Assign', 'In Work', 'Review', 'Complete']
    for (let i = 0; i < stateNames.length; i++) {
      const state = await prisma.state.create({
        data: {
          name: stateNames[i],
          policyId: createdPolicy.id,
          order: i,
          isInitial: i === 0,
          isFinal: i === stateNames.length - 1,
        },
      })
      createdStates.push(state)
      console.log(`   ✅ State ${i + 1}: ${state.name} (order: ${state.order})`)
    }
    console.log(`   총 ${createdStates.length}개 State 생성 완료\n`)

    // ============================================
    // 7. State Transitions 생성
    // ============================================
    console.log('7️⃣ State Transitions 생성 중...')
    for (let i = 0; i < createdStates.length - 1; i++) {
      const transition = await prisma.stateTransition.create({
        data: {
          fromStateId: createdStates[i].id,
          toStateId: createdStates[i + 1].id,
        },
      })
      createdStateTransitions.push(transition)
      console.log(
        `   ✅ Transition: ${createdStates[i].name} → ${createdStates[i + 1].name}`
      )
    }
    console.log(`   총 ${createdStateTransitions.length}개 Transition 생성 완료\n`)

    // ============================================
    // 8. 각 State별 Permission 생성 (새 스키마: resource + action)
    // ============================================
    console.log('8️⃣ 각 State별 Permission 생성 중...')

    // Create 상태: Admin Role - create, view, modify 권한
    const createStatePerms = [
      { action: 'create', role: createdRoles[0].id, roleName: 'Admin' },
      { action: 'view', role: createdRoles[0].id, roleName: 'Admin' },
      { action: 'modify', role: createdRoles[0].id, roleName: 'Admin' },
    ]
    for (const p of createStatePerms) {
      const perm = await prisma.permission.create({
        data: {
          stateId: createdStates[0].id, // Create
          resource: 'document',
          action: p.action,
          targetType: 'role',
          roleId: p.role,
          isAllowed: true,
        },
      })
      createdPermissions.push(perm)
    }
    console.log(`   ✅ [Create] Admin Role → create, view, modify`)

    // Assign 상태: Manager Role - view, modify 권한
    const assignStatePerms = [
      { action: 'view', role: createdRoles[1].id, roleName: 'Manager' },
      { action: 'modify', role: createdRoles[1].id, roleName: 'Manager' },
    ]
    for (const p of assignStatePerms) {
      const perm = await prisma.permission.create({
        data: {
          stateId: createdStates[1].id, // Assign
          resource: 'document',
          action: p.action,
          targetType: 'role',
          roleId: p.role,
          isAllowed: true,
        },
      })
      createdPermissions.push(perm)
    }
    console.log(`   ✅ [Assign] Manager Role → view, modify`)

    // In Work 상태: Engineering Group - view, modify 권한
    const inWorkStatePerms = [
      { action: 'view', group: createdGroups[0].id, groupName: 'Engineering' },
      { action: 'modify', group: createdGroups[0].id, groupName: 'Engineering' },
    ]
    for (const p of inWorkStatePerms) {
      const perm = await prisma.permission.create({
        data: {
          stateId: createdStates[2].id, // In Work
          resource: 'document',
          action: p.action,
          targetType: 'group',
          groupId: p.group,
          isAllowed: true,
        },
      })
      createdPermissions.push(perm)
    }
    console.log(`   ✅ [In Work] Engineering Group → view, modify`)

    // Review 상태: QA Group - view only
    const reviewStatePerm = await prisma.permission.create({
      data: {
        stateId: createdStates[3].id, // Review
        resource: 'document',
        action: 'view',
        targetType: 'group',
        groupId: createdGroups[2].id, // QA
        isAllowed: true,
      },
    })
    createdPermissions.push(reviewStatePerm)
    console.log(`   ✅ [Review] QA Group → view only`)

    // Complete 상태: Admin Role - view, delete 권한
    const completeStatePerms = [
      { action: 'view', role: createdRoles[0].id, roleName: 'Admin' },
      { action: 'delete', role: createdRoles[0].id, roleName: 'Admin' },
    ]
    for (const p of completeStatePerms) {
      const perm = await prisma.permission.create({
        data: {
          stateId: createdStates[4].id, // Complete
          resource: 'document',
          action: p.action,
          targetType: 'role',
          roleId: p.role,
          isAllowed: true,
        },
      })
      createdPermissions.push(perm)
    }
    console.log(`   ✅ [Complete] Admin Role → view, delete`)

    console.log(`   총 ${createdPermissions.length}개 Permission 생성 완료\n`)

    // ============================================
    // 9. Policy의 상태별 권한 리스트 조회
    // ============================================
    console.log('9️⃣ Policy의 상태별 권한 리스트 조회 중...\n')

    const policyWithDetails = await prisma.policy.findUnique({
      where: { id: createdPolicy.id },
      include: {
        states: {
          include: {
            permissions: {
              include: {
                role: true,
                group: true,
              },
            },
            fromTransitions: {
              include: {
                toState: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    })

    console.log('==============================================')
    console.log('📋 조회 결과')
    console.log('==============================================')
    console.log(`Policy: ${policyWithDetails?.name}`)
    console.log(`Active: ${policyWithDetails?.isActive}\n`)

    console.log('States 및 Permissions:')
    policyWithDetails?.states.forEach((state, idx) => {
      console.log(`\n${idx + 1}. ${state.name} (order: ${state.order})`)
      console.log(`   - Initial: ${state.isInitial}, Final: ${state.isFinal}`)

      if (state.permissions.length > 0) {
        console.log('   Permissions:')
        
        // 권한을 targetType + targetId로 그룹화
        const permsByTarget = new Map<string, { target: string; actions: string[] }>()
        
        state.permissions.forEach((perm) => {
          const targetKey =
            perm.targetType === 'role'
              ? `role-${perm.roleId}`
              : perm.targetType === 'group'
              ? `group-${perm.groupId}`
              : `user-${perm.userId}`
          
          const targetName =
            perm.targetType === 'role'
              ? `Role: ${perm.role?.name}`
              : perm.targetType === 'group'
              ? `Group: ${perm.group?.name}`
              : `User: ${perm.userId}`
          
          if (!permsByTarget.has(targetKey)) {
            permsByTarget.set(targetKey, { target: targetName, actions: [] })
          }
          
          if (perm.isAllowed) {
            permsByTarget.get(targetKey)!.actions.push(perm.action)
          }
        })
        
        permsByTarget.forEach(({ target, actions }) => {
          console.log(`     - ${target} → ${actions.join(', ')}`)
        })
      }

      if (state.fromTransitions.length > 0) {
        console.log('   Transitions:')
        state.fromTransitions.forEach((trans) => {
          console.log(`     → ${trans.toState.name}`)
        })
      }
    })

    console.log('\n==============================================')
    console.log('✅ Policy Workflow 통합 테스트 완료!')
    console.log('==============================================\n')

    // ============================================
    // 검증
    // ============================================
    expect(createdRoles).toHaveLength(3)
    expect(createdGroups).toHaveLength(3)
    expect(userIds).toHaveLength(3)
    
    // UserRole/UserGroup은 profiles에 실제 사용자가 있을 때만 생성됨
    if (existingUserCheck.length >= 3) {
      expect(createdUserRoles).toHaveLength(3)
      expect(createdUserGroups).toHaveLength(3)
      console.log('✅ UserRole, UserGroup 검증 통과!')
    } else {
      console.log('⚠️  UserRole, UserGroup 생성 스킵됨 (profiles에 사용자 없음)')
    }
    
    expect(createdPolicy).toBeDefined()
    expect(createdStates).toHaveLength(5)
    expect(createdStateTransitions).toHaveLength(4)
    expect(createdPermissions).toHaveLength(10) // 새 스키마: 각 action별 개별 레코드
    expect(policyWithDetails?.states).toHaveLength(5)

    console.log('✅ 모든 검증 통과!')
  }, 60000) // 60초 타임아웃
})

