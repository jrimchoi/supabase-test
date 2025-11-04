// Relationship API 테스트
import { prismaMock } from '../mocks/prisma'

// Prisma Mock 설정 (반드시 import 전에!)
jest.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))

import { GET, POST } from '@/app/api/relationships/route'
import { GET as GET_BY_ID, PATCH, DELETE } from '@/app/api/relationships/[id]/route'
import { createMockRequest, parseResponse, createMockParams } from '../helpers/api'

describe('Relationship API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/relationships', () => {
    it('모든 Relationship 목록을 반환해야 함', async () => {
      // Given
      const mockRelationships = [
        {
          id: 'rel-1',
          name: 'invoice_to_customer',
          description: '송장-고객 관계',
          fromTypeId: 'type-invoice',
          toTypeId: 'type-customer',
          cardinality: 'MANY_TO_ONE',
          isRequired: true,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          fromType: { id: 'type-invoice', name: 'Invoice', description: null },
          toType: { id: 'type-customer', name: 'Customer', description: null },
          relationshipAttributes: [],
        },
        {
          id: 'rel-2',
          name: 'order_has_items',
          description: '주문-품목 관계',
          fromTypeId: 'type-order',
          toTypeId: 'type-item',
          cardinality: 'ONE_TO_MANY',
          isRequired: false,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          fromType: { id: 'type-order', name: 'Order', description: null },
          toType: { id: 'type-item', name: 'Item', description: null },
          relationshipAttributes: [],
        },
      ]

      prismaMock.relationship.findMany.mockResolvedValue(mockRelationships as any)

      const request = createMockRequest({
        method: 'GET',
        url: '/api/relationships',
      })

      // When
      const response = await GET(request)
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(2)
      expect(data.data[0].name).toBe('invoice_to_customer')
      expect(data.data[0].cardinality).toBe('MANY_TO_ONE')
    })

    it('fromTypeId로 필터링해야 함', async () => {
      // Given
      const mockRelationships = [
        {
          id: 'rel-1',
          name: 'invoice_to_customer',
          fromTypeId: 'type-invoice',
          toTypeId: 'type-customer',
          cardinality: 'MANY_TO_ONE',
          createdAt: new Date(),
          fromType: { id: 'type-invoice', name: 'Invoice', description: null },
          toType: { id: 'type-customer', name: 'Customer', description: null },
          relationshipAttributes: [],
        },
      ]

      prismaMock.relationship.findMany.mockResolvedValue(mockRelationships as any)

      const request = createMockRequest({
        method: 'GET',
        url: '/api/relationships?fromTypeId=type-invoice',
      })

      // When
      const response = await GET(request)
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(200)
      expect(data.data[0].fromTypeId).toBe('type-invoice')
    })
  })

  describe('POST /api/relationships', () => {
    it('새로운 Relationship을 생성해야 함', async () => {
      // Given
      const newRelationship = {
        name: 'contract_to_vendor',
        description: '계약-공급업체 관계',
        fromTypeId: 'type-contract',
        toTypeId: 'type-vendor',
        cardinality: 'MANY_TO_ONE',
        isRequired: true,
      }

      const createdRelationship = {
        id: 'rel-123',
        ...newRelationship,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: null,
        updatedBy: null,
        fromType: { id: 'type-contract', name: 'Contract', description: null },
        toType: { id: 'type-vendor', name: 'Vendor', description: null },
      }

      prismaMock.relationship.create.mockResolvedValue(createdRelationship as any)

      const request = createMockRequest({
        method: 'POST',
        url: '/api/relationships',
        body: newRelationship,
      })

      // When
      const response = await POST(request)
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.name).toBe('contract_to_vendor')
      expect(data.data.cardinality).toBe('MANY_TO_ONE')
      expect(data.data.isRequired).toBe(true)
    })

    it('필수 필드가 없으면 400 에러를 반환해야 함', async () => {
      // Given
      const request = createMockRequest({
        method: 'POST',
        url: '/api/relationships',
        body: { name: 'test' }, // fromTypeId, toTypeId, cardinality 누락
      })

      // When
      const response = await POST(request)
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('필수')
    })

    it('잘못된 cardinality는 400 에러를 반환해야 함', async () => {
      // Given
      const request = createMockRequest({
        method: 'POST',
        url: '/api/relationships',
        body: {
          name: 'test',
          fromTypeId: 'type1',
          toTypeId: 'type2',
          cardinality: 'INVALID_TYPE',
        },
      })

      // When
      const response = await POST(request)
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('cardinality')
    })
  })

  describe('GET /api/relationships/:id', () => {
    it('특정 Relationship을 반환해야 함', async () => {
      // Given
      const mockRelationship = {
        id: 'rel-123',
        name: 'invoice_to_customer',
        description: '송장-고객 관계',
        fromTypeId: 'type-invoice',
        toTypeId: 'type-customer',
        cardinality: 'MANY_TO_ONE',
        isRequired: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: null,
        updatedBy: null,
        fromType: { id: 'type-invoice', name: 'Invoice', description: null },
        toType: { id: 'type-customer', name: 'Customer', description: null },
        relationshipAttributes: [],
        objectRelationships: [],
      }

      prismaMock.relationship.findUnique.mockResolvedValue(mockRelationship as any)

      const request = createMockRequest({
        method: 'GET',
        url: '/api/relationships/rel-123',
      })

      const params = createMockParams({ id: 'rel-123' })

      // When
      const response = await GET_BY_ID(request, { params })
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.name).toBe('invoice_to_customer')
      expect(data.data.cardinality).toBe('MANY_TO_ONE')
    })

    it('존재하지 않는 Relationship은 404를 반환해야 함', async () => {
      // Given
      prismaMock.relationship.findUnique.mockResolvedValue(null)

      const request = createMockRequest({
        method: 'GET',
        url: '/api/relationships/non-existent',
      })

      const params = createMockParams({ id: 'non-existent' })

      // When
      const response = await GET_BY_ID(request, { params })
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
    })
  })

  describe('PATCH /api/relationships/:id', () => {
    it('Relationship을 수정해야 함', async () => {
      // Given
      const updatedRelationship = {
        id: 'rel-123',
        name: 'updated_relationship',
        description: '수정된 관계',
        fromTypeId: 'type1',
        toTypeId: 'type2',
        cardinality: 'ONE_TO_MANY',
        isRequired: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: null,
        updatedBy: null,
        fromType: { id: 'type1', name: 'Type1', description: null },
        toType: { id: 'type2', name: 'Type2', description: null },
      }

      prismaMock.relationship.update.mockResolvedValue(updatedRelationship as any)

      const request = createMockRequest({
        method: 'PATCH',
        url: '/api/relationships/rel-123',
        body: { 
          name: 'updated_relationship',
          description: '수정된 관계',
          cardinality: 'ONE_TO_MANY',
        },
      })

      const params = createMockParams({ id: 'rel-123' })

      // When
      const response = await PATCH(request, { params })
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.name).toBe('updated_relationship')
      expect(data.data.cardinality).toBe('ONE_TO_MANY')
    })

    it('잘못된 cardinality는 400 에러를 반환해야 함', async () => {
      // Given
      const request = createMockRequest({
        method: 'PATCH',
        url: '/api/relationships/rel-123',
        body: { cardinality: 'INVALID' },
      })

      const params = createMockParams({ id: 'rel-123' })

      // When
      const response = await PATCH(request, { params })
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('cardinality')
    })
  })

  describe('DELETE /api/relationships/:id', () => {
    it('종속 데이터가 없으면 Relationship을 삭제해야 함', async () => {
      // Given
      prismaMock.businessObjectRelationship.count.mockResolvedValue(0)
      prismaMock.relationship.delete.mockResolvedValue({
        id: 'rel-123',
        name: 'invoice_to_customer',
        fromTypeId: 'type1',
        toTypeId: 'type2',
        cardinality: 'MANY_TO_ONE',
        createdAt: new Date(),
      } as any)

      const request = createMockRequest({
        method: 'DELETE',
        url: '/api/relationships/rel-123',
      })

      const params = createMockParams({ id: 'rel-123' })

      // When
      const response = await DELETE(request, { params })
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(prismaMock.businessObjectRelationship.count).toHaveBeenCalledWith({
        where: { relationshipId: 'rel-123' },
      })
    })

    it('종속 데이터가 있으면 400 에러를 반환해야 함', async () => {
      // Given
      prismaMock.businessObjectRelationship.count.mockResolvedValue(5)

      const request = createMockRequest({
        method: 'DELETE',
        url: '/api/relationships/rel-123',
      })

      const params = createMockParams({ id: 'rel-123' })

      // When
      const response = await DELETE(request, { params })
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('BusinessObjectRelationship')
      expect(prismaMock.relationship.delete).not.toHaveBeenCalled()
    })
  })
})

