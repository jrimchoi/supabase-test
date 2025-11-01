// BusinessObject API 테스트 (V2 - EAV 패턴)
import { prismaMock } from '../mocks/prisma'

// Prisma Mock 설정 (반드시 import 전에!)
jest.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))

import { GET, POST } from '@/app/api/business-objects/route'
import { GET as GET_BY_ID, PATCH, DELETE } from '@/app/api/business-objects/[id]/route'
import { createMockRequest, parseResponse, createMockParams } from '../helpers/api'

describe('BusinessObject API (V2)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/business-objects', () => {
    it('모든 BusinessObject 목록을 반환해야 함', async () => {
      // Given
      const mockObjects = [
        {
          id: 'obj-1',
          typeId: 'type-1',
          policyId: 'policy-1',
          currentState: 'Draft',
          data: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'obj-2',
          typeId: 'type-1',
          policyId: 'policy-1',
          currentState: 'Review',
          data: { note: 'test' },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      prismaMock.businessObject.findMany.mockResolvedValue(mockObjects as any)

      const request = createMockRequest({
        method: 'GET',
        url: '/api/business-objects',
      })

      // When
      const response = await GET(request)
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(2)
      expect(data.data[0].currentState).toBe('Draft')
    })

    it('typeId로 필터링해야 함', async () => {
      // Given
      const mockObjects = [
        {
          id: 'obj-1',
          typeId: 'type-123',
          policyId: 'policy-1',
          currentState: 'Draft',
          data: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      prismaMock.businessObject.findMany.mockResolvedValue(mockObjects as any)

      const request = createMockRequest({
        method: 'GET',
        url: '/api/business-objects?typeId=type-123',
      })

      // When
      const response = await GET(request)
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(200)
      expect(data.data[0].typeId).toBe('type-123')
    })

    it('currentState로 필터링해야 함', async () => {
      // Given
      const mockObjects = [
        {
          id: 'obj-1',
          typeId: 'type-1',
          policyId: 'policy-1',
          currentState: 'Approved',
          data: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      prismaMock.businessObject.findMany.mockResolvedValue(mockObjects as any)

      const request = createMockRequest({
        method: 'GET',
        url: '/api/business-objects?currentState=Approved',
      })

      // When
      const response = await GET(request)
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(200)
      expect(data.data[0].currentState).toBe('Approved')
    })
  })

  describe('POST /api/business-objects', () => {
    it('새로운 BusinessObject를 생성해야 함', async () => {
      // Given
      const newObject = {
        typeId: 'type-1',
        policyId: 'policy-1',
        currentState: 'Draft',
        data: { note: 'Initial draft' },
      }

      const createdObject = {
        id: 'obj-123',
        ...newObject,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      prismaMock.businessObject.create.mockResolvedValue(createdObject as any)

      const request = createMockRequest({
        method: 'POST',
        url: '/api/business-objects',
        body: newObject,
      })

      // When
      const response = await POST(request)
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.typeId).toBe('type-1')
      expect(data.data.currentState).toBe('Draft')
    })

    it('필수 필드가 없으면 400 에러를 반환해야 함', async () => {
      // Given
      const request = createMockRequest({
        method: 'POST',
        url: '/api/business-objects',
        body: { typeId: 'type-1' }, // policyId, currentState 누락
      })

      // When
      const response = await POST(request)
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })

  describe('PATCH /api/business-objects/:id', () => {
    it('BusinessObject를 수정해야 함 (State 전환)', async () => {
      // Given
      const updatedObject = {
        id: 'obj-123',
        typeId: 'type-1',
        policyId: 'policy-1',
        currentState: 'Approved',
        data: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      prismaMock.businessObject.update.mockResolvedValue(updatedObject as any)

      const request = createMockRequest({
        method: 'PATCH',
        url: '/api/business-objects/obj-123',
        body: { currentState: 'Approved' },
      })

      const params = createMockParams({ id: 'obj-123' })

      // When
      const response = await PATCH(request, { params })
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.currentState).toBe('Approved')
    })
  })

  describe('DELETE /api/business-objects/:id', () => {
    it('BusinessObject를 삭제해야 함', async () => {
      // Given
      prismaMock.businessObject.delete.mockResolvedValue({
        id: 'obj-123',
        typeId: 'type-1',
        policyId: 'policy-1',
        currentState: 'Draft',
        data: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any)

      const request = createMockRequest({
        method: 'DELETE',
        url: '/api/business-objects/obj-123',
      })

      const params = createMockParams({ id: 'obj-123' })

      // When
      const response = await DELETE(request, { params })
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })
})

