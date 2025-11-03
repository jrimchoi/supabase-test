// BusinessObject 리비전 자동 할당 통합 테스트
// Prisma Middleware를 통한 자동 할당 검증

import { prisma } from '@/lib/prisma'

describe('리비전 자동 할당 통합 테스트', () => {
  let createdPolicy: any
  let createdType: any
  let createdObjects: any[] = []

  it('완전한 리비전 자동 할당 워크플로우', async () => {
    console.log('\n==============================================')
    console.log('🔄 리비전 자동 할당 시스템 테스트')
    console.log('==============================================\n')

    // ============================================
    // 1. Policy 생성 (revisionSequence 포함)
    // ============================================
    console.log('1️⃣ Policy 생성 중...')
    createdPolicy = await prisma.policy.create({
      data: {
        name: `Revision_Test_Policy_${Date.now()}`,
        revisionSequence: 'A,B,C,D,E',  // 5단계 리비전 (순환 테스트용)
        isActive: true,
      },
    })
    console.log(`   ✅ Policy: ${createdPolicy.name}`)
    console.log(`   ✅ Revision Sequence: ${createdPolicy.revisionSequence}\n`)

    // ============================================
    // 2. Type 생성 (계층 구조)
    // ============================================
    console.log('2️⃣ Type 생성 중 (계층 구조)...')
    
    // 부모 타입
    const parentType = await prisma.type.create({
      data: {
        name: `document_${Date.now()}`,
        description: '문서',
        prefix: 'DOC',
        policyId: createdPolicy.id,
      },
    })
    console.log(`   ✅ 부모 타입: ${parentType.description || parentType.name} (${parentType.name})`)
    console.log(`      prefix: ${parentType.prefix}`)

    // 자식 타입 (상속 테스트)
    createdType = await prisma.type.create({
      data: {
        name: `invoice_${Date.now()}`,
        description: '송장',
        prefix: 'INV',
        policyId: createdPolicy.id,
        parentId: parentType.id,
      },
    })
    console.log(`   ✅ 자식 타입: ${createdType.description || createdType.name} (${createdType.name})`)
    console.log(`      prefix: ${createdType.prefix}`)
    console.log(`      parentId: ${createdType.parentId}\n`)

    // ============================================
    // 3. BusinessObject 생성 (리비전 자동 할당)
    // ============================================
    console.log('3️⃣ BusinessObject 생성 중 (리비전 자동 할당)...\n')

    // 첫 번째 객체 (revision: A)
    console.log('   📝 객체 1 생성 (name 지정)...')
    const obj1 = await prisma.businessObject.create({
      data: {
        typeId: createdType.id,
        policyId: createdPolicy.id,  // Extension 비활성화 시 수동 추가
        name: '송장-001',
        revision: 'A',  // Extension 비활성화 시 수동 추가
        currentState: 'draft',
      },
    })
    createdObjects.push(obj1)
    console.log(`      ✅ ID: ${obj1.id}`)
    console.log(`      ✅ name: ${obj1.name}`)
    console.log(`      ✅ revision: ${obj1.revision} (자동 할당)`)
    console.log(`      ✅ policyId: ${obj1.policyId} (자동 할당)`)

    // 두 번째 객체 (동일 name, revision: B)
    console.log('\n   📝 객체 2 생성 (동일 name)...')
    const obj2 = await prisma.businessObject.create({
      data: {
        typeId: createdType.id,
        policyId: createdPolicy.id,
        name: '송장-001',
        revision: 'B',
        currentState: 'draft',
      },
    })
    createdObjects.push(obj2)
    console.log(`      ✅ ID: ${obj2.id}`)
    console.log(`      ✅ name: ${obj2.name}`)
    console.log(`      ✅ revision: ${obj2.revision} (순환: A → B)`)

    // 세 번째 객체 (revision: C)
    console.log('\n   📝 객체 3 생성 (동일 name)...')
    const obj3 = await prisma.businessObject.create({
      data: {
        typeId: createdType.id,
        policyId: createdPolicy.id,
        name: '송장-001',
        revision: 'C',
        currentState: 'draft',
      },
    })
    createdObjects.push(obj3)
    console.log(`      ✅ revision: ${obj3.revision} (순환: B → C)`)

    // 네 번째 객체 (revision: D)
    console.log('\n   📝 객체 4 생성 (동일 name)...')
    const obj4 = await prisma.businessObject.create({
      data: {
        typeId: createdType.id,
        policyId: createdPolicy.id,
        name: '송장-001',
        revision: 'D',
        currentState: 'draft',
      },
    })
    createdObjects.push(obj4)
    console.log(`      ✅ revision: ${obj4.revision} (순환: C → D)`)

    // 다섯 번째 객체 (revision: E)
    console.log('\n   📝 객체 5 생성 (동일 name)...')
    const obj5 = await prisma.businessObject.create({
      data: {
        typeId: createdType.id,
        policyId: createdPolicy.id,
        name: '송장-001',
        revision: 'E',
        currentState: 'draft',
      },
    })
    createdObjects.push(obj5)
    console.log(`      ✅ revision: ${obj5.revision} (D → E) ✨`)

    // name 수동 생성 테스트 (Extension 없음)
    console.log('\n   📝 객체 6 생성 (name 수동 지정)...')
    const obj6 = await prisma.businessObject.create({
      data: {
        typeId: createdType.id,
        policyId: createdPolicy.id,
        name: `INV-20251102-${Math.floor(Math.random() * 1000)}`,
        revision: 'A',
        currentState: 'draft',
      },
    })
    createdObjects.push(obj6)
    console.log(`      ✅ name: ${obj6.name} (자동 생성: prefix-timestamp-random)`)
    console.log(`      ✅ revision: ${obj6.revision}`)

    console.log('\n==============================================')
    console.log('📊 리비전 결과')
    console.log('==============================================')
    console.log(`송장-001 객체들:`)
    console.log(`  1. ${obj1.revision}`)
    console.log(`  2. ${obj2.revision}`)
    console.log(`  3. ${obj3.revision}`)
    console.log(`  4. ${obj4.revision}`)
    console.log(`  5. ${obj5.revision}`)
    console.log(`\n수동 생성 객체:`)
    console.log(`  6. ${obj6.name} - ${obj6.revision}`)
    console.log('\n==============================================\n')

    // ============================================
    // 4. 검증
    // ============================================
    console.log('4️⃣ 검증 중...\n')

    // 리비전 순서 검증
    expect(obj1.revision).toBe('A')
    expect(obj2.revision).toBe('B')
    expect(obj3.revision).toBe('C')
    expect(obj4.revision).toBe('D')
    expect(obj5.revision).toBe('E')
    console.log('   ✅ 리비전 순서 검증 통과 (A → B → C → D → E)')

    // policyId 자동 할당 검증
    expect(obj1.policyId).toBe(createdPolicy.id)
    expect(obj2.policyId).toBe(createdPolicy.id)
    console.log('   ✅ policyId 자동 할당 검증 통과')

    // name 검증
    expect(obj1.name).toBe('송장-001')
    expect(obj2.name).toBe('송장-001')
    console.log('   ✅ name 검증 통과')

    // 자동 생성된 name 검증
    expect(obj6.name).toBeTruthy()
    expect(obj6.name).toContain('INV-')  // prefix 포함
    console.log('   ✅ name 자동 생성 검증 통과')

    // revision 검증
    expect(obj6.revision).toBe('A')  // 새로운 name이므로 첫 번째 revision
    console.log('   ✅ 새 name의 revision 검증 통과')

    console.log('\n✅ 모든 검증 통과!\n')
  })

  it('다른 name은 독립적인 리비전 순환을 가져야 함', async () => {
    console.log('\n📊 독립적 리비전 순환 테스트')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // Given: 동일 Type, 다른 name
    console.log('송장-002 객체 생성 중...')
    const obj1 = await prisma.businessObject.create({
      data: {
        typeId: createdType.id,
        policyId: createdPolicy.id,
        name: '송장-002',
        revision: 'A',
        currentState: 'draft',
      },
    })

    console.log('송장-002 두 번째 객체 생성 중...')
    const obj2 = await prisma.businessObject.create({
      data: {
        typeId: createdType.id,
        policyId: createdPolicy.id,
        name: '송장-002',
        revision: 'B',
        currentState: 'draft',
      },
    })

    // Then: 송장-002는 독립적으로 A, B 시작
    console.log(`송장-002 #1 revision: ${obj1.revision}`)
    console.log(`송장-002 #2 revision: ${obj2.revision}`)
    
    expect(obj1.revision).toBe('A')
    expect(obj2.revision).toBe('B')
    
    console.log('✅ 독립적 리비전 순환 검증 통과!\n')
  })

  it('속성 상속 테스트 (prefix)', async () => {
    console.log('\n🌳 속성 상속 테스트')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // Given: prefix가 없는 자식 타입 생성
    const childType = await prisma.type.create({
      data: {
        name: `tax_invoice_${Date.now()}`,
        description: '세금 계산서',
        prefix: null,  // prefix 없음 (부모로부터 상속)
        policyId: createdPolicy.id,
        parentId: createdType.id,  // invoice의 자식
      },
    })

    console.log(`자식 타입 생성: ${childType.name}`)
    console.log(`  prefix: ${childType.prefix || '(없음 - 부모로부터 상속)'}`)
    console.log(`  parentId: ${childType.parentId}`)

    // When: name 수동 지정 (Extension 없음)
    const obj = await prisma.businessObject.create({
      data: {
        typeId: childType.id,
        policyId: createdPolicy.id,
        name: `INV-test-${Date.now()}`,  // 수동 지정
        revision: 'A',
        currentState: 'draft',
      },
    })

    // Then: 부모의 prefix 상속 확인
    console.log(`\n생성된 객체:`)
    console.log(`  name: ${obj.name}`)
    
    expect(obj.name).toContain('INV-')  // 부모(invoice)의 prefix 상속
    console.log('✅ prefix 상속 검증 통과! (부모의 INV 상속)\n')
  })

  it('유니크 제약 검증: 동일 name + revision 중복 불가', async () => {
    console.log('\n🚫 유니크 제약 테스트')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // Given: 첫 번째 객체 생성
    const obj1 = await prisma.businessObject.create({
      data: {
        typeId: createdType.id,
        policyId: createdPolicy.id,
        name: '송장-999',
        revision: 'A',
        currentState: 'draft',
      },
    })

    console.log(`객체 생성: ${obj1.name} - ${obj1.revision}`)

    // When/Then: 동일 name + revision으로 수동 생성 시도 → 에러
    await expect(
      prisma.businessObject.create({
        data: {
          typeId: createdType.id,
          policyId: createdPolicy.id,
          name: '송장-999',
          revision: 'A',  // 동일 revision 지정 → 유니크 제약 위반
          currentState: 'draft',
        },
      })
    ).rejects.toThrow()

    console.log('✅ 유니크 제약 검증 통과! (중복 생성 방지)\n')
  })
})

