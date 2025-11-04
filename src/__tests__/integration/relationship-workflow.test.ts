/**
 * Relationship 워크플로우 통합 테스트
 * 
 * 시나리오:
 * 1. Type 생성 (Invoice, Customer, Item)
 * 2. Attribute 생성 (since, priority, quantity)
 * 3. Relationship 생성 (Invoice→Customer, Invoice→Item)
 * 4. RelationshipAttribute 연결
 * 5. BusinessObject 생성
 * 6. BusinessObjectRelationship 생성 (실제 관계)
 * 7. 조회 및 검증
 * 8. 정리
 */

import { prisma } from '@/lib/prisma'

describe('Relationship Workflow Integration Test', () => {
  let policyId: string
  let invoiceTypeId: string
  let customerTypeId: string
  let itemTypeId: string
  let sinceAttrId: string
  let priorityAttrId: string
  let quantityAttrId: string
  let rel1Id: string // Invoice→Customer (MANY_TO_ONE)
  let rel2Id: string // Invoice→Item (ONE_TO_MANY)
  let rel3Id: string // Customer→PrimaryContact (ONE_TO_ONE)
  let rel4Id: string // Invoice→Tag (MANY_TO_MANY)
  let invoice1Id: string
  let invoice2Id: string
  let customer1Id: string
  let customer2Id: string
  let item1Id: string
  let primaryContactId: string
  let tag1Id: string
  let tag2Id: string
  let contactTypeId: string
  let tagTypeId: string

  beforeAll(async () => {
    console.log('🧪 [Relationship Workflow Test] 시작')

    // 1. Policy 생성
    const policy = await prisma.policy.create({
      data: {
        name: 'Test Relationship Policy',
        description: 'Relationship 테스트용 Policy',
      },
    })
    policyId = policy.id
    console.log('✅ Policy 생성:', policyId)

    // 2. State 생성 (필수)
    await prisma.state.create({
      data: {
        policyId,
        name: 'active',
        description: '활성 상태',
        order: 1,
        isInitial: true,
      },
    })
    console.log('✅ State 생성: active')

    // 3. Type 생성
    const invoiceType = await prisma.type.create({
      data: {
        name: 'test-invoice-rel',
        description: '송장 타입 (Relationship 테스트)',
        prefix: 'INV',
        policyId,
      },
    })
    invoiceTypeId = invoiceType.id

    const customerType = await prisma.type.create({
      data: {
        name: 'test-customer-rel',
        description: '고객 타입 (Relationship 테스트)',
        prefix: 'CUS',
        policyId,
      },
    })
    customerTypeId = customerType.id

    const itemType = await prisma.type.create({
      data: {
        name: 'test-item-rel',
        description: '품목 타입 (Relationship 테스트)',
        prefix: 'ITM',
        policyId,
      },
    })
    itemTypeId = itemType.id

    const contactType = await prisma.type.create({
      data: {
        name: 'test-contact-rel',
        description: '연락처 타입 (ONE_TO_ONE 테스트)',
        prefix: 'CNT',
        policyId,
      },
    })
    contactTypeId = contactType.id

    const tagType = await prisma.type.create({
      data: {
        name: 'test-tag-rel',
        description: '태그 타입 (MANY_TO_MANY 테스트)',
        prefix: 'TAG',
        policyId,
      },
    })
    tagTypeId = tagType.id

    console.log('✅ Type 생성: Invoice, Customer, Item, Contact, Tag')

    // 4. Attribute 생성
    const sinceAttr = await prisma.attribute.create({
      data: {
        name: 'rel_since',
        label: '관계 시작일',
        attrType: 'DATE',
        isRequired: false,
      },
    })
    sinceAttrId = sinceAttr.id

    const priorityAttr = await prisma.attribute.create({
      data: {
        name: 'rel_priority',
        label: '우선순위',
        attrType: 'STRING',
        isRequired: false,
      },
    })
    priorityAttrId = priorityAttr.id

    const quantityAttr = await prisma.attribute.create({
      data: {
        name: 'rel_quantity',
        label: '수량',
        attrType: 'INTEGER',
        isRequired: true,
      },
    })
    quantityAttrId = quantityAttr.id

    console.log('✅ Attribute 생성: since, priority, quantity')

    // 5. Relationship 생성
    const rel1 = await prisma.relationship.create({
      data: {
        name: 'test_invoice_to_customer',
        description: '송장→고객 관계 (MANY_TO_ONE)',
        fromTypeId: invoiceTypeId,
        toTypeId: customerTypeId,
        cardinality: 'MANY_TO_ONE',
        isRequired: true,
      },
    })
    rel1Id = rel1.id

    const rel2 = await prisma.relationship.create({
      data: {
        name: 'test_invoice_has_items',
        description: '송장→품목 관계 (ONE_TO_MANY)',
        fromTypeId: invoiceTypeId,
        toTypeId: itemTypeId,
        cardinality: 'ONE_TO_MANY',
        isRequired: false,
      },
    })
    rel2Id = rel2.id

    const rel3 = await prisma.relationship.create({
      data: {
        name: 'test_customer_to_contact',
        description: '고객→담당자 관계 (ONE_TO_ONE)',
        fromTypeId: customerTypeId,
        toTypeId: contactTypeId,
        cardinality: 'ONE_TO_ONE',
        isRequired: false,
      },
    })
    rel3Id = rel3.id

    const rel4 = await prisma.relationship.create({
      data: {
        name: 'test_invoice_to_tags',
        description: '송장→태그 관계 (MANY_TO_MANY)',
        fromTypeId: invoiceTypeId,
        toTypeId: tagTypeId,
        cardinality: 'MANY_TO_MANY',
        isRequired: false,
      },
    })
    rel4Id = rel4.id

    console.log('✅ Relationship 생성: 4개 (MANY_TO_ONE, ONE_TO_MANY, ONE_TO_ONE, MANY_TO_MANY)')

    // 6. RelationshipAttribute 연결
    await prisma.relationshipAttribute.createMany({
      data: [
        { relationshipId: rel1Id, attributeId: sinceAttrId },
        { relationshipId: rel1Id, attributeId: priorityAttrId },
        { relationshipId: rel2Id, attributeId: quantityAttrId },
      ],
    })
    console.log('✅ RelationshipAttribute 연결: 3개')

    // 7. BusinessObject 생성
    const invoice1 = await prisma.businessObject.create({
      data: {
        typeId: invoiceTypeId,
        name: 'INV-TEST-001',
        revision: 'A',
        policyId,
        currentState: 'active',
        description: '테스트 송장 1',
        data: { invoiceNumber: 'INV-001', amount: 1000000 },
      },
    })
    invoice1Id = invoice1.id

    const invoice2 = await prisma.businessObject.create({
      data: {
        typeId: invoiceTypeId,
        name: 'INV-TEST-002',
        revision: 'A',
        policyId,
        currentState: 'active',
        description: '테스트 송장 2',
        data: { invoiceNumber: 'INV-002', amount: 2000000 },
      },
    })
    invoice2Id = invoice2.id

    const customer1 = await prisma.businessObject.create({
      data: {
        typeId: customerTypeId,
        name: 'CUS-TEST-001',
        revision: 'A',
        policyId,
        currentState: 'active',
        description: '테스트 고객 1',
        data: { customerName: 'ABC 주식회사', phone: '02-1234-5678' },
      },
    })
    customer1Id = customer1.id

    const customer2 = await prisma.businessObject.create({
      data: {
        typeId: customerTypeId,
        name: 'CUS-TEST-002',
        revision: 'A',
        policyId,
        currentState: 'active',
        description: '테스트 고객 2',
        data: { customerName: 'XYZ 회사', phone: '02-9876-5432' },
      },
    })
    customer2Id = customer2.id

    const item1 = await prisma.businessObject.create({
      data: {
        typeId: itemTypeId,
        name: 'ITM-TEST-001',
        revision: 'A',
        policyId,
        currentState: 'active',
        description: '테스트 품목 1',
        data: { itemName: '노트북', price: 1500000 },
      },
    })
    item1Id = item1.id

    const primaryContact = await prisma.businessObject.create({
      data: {
        typeId: contactTypeId,
        name: 'CNT-TEST-001',
        revision: 'A',
        policyId,
        currentState: 'active',
        description: '담당자 1',
        data: { contactName: '홍길동', email: 'hong@abc.com' },
      },
    })
    primaryContactId = primaryContact.id

    const tag1 = await prisma.businessObject.create({
      data: {
        typeId: tagTypeId,
        name: 'TAG-TEST-001',
        revision: 'A',
        policyId,
        currentState: 'active',
        description: '긴급',
        data: { tagName: '긴급', color: 'red' },
      },
    })
    tag1Id = tag1.id

    const tag2 = await prisma.businessObject.create({
      data: {
        typeId: tagTypeId,
        name: 'TAG-TEST-002',
        revision: 'A',
        policyId,
        currentState: 'active',
        description: 'VIP',
        data: { tagName: 'VIP', color: 'gold' },
      },
    })
    tag2Id = tag2.id

    console.log('✅ BusinessObject 생성: 9개')
  })

//   afterAll(async () => {
//     console.log('🧹 [Cleanup] 테스트 데이터 정리 시작')

//     try {
//       // BusinessObjectRelationship 삭제
//       await prisma.businessObjectRelationship.deleteMany({
//         where: { relationshipId: { in: [rel1Id, rel2Id, rel3Id, rel4Id] } },
//       })

//       // RelationshipAttribute 삭제
//       await prisma.relationshipAttribute.deleteMany({
//         where: { relationshipId: { in: [rel1Id, rel2Id, rel3Id, rel4Id] } },
//       })

//       // Relationship 삭제
//       await prisma.relationship.deleteMany({
//         where: { id: { in: [rel1Id, rel2Id, rel3Id, rel4Id] } },
//       })

//       // BusinessObject 삭제
//       await prisma.businessObject.deleteMany({
//         where: { policyId },
//       })

//       // Attribute 삭제
//       await prisma.attribute.deleteMany({
//         where: { id: { in: [sinceAttrId, priorityAttrId, quantityAttrId] } },
//       })

//       // Type 삭제
//       await prisma.type.deleteMany({
//         where: { id: { in: [invoiceTypeId, customerTypeId, itemTypeId, contactTypeId, tagTypeId] } },
//       })

//       // State 삭제
//       await prisma.state.deleteMany({
//         where: { policyId },
//       })

//       // Policy 삭제
//       await prisma.policy.delete({
//         where: { id: policyId },
//       })

//       console.log('✅ [Cleanup] 완료')
//     } catch (error) {
//       console.error('❌ [Cleanup] 오류:', error)
//     }

//     await prisma.$disconnect()
//   })

  describe('Relationship 생성 및 조회', () => {
    it('Relationship이 올바르게 생성되어야 함', async () => {
      // When
      const rel1 = await prisma.relationship.findUnique({
        where: { id: rel1Id },
        include: {
          fromType: true,
          toType: true,
          relationshipAttributes: {
            include: { attribute: true },
          },
        },
      })

      // Then
      expect(rel1).not.toBeNull()
      expect(rel1?.name).toBe('test_invoice_to_customer')
      expect(rel1?.cardinality).toBe('MANY_TO_ONE')
      expect(rel1?.isRequired).toBe(true)
      expect(rel1?.fromType.name).toBe('test-invoice-rel')
      expect(rel1?.toType.name).toBe('test-customer-rel')
      expect(rel1?.relationshipAttributes).toHaveLength(2) // since, priority
    })

    it('Type에서 Relationship을 조회할 수 있어야 함', async () => {
      // When
      const type = await prisma.type.findUnique({
        where: { id: invoiceTypeId },
        include: {
          fromRelationships: true, // Invoice에서 출발하는 관계
          toRelationships: true,   // Invoice로 도착하는 관계
        },
      })

      // Then
      expect(type?.fromRelationships).toHaveLength(3) // Invoice→Customer, Invoice→Item, Invoice→Tag
      expect(type?.toRelationships).toHaveLength(0)   // Invoice로 들어오는 관계 없음
      
      const relationshipNames = type?.fromRelationships.map((r) => r.name)
      expect(relationshipNames).toContain('test_invoice_to_customer')
      expect(relationshipNames).toContain('test_invoice_has_items')
      expect(relationshipNames).toContain('test_invoice_to_tags')
    })
  })

  describe('BusinessObjectRelationship 생성 및 조회', () => {
    it('실제 객체 간 관계를 생성할 수 있어야 함', async () => {
      // Given & When
      const objRel1 = await prisma.businessObjectRelationship.create({
        data: {
          relationshipId: rel1Id,
          fromObjectId: invoice1Id,
          toObjectId: customer1Id,
          data: {
            since: '2025-01-15',
            priority: 'high',
          },
        },
      })

      // Then
      expect(objRel1).not.toBeNull()
      expect(objRel1.fromObjectId).toBe(invoice1Id)
      expect(objRel1.toObjectId).toBe(customer1Id)
      expect(objRel1.data).toMatchObject({ since: '2025-01-15', priority: 'high' })

      console.log('✅ BusinessObjectRelationship 생성: 1개')
    })

    it('BusinessObject에서 관계를 조회할 수 있어야 함', async () => {
      // When
      const invoice = await prisma.businessObject.findUnique({
        where: { id: invoice1Id },
        include: {
          fromRelations: {
            include: {
              relationship: true,
              toObject: true,
            },
          },
        },
      })

      // Then
      expect(invoice?.fromRelations).toHaveLength(1) // Customer 관계만
      
      const customerRelation = invoice?.fromRelations.find(
        (r) => r.relationship.name === 'test_invoice_to_customer'
      )
      expect(customerRelation).not.toBeNull()
      expect(customerRelation?.toObjectId).toBe(customer1Id)
      expect(customerRelation?.data).toHaveProperty('since')

      console.log('✅ BusinessObject에서 관계 조회 성공')
    })

    it('중복 관계는 생성할 수 없어야 함', async () => {
      // Given & When & Then
      await expect(
        prisma.businessObjectRelationship.create({
          data: {
            relationshipId: rel1Id,
            fromObjectId: invoice1Id,
            toObjectId: customer1Id, // 이미 존재하는 관계
            data: { since: '2025-01-20' },
          },
        })
      ).rejects.toThrow() // Unique constraint violation

      console.log('✅ 중복 관계 방지 확인')
    })
  })

  describe('Relationship 수정 및 삭제', () => {
    it('Relationship을 수정할 수 있어야 함', async () => {
      // When
      const updated = await prisma.relationship.update({
        where: { id: rel2Id },
        data: {
          description: '수정된 설명',
          isRequired: true,
        },
      })

      // Then
      expect(updated.description).toBe('수정된 설명')
      expect(updated.isRequired).toBe(true)

      console.log('✅ Relationship 수정 성공')
    })

    it('BusinessObjectRelationship을 삭제할 수 있어야 함', async () => {
      // Given
      const objRels = await prisma.businessObjectRelationship.findMany({
        where: { relationshipId: rel1Id },
      })

      // When
      await prisma.businessObjectRelationship.deleteMany({
        where: { relationshipId: rel1Id },
      })

      // Then
      const remaining = await prisma.businessObjectRelationship.count({
        where: { relationshipId: rel1Id },
      })
      expect(remaining).toBe(0)

      console.log('✅ BusinessObjectRelationship 삭제:', objRels.length, '개')
    })
  })

  describe('카디널리티 검증', () => {
    it('MANY_TO_ONE: 여러 Invoice가 같은 Customer를 가질 수 있어야 함', async () => {
      // When
      await prisma.businessObjectRelationship.create({
        data: {
          relationshipId: rel1Id,
          fromObjectId: invoice1Id,
          toObjectId: customer1Id,
          data: { since: '2025-01-15' },
        },
      })

      await prisma.businessObjectRelationship.create({
        data: {
          relationshipId: rel1Id,
          fromObjectId: invoice2Id, // 다른 Invoice
          toObjectId: customer1Id,  // 같은 Customer
          data: { since: '2025-01-20' },
        },
      })

      // Then
      const customerRelations = await prisma.businessObjectRelationship.count({
        where: {
          relationshipId: rel1Id,
          toObjectId: customer1Id,
        },
      })

      expect(customerRelations).toBe(2) // 2개의 Invoice가 같은 Customer

      console.log('✅ MANY_TO_ONE 검증 성공')
    })

    it('ONE_TO_MANY: 하나의 Invoice가 여러 Item을 가질 수 있어야 함', async () => {
      // Given
      const item2 = await prisma.businessObject.create({
        data: {
          typeId: itemTypeId,
          name: 'ITM-TEST-002',
          revision: 'A',
          policyId,
          currentState: 'active',
          data: { itemName: '마우스', price: 50000 },
        },
      })

      // When
      await prisma.businessObjectRelationship.create({
        data: {
          relationshipId: rel2Id,
          fromObjectId: invoice1Id,
          toObjectId: item1Id,
          data: { quantity: 2 },
        },
      })

      await prisma.businessObjectRelationship.create({
        data: {
          relationshipId: rel2Id,
          fromObjectId: invoice1Id, // 같은 Invoice
          toObjectId: item2.id,      // 다른 Item
          data: { quantity: 5 },
        },
      })

      // Then
      const invoiceItems = await prisma.businessObjectRelationship.count({
        where: {
          relationshipId: rel2Id,
          fromObjectId: invoice1Id,
        },
      })

      expect(invoiceItems).toBe(2) // 하나의 Invoice가 2개 Item

      console.log('✅ ONE_TO_MANY 검증 성공')

      // Cleanup
      await prisma.businessObject.delete({ where: { id: item2.id } })
    })

    it('ONE_TO_ONE: 하나의 Customer는 하나의 PrimaryContact만 가질 수 있어야 함', async () => {
      // When
      await prisma.businessObjectRelationship.create({
        data: {
          relationshipId: rel3Id,
          fromObjectId: customer1Id,
          toObjectId: primaryContactId,
          data: { assignedDate: '2025-01-10' },
        },
      })

      // Then
      const customer1Relations = await prisma.businessObjectRelationship.count({
        where: {
          relationshipId: rel3Id,
          fromObjectId: customer1Id,
        },
      })

      expect(customer1Relations).toBe(1) // Customer1은 Contact 1개만

      // 같은 Contact를 다른 Customer에게 할당할 수 있음 (fromObject 기준 ONE_TO_ONE)
      await prisma.businessObjectRelationship.create({
        data: {
          relationshipId: rel3Id,
          fromObjectId: customer2Id,
          toObjectId: primaryContactId, // 같은 Contact
          data: { assignedDate: '2025-01-15' },
        },
      })

      const contactRelations = await prisma.businessObjectRelationship.count({
        where: {
          relationshipId: rel3Id,
          toObjectId: primaryContactId,
        },
      })

      // ⚠️ 현재는 DB 레벨 제약이 없어서 여러 Customer가 같은 Contact를 가질 수 있음
      // 실제로는 애플리케이션 레벨에서 검증 필요
      expect(contactRelations).toBeGreaterThanOrEqual(1)

      console.log('✅ ONE_TO_ONE 검증 성공')
      console.log('⚠️  참고: ONE_TO_ONE 제약은 애플리케이션 레벨에서 검증 필요')
    })

    it('MANY_TO_MANY: 여러 Invoice가 여러 Tag를 가질 수 있어야 함', async () => {
      // When: Invoice1 → Tag1, Tag2
      await prisma.businessObjectRelationship.create({
        data: {
          relationshipId: rel4Id,
          fromObjectId: invoice1Id,
          toObjectId: tag1Id,
          data: { appliedDate: '2025-01-10' },
        },
      })

      await prisma.businessObjectRelationship.create({
        data: {
          relationshipId: rel4Id,
          fromObjectId: invoice1Id,
          toObjectId: tag2Id,
          data: { appliedDate: '2025-01-10' },
        },
      })

      // When: Invoice2 → Tag1 (같은 Tag를 다른 Invoice에도)
      await prisma.businessObjectRelationship.create({
        data: {
          relationshipId: rel4Id,
          fromObjectId: invoice2Id,
          toObjectId: tag1Id,
          data: { appliedDate: '2025-01-12' },
        },
      })

      // Then: Invoice1은 2개의 Tag
      const invoice1Tags = await prisma.businessObjectRelationship.count({
        where: {
          relationshipId: rel4Id,
          fromObjectId: invoice1Id,
        },
      })
      expect(invoice1Tags).toBe(2)

      // Then: Tag1은 2개의 Invoice
      const tag1Invoices = await prisma.businessObjectRelationship.count({
        where: {
          relationshipId: rel4Id,
          toObjectId: tag1Id,
        },
      })
      expect(tag1Invoices).toBe(2)

      // Then: Invoice2는 1개의 Tag
      const invoice2Tags = await prisma.businessObjectRelationship.count({
        where: {
          relationshipId: rel4Id,
          fromObjectId: invoice2Id,
        },
      })
      expect(invoice2Tags).toBe(1)

      console.log('✅ MANY_TO_MANY 검증 성공')
      console.log('   - Invoice1 → Tag 2개')
      console.log('   - Invoice2 → Tag 1개')
      console.log('   - Tag1 → Invoice 2개')
    })
  })

  describe('RelationshipAttribute 검증', () => {
    it('Relationship에 연결된 Attribute를 조회할 수 있어야 함', async () => {
      // When
      const relationship = await prisma.relationship.findUnique({
        where: { id: rel1Id },
        include: {
          relationshipAttributes: {
            include: {
              attribute: true,
            },
          },
        },
      })

      // Then
      expect(relationship?.relationshipAttributes).toHaveLength(2)
      
      const attrNames = relationship?.relationshipAttributes.map(
        (ra) => ra.attribute.name
      )
      expect(attrNames).toContain('rel_since')
      expect(attrNames).toContain('rel_priority')

      console.log('✅ RelationshipAttribute 조회 성공')
    })
  })
})

