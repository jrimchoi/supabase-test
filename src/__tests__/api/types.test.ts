// Type API 테스트
import { prismaMock } from '../mocks/prisma'

// Prisma Mock 설정 (반드시 import 전에!)
jest.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))

import { GET, POST } from '@/app/api/types/route'
import { GET as GET_BY_ID, PATCH, DELETE } from '@/app/api/types/[id]/route'
import { createMockRequest, parseResponse, createMockParams } from '../helpers/api'

describe('Type API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/types', () => {
    it('모든 Type 목록을 반환해야 함', async () => {
      // Given
      const mockTypes = [
        {
          id: 'type-1',
          name: 'Invoice',
          policyId: 'policy-1',
          createdAt: new Date(),
        },
        {
          id: 'type-2',
          name: 'Contract',
          policyId: 'policy-1',
          createdAt: new Date(),
        },
      ]

      prismaMock.type.findMany.mockResolvedValue(mockTypes as any)

      const request = createMockRequest({
        method: 'GET',
        url: '/api/types',
      })

      // When
      const response = await GET(request)
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(2)
      expect(data.data[0].name).toBe('Invoice')
    })

    it('policyId로 필터링해야 함', async () => {
      // Given
      const mockTypes = [
        {
          id: 'type-1',
          name: 'Invoice',
          policyId: 'policy-123',
          createdAt: new Date(),
        },
      ]

      prismaMock.type.findMany.mockResolvedValue(mockTypes as any)

      const request = createMockRequest({
        method: 'GET',
        url: '/api/types?policyId=policy-123',
      })

      // When
      const response = await GET(request)
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(200)
      expect(data.data[0].policyId).toBe('policy-123')
    })
  })

  describe('POST /api/types', () => {
    it('새로운 Type을 생성해야 함', async () => {
      // Given
      const newType = {
        type: 'purchase-order',
        name: 'Purchase Order',
        prefix: 'PO',
        policyId: 'policy-123',
      }

      const createdType = {
        id: 'type-456',
        ...newType,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      prismaMock.type.create.mockResolvedValue(createdType as any)

      const request = createMockRequest({
        method: 'POST',
        url: '/api/types',
        body: newType,
      })

      // When
      const response = await POST(request)
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.type).toBe('purchase-order')
      expect(data.data.name).toBe('Purchase Order')
      expect(data.data.policyId).toBe('policy-123')
    })

    it('type, policyId가 없으면 400 에러를 반환해야 함', async () => {
      // Given
      const request = createMockRequest({
        method: 'POST',
        url: '/api/types',
        body: { name: 'Invoice' }, // type, policyId 누락
      })

      // When
      const response = await POST(request)
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('필수')
    })
  })

  describe('GET /api/types/:id', () => {
    it('특정 Type을 반환해야 함', async () => {
      // Given
      const mockType = {
        id: 'type-123',
        name: 'Invoice',
        policyId: 'policy-1',
        createdAt: new Date(),
      }

      prismaMock.type.findUnique.mockResolvedValue(mockType as any)

      const request = createMockRequest({
        method: 'GET',
        url: '/api/types/type-123',
      })

      const params = createMockParams({ id: 'type-123' })

      // When
      const response = await GET_BY_ID(request, { params })
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.name).toBe('Invoice')
    })

    it('존재하지 않는 Type은 404를 반환해야 함', async () => {
      // Given
      prismaMock.type.findUnique.mockResolvedValue(null)

      const request = createMockRequest({
        method: 'GET',
        url: '/api/types/non-existent',
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

  describe('PATCH /api/types/:id', () => {
    it('Type을 수정해야 함', async () => {
      // Given
      const updatedType = {
        id: 'type-123',
        name: 'Updated Invoice',
        policyId: 'policy-2',
        createdAt: new Date(),
      }

      prismaMock.type.update.mockResolvedValue(updatedType as any)

      const request = createMockRequest({
        method: 'PATCH',
        url: '/api/types/type-123',
        body: { name: 'Updated Invoice', policyId: 'policy-2' },
      })

      const params = createMockParams({ id: 'type-123' })

      // When
      const response = await PATCH(request, { params })
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.name).toBe('Updated Invoice')
    })
  })

  describe('DELETE /api/types/:id', () => {
    it('Type을 삭제해야 함', async () => {
      // Given
      prismaMock.type.delete.mockResolvedValue({
        id: 'type-123',
        name: 'Invoice',
        policyId: 'policy-1',
        createdAt: new Date(),
      } as any)

      const request = createMockRequest({
        method: 'DELETE',
        url: '/api/types/type-123',
      })

      const params = createMockParams({ id: 'type-123' })

      // When
      const response = await DELETE(request, { params })
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })
})

