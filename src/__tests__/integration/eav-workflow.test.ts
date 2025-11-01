// EAV 패턴 통합 테스트
// Schema V2: Type → Attribute → BusinessObject → BusinessAttribute

import { prisma } from '@/lib/prisma'

describe('EAV 패턴 통합 테스트', () => {
  let createdPolicy: any
  let createdType: any
  let createdAttributes: any[] = []
  let createdObjects: any[] = []

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
        version: 1,
        isActive: true,
      },
    })
    console.log(`   ✅ Policy: ${createdPolicy.name} (${createdPolicy.id})\n`)

    // ============================================
    // 2. Type 생성
    // ============================================
    console.log('2️⃣ Type 생성 중...')
    createdType = await prisma.type.create({
      data: {
        name: `Invoice_${Date.now()}`,
        policyId: createdPolicy.id,
      },
    })
    console.log(`   ✅ Type: ${createdType.name} (${createdType.id})\n`)

    // ============================================
    // 3. Attribute 정의 (속성 스키마)
    // ============================================
    console.log('3️⃣ Attribute 정의 중 (공통)...')
    const timestamp = Date.now()
    const attributeDefs = [
      { key: `invoiceNumber_${timestamp}`, label: '송장 번호', attrType: 'STRING', isRequired: true },
      { key: `customerName_${timestamp}`, label: '고객명', attrType: 'STRING', isRequired: true },
      { key: `totalAmount_${timestamp}`, label: '총 금액', attrType: 'INTEGER', isRequired: true },
      { key: `unitPrice_${timestamp}`, label: '단가', attrType: 'REAL', isRequired: false },
      { key: `issueDate_${timestamp}`, label: '발행일', attrType: 'DATE', isRequired: true },
      { key: `dueDate_${timestamp}`, label: '마감일', attrType: 'DATE', isRequired: false },
      { key: `isPaid_${timestamp}`, label: '결제 완료', attrType: 'BOOLEAN', isRequired: false },
      { key: `metadata_${timestamp}`, label: '메타데이터', attrType: 'JSON', isRequired: false },
    ]

    // Attribute 생성 (공통 속성, typeId 없음)
    for (const attrDef of attributeDefs) {
      const attr = await prisma.attribute.create({
        data: {
          key: attrDef.key,
          label: attrDef.label,
          attrType: attrDef.attrType as any,
          isRequired: attrDef.isRequired,
        },
      })
      createdAttributes.push(attr)
      console.log(`   ✅ ${attrDef.label} (${attrDef.key}): ${attrDef.attrType}${attrDef.isRequired ? ' [필수]' : ''}`)
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
    // 4. BusinessObject 생성
    // ============================================
    console.log('4️⃣ BusinessObject 생성 중...')
    const businessObject = await prisma.businessObject.create({
      data: {
        typeId: createdType.id,
        policyId: createdPolicy.id,
        currentState: 'Draft',
      },
    })
    createdObjects.push(businessObject)
    console.log(`   ✅ BusinessObject: ${businessObject.id}`)
    console.log(`   ✅ State: ${businessObject.currentState}\n`)

    // ============================================
    // 5. BusinessAttribute 값 설정 (EAV)
    // ============================================
    console.log('5️⃣ BusinessAttribute 값 설정 중 (EAV)...')
    const attributeValues = [
      { attributeKey: `invoiceNumber_${timestamp}`, valueString: 'INV-2024-001' },
      { attributeKey: `customerName_${timestamp}`, valueString: 'ABC 주식회사' },
      { attributeKey: `totalAmount_${timestamp}`, valueInteger: 5000000 },
      { attributeKey: `unitPrice_${timestamp}`, valueReal: 125000.50 },
      { attributeKey: `issueDate_${timestamp}`, valueDate: new Date('2024-01-01') },
      { attributeKey: `dueDate_${timestamp}`, valueDate: new Date('2024-12-31') },
      { attributeKey: `isPaid_${timestamp}`, valueBoolean: false },
      { attributeKey: `metadata_${timestamp}`, valueJson: { department: 'Sales', priority: 'high', tags: ['urgent', 'Q4'] } },
    ]

    for (const attrValue of attributeValues) {
      await prisma.businessAttribute.create({
        data: {
          objectId: businessObject.id,
          ...attrValue,
        },
      })
      
      const value = attrValue.valueString || attrValue.valueInteger || attrValue.valueReal || 
                    attrValue.valueDate || attrValue.valueBoolean || JSON.stringify(attrValue.valueJson)
      console.log(`   ✅ ${attrValue.attributeKey}: ${value}`)
    }
    console.log(`   총 ${attributeValues.length}개 속성 값 설정 완료\n`)

    // ============================================
    // 6. 완전한 객체 조회 및 검증
    // ============================================
    console.log('6️⃣ 완전한 객체 조회 중...\n')
    
    const fullObject = await prisma.businessObject.findUnique({
      where: { id: businessObject.id },
      include: {
        type: {
          include: {
            policy: true,
            typeAttributes: {
              include: {
                attribute: true,
              },
            },
          },
        },
        policy: true,
        attributes: true,
      },
    })

    console.log('==============================================')
    console.log('📋 조회 결과')
    console.log('==============================================\n')
    console.log(`BusinessObject ID: ${fullObject?.id}`)
    console.log(`Type: ${fullObject?.type.name}`)
    console.log(`Policy: ${fullObject?.policy.name} v${fullObject?.policy.version}`)
    console.log(`Current State: ${fullObject?.currentState}`)
    console.log(`\n속성 정의 (Attribute Schema):`)
    fullObject?.type.typeAttributes.forEach((ta, index) => {
      console.log(`  ${index + 1}. ${ta.attribute.label} (${ta.attribute.key}): ${ta.attribute.attrType}${ta.attribute.isRequired ? ' [필수]' : ''}`)
    })
    
    console.log(`\n속성 값 (BusinessAttribute - EAV):`)
    fullObject?.attributes.forEach((attr, index) => {
      const value = attr.valueString || attr.valueInteger || attr.valueReal || 
                    attr.valueDate?.toISOString() || attr.valueBoolean || 
                    JSON.stringify(attr.valueJson)
      console.log(`  ${index + 1}. ${attr.attributeKey}: ${value}`)
    })
    
    console.log('\n==============================================')
    console.log('✅ EAV 패턴 통합 테스트 완료!')
    console.log('==============================================\n')

    // ============================================
    // 7. 검증
    // ============================================
    expect(fullObject).toBeDefined()
    expect(fullObject?.type.name).toBe(createdType.name)
    expect(fullObject?.policy.id).toBe(createdPolicy.id)
    expect(fullObject?.type.typeAttributes).toHaveLength(8) // 8개 Attribute 정의
    expect(fullObject?.attributes).toHaveLength(8) // 8개 실제 값

    // 각 타입별 값 검증
    const invoiceNumber = fullObject?.attributes.find(a => a.attributeKey === `invoiceNumber_${timestamp}`)
    expect(invoiceNumber?.valueString).toBe('INV-2024-001')

    const totalAmount = fullObject?.attributes.find(a => a.attributeKey === `totalAmount_${timestamp}`)
    expect(totalAmount?.valueInteger).toBe(5000000)

    const unitPrice = fullObject?.attributes.find(a => a.attributeKey === `unitPrice_${timestamp}`)
    expect(unitPrice?.valueReal).toBe(125000.50)

    const isPaid = fullObject?.attributes.find(a => a.attributeKey === `isPaid_${timestamp}`)
    expect(isPaid?.valueBoolean).toBe(false)

    const metadata = fullObject?.attributes.find(a => a.attributeKey === `metadata_${timestamp}`)
    expect(metadata?.valueJson).toHaveProperty('department', 'Sales')

    console.log('✅ 모든 검증 통과!\n')
  })

  it('State 전환을 테스트해야 함', async () => {
    console.log('\n📊 State 전환 테스트')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // Given: 객체가 이미 생성되어 있음
    const currentObject = createdObjects[0]
    console.log(`현재 State: ${currentObject.currentState}`)

    // When: State 전환 (Draft → Review)
    console.log('State 전환 중: Draft → Review')
    const updated = await prisma.businessObject.update({
      where: { id: currentObject.id },
      data: { currentState: 'Review' },
    })

    // Then: 검증
    console.log(`새 State: ${updated.currentState}`)
    expect(updated.currentState).toBe('Review')
    expect(updated.id).toBe(currentObject.id)
    
    console.log('✅ State 전환 성공!\n')
  })
})

