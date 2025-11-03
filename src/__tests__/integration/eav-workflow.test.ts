// EAV 패턴 통합 테스트
// Schema V2: Type → Attribute → BusinessObject → BusinessAttribute

import { prisma } from '@/lib/prisma'

describe('EAV 패턴 통합 테스트', () => {
  let createdPolicy: any
  let createdType: any
  let createdAttributes: any[] = []
  let createdObjects: any[] = []
  let attrTimestamp: number
  let businessObject: any

  // 테스트 후 정리
  // afterAll(async () => {
  //   // 생성된 데이터 삭제 (역순)
  //   if (createdObjects.length > 0) {
  //     await prisma.businessObject.deleteMany({
  //       where: { id: { in: createdObjects.map(o => o.id) } }
  //     })
  //   }
  //   if (createdAttributes.length > 0) {
  //     await prisma.attribute.deleteMany({
  //       where: { id: { in: createdAttributes.map(a => a.id) } }
  //     })
  //   }
  //   if (createdType) {
  //     await prisma.type.delete({ where: { id: createdType.id } })
  //   }
  //   if (createdPolicy) {
  //     await prisma.policy.delete({ where: { id: createdPolicy.id } })
  //   }

  //   await prisma.$disconnect()
  // })

  it('완전한 EAV 워크플로우: Policy → Type → Attribute → BusinessObject → BusinessAttribute', async () => {
    console.log('\n==============================================')
    console.log('📊 EAV 패턴 통합 테스트 시작')
    console.log('==============================================\n')

    // ============================================
    // 1. Policy 생성
    // ============================================
    console.log('1️⃣ Policy 생성 중...')
    createdPolicy = await prisma.policy.create({
      data: {
        name: `Test_Invoice_Policy_${Date.now()}`,
        revisionSequence: 'A,B,C',
        isActive: true,
      },
    })
    console.log(`   ✅ Policy: ${createdPolicy.name} (${createdPolicy.id})`)
    console.log(`   ✅ Revision Sequence: ${createdPolicy.revisionSequence}\n`)

    // ============================================
    // 2. Type 생성
    // ============================================
    console.log('2️⃣ Type 생성 중...')
    const typeTimestamp = Date.now()
    createdType = await prisma.type.create({
      data: {
        name: `invoice_${typeTimestamp}`,        // 고유 타입 식별자 (필수)
        description: `Invoice_${typeTimestamp}`, // 사용자 친화적 설명
        prefix: 'INV',                           // 접두사
        policyId: createdPolicy.id,              // Policy 직접 참조
      },

    })
    console.log(`   ✅ Type: ${createdType.description || createdType.name} (${createdType.id})`)
    console.log(`   ✅ policyId: ${createdType.policyId} (Policy 직접 참조)\n`)

    // ============================================
    // 3. Attribute 정의 (속성 스키마)
    // ============================================
    console.log('3️⃣ Attribute 정의 중 (공통)...')
    attrTimestamp = Date.now()
    const attributeDefs = [
      { name: `invoiceNumber_${attrTimestamp}`, label: '송장 번호', attrType: 'STRING', isRequired: true },
      { name: `customerName_${attrTimestamp}`, label: '고객명', attrType: 'STRING', isRequired: true },
      { name: `totalAmount_${attrTimestamp}`, label: '총 금액', attrType: 'INTEGER', isRequired: true },
      { name: `unitPrice_${attrTimestamp}`, label: '단가', attrType: 'REAL', isRequired: false },
      { name: `issueDate_${attrTimestamp}`, label: '발행일', attrType: 'DATE', isRequired: true },
      { name: `dueDate_${attrTimestamp}`, label: '마감일', attrType: 'DATE', isRequired: false },
      { name: `isPaid_${attrTimestamp}`, label: '결제 완료', attrType: 'BOOLEAN', isRequired: false },
      { name: `metadata_${attrTimestamp}`, label: '메타데이터', attrType: 'JSON', isRequired: false },
    ]

    // Attribute 생성 (공통 속성, typeId 없음)
    for (const attrDef of attributeDefs) {
      const attr = await prisma.attribute.create({
        data: {
          name: attrDef.name,
          label: attrDef.label,
          attrType: attrDef.attrType as any,
          isRequired: attrDef.isRequired,
        },
      })
      createdAttributes.push(attr)
      console.log(`   ✅ ${attrDef.label} (${attrDef.name}): ${attrDef.attrType}${attrDef.isRequired ? ' [필수]' : ''}`)
    }
    console.log(`   총 ${createdAttributes.length}개 Attribute 정의 완료`)

    // Type에 Attribute 할당 (TypeAttribute 생성)
    console.log('   Type에 Attribute 할당 중...')
    for (const attr of createdAttributes) {
      await prisma.typeAttribute.create({
        data: {
          typeId: createdType.id,
          attributeId: attr.id,
        },
      })
    }
    console.log(`   ✅ ${createdAttributes.length}개 Attribute를 Type에 할당 완료\n`)

    // ============================================
    // 4. BusinessObject 생성 (data 필드에 JSON으로 저장)
    // ============================================
    console.log('4️⃣ BusinessObject 생성 중 (data 필드에 JSON 저장)...')
    
    // Type/Attribute 스키마에 맞춰 데이터 구성
    const businessObjectData = {
      [`invoiceNumber_${attrTimestamp}`]: 'INV-2024-001',
      [`customerName_${attrTimestamp}`]: 'ABC 주식회사',
      [`totalAmount_${attrTimestamp}`]: 5000000,
      [`unitPrice_${attrTimestamp}`]: 125000.50,
      [`issueDate_${attrTimestamp}`]: '2024-01-01',
      [`dueDate_${attrTimestamp}`]: '2024-12-31',
      [`isPaid_${attrTimestamp}`]: false,
      [`metadata_${attrTimestamp}`]: { department: 'Sales', priority: 'high', tags: ['urgent', 'Q4'] },
    }

    businessObject = await prisma.businessObject.create({
      data: {
        typeId: createdType.id,
        policyId: createdPolicy.id,
        currentState: 'Draft',
        data: businessObjectData,
      },
    })
    createdObjects.push(businessObject)
    console.log(`   ✅ BusinessObject: ${businessObject.id}`)
    console.log(`   ✅ State: ${businessObject.currentState}`)
    console.log(`   ✅ Data: ${Object.keys(businessObjectData).length}개 속성 저장 (JSON)\n`)
    
    // 저장된 데이터 확인
    Object.entries(businessObjectData).forEach(([key, value]) => {
      const displayValue = typeof value === 'object' ? JSON.stringify(value) : value
      console.log(`      ${key}: ${displayValue}`)
    })
    console.log()

    // ============================================
    // 6. 완전한 객체 조회 및 검증
    // ============================================
    console.log('6️⃣ 완전한 객체 조회 중...\n')
    
    const fullObject = await prisma.businessObject.findUnique({
      where: { id: businessObject.id },
      include: {
        type: {
          include: {
            policy: true,  // Type이 직접 Policy 참조
            typeAttributes: {
              include: {
                attribute: true,
              },
            },
          },
        },
        policy: true,
      },
    })

    console.log('==============================================')
    console.log('📋 조회 결과')
    console.log('==============================================\n')
    console.log(`BusinessObject ID: ${fullObject?.id}`)
    console.log(`Type: ${fullObject?.type?.name} (${fullObject?.type?.description || '-'})`)
    console.log(`Type의 Policy: ${fullObject?.type?.policy.name}`)
    console.log(`BusinessObject의 Policy: ${fullObject?.policy.name}`)
    console.log(`Current State: ${fullObject?.currentState}`)
    console.log(`\n속성 정의 (Attribute Schema):`)
    fullObject?.type.typeAttributes.forEach((ta, index) => {
      console.log(`  ${index + 1}. ${ta.attribute.label} (${ta.attribute.name}): ${ta.attribute.attrType}${ta.attribute.isRequired ? ' [필수]' : ''}`)
    })
    
    console.log(`\n속성 값 (data 필드 - JSON):`)
    if (fullObject?.data && typeof fullObject.data === 'object') {
      Object.entries(fullObject.data as Record<string, any>).forEach(([key, value], index) => {
        const displayValue = typeof value === 'object' ? JSON.stringify(value) : value
        console.log(`  ${index + 1}. ${key}: ${displayValue}`)
      })
    }
    
    console.log('\n==============================================')
    console.log('✅ EAV 패턴 (JSON 방식) 통합 테스트 완료!')
    console.log('==============================================\n')

    // ============================================
    // 7. 검증
    // ============================================
    expect(fullObject).toBeDefined()
    expect(fullObject?.type.name).toBe(createdType.name)
    expect(fullObject?.policy.id).toBe(createdPolicy.id)
    expect(fullObject?.type.typeAttributes).toHaveLength(8) // 8개 Attribute 정의
    expect(fullObject?.data).toBeDefined()

    // JSON data 필드 값 검증
    const data = fullObject?.data as Record<string, any>
    expect(data[`invoiceNumber_${attrTimestamp}`]).toBe('INV-2024-001')
    expect(data[`totalAmount_${attrTimestamp}`]).toBe(5000000)
    expect(data[`unitPrice_${attrTimestamp}`]).toBe(125000.50)
    expect(data[`isPaid_${attrTimestamp}`]).toBe(false)
    expect(data[`metadata_${attrTimestamp}`]).toHaveProperty('department', 'Sales')

    console.log('✅ 모든 검증 통과!\n')
  })

  it('State 전환을 테스트해야 함', async () => {
    console.log('\n📊 State 전환 테스트')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // Given: 첫 번째 테스트에서 생성된 객체 사용
    expect(businessObject).toBeDefined()
    console.log(`현재 State: ${businessObject.currentState}`)

    // When: State 전환 (Draft → Review)
    console.log('State 전환 중: Draft → Review')
    const updated = await prisma.businessObject.update({
      where: { id: businessObject.id },
      data: { currentState: 'Review' },
    })

    // Then: 검증
    console.log(`새 State: ${updated.currentState}`)
    expect(updated.currentState).toBe('Review')
    expect(updated.id).toBe(businessObject.id)
    
    console.log('✅ State 전환 성공!\n')
  })
})

