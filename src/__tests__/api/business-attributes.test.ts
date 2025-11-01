// BusinessAttribute API 테스트 (EAV 패턴 - 실제 속성 값)
import { prismaMock } from '../mocks/prisma'

// Prisma Mock 설정 (반드시 import 전에!)
jest.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))

import { GET, POST } from '@/app/api/business-attributes/route'
import { GET as GET_BY_ID, PATCH, DELETE } from '@/app/api/business-attributes/[id]/route'
import { createMockRequest, parseResponse, createMockParams } from '../helpers/api'

describe('BusinessAttribute API (EAV)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/business-attributes', () => {
    it('모든 BusinessAttribute 목록을 반환해야 함', async () => {
      // Given
      const mockAttributes = [
        {
          id: 'ba-1',
          objectId: 'obj-1',
          attributeKey: 'title',
          valueString: '공급 계약서',
          valueInteger: null,
          valueReal: null,
          valueDate: null,
          valueBoolean: null,
          valueJson: null,
        },
        {
          id: 'ba-2',
          objectId: 'obj-1',
          attributeKey: 'amount',
          valueString: null,
          valueInteger: 1000000,
          valueReal: null,
          valueDate: null,
          valueBoolean: null,
          valueJson: null,
        },
      ]

      prismaMock.businessAttribute.findMany.mockResolvedValue(mockAttributes as any)

      const request = createMockRequest({
        method: 'GET',
        url: '/api/business-attributes',
      })

      // When
      const response = await GET(request)
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(2)
      expect(data.data[0].valueString).toBe('공급 계약서')
      expect(data.data[1].valueInteger).toBe(1000000)
    })

    it('objectId로 필터링해야 함', async () => {
      // Given
      const mockAttributes = [
        {
          id: 'ba-1',
          objectId: 'obj-123',
          attributeKey: 'title',
          valueString: '계약서',
          valueInteger: null,
          valueReal: null,
          valueDate: null,
          valueBoolean: null,
          valueJson: null,
        },
      ]

      prismaMock.businessAttribute.findMany.mockResolvedValue(mockAttributes as any)

      const request = createMockRequest({
        method: 'GET',
        url: '/api/business-attributes?objectId=obj-123',
      })

      // When
      const response = await GET(request)
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(200)
      expect(data.data[0].objectId).toBe('obj-123')
    })
  })

  describe('POST /api/business-attributes', () => {
    it('STRING 타입 속성을 생성해야 함', async () => {
      // Given
      const newAttribute = {
        objectId: 'obj-1',
        attributeKey: 'title',
        valueString: '공급 계약서',
      }

      const createdAttribute = {
        id: 'ba-123',
        ...newAttribute,
        valueInteger: null,
        valueReal: null,
        valueDate: null,
        valueBoolean: null,
        valueJson: null,
      }

      prismaMock.businessAttribute.create.mockResolvedValue(createdAttribute as any)

      const request = createMockRequest({
        method: 'POST',
        url: '/api/business-attributes',
        body: newAttribute,
      })

      // When
      const response = await POST(request)
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.valueString).toBe('공급 계약서')
    })

    it('INTEGER 타입 속성을 생성해야 함', async () => {
      // Given
      const newAttribute = {
        objectId: 'obj-1',
        attributeKey: 'amount',
        valueInteger: 1000000,
      }

      const createdAttribute = {
        id: 'ba-124',
        ...newAttribute,
        valueString: null,
        valueReal: null,
        valueDate: null,
        valueBoolean: null,
        valueJson: null,
      }

      prismaMock.businessAttribute.create.mockResolvedValue(createdAttribute as any)

      const request = createMockRequest({
        method: 'POST',
        url: '/api/business-attributes',
        body: newAttribute,
      })

      // When
      const response = await POST(request)
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.valueInteger).toBe(1000000)
    })

    it('JSON 타입 속성을 생성해야 함', async () => {
      // Given
      const metadata = { tags: ['urgent', 'contract'], priority: 1 }
      const newAttribute = {
        objectId: 'obj-1',
        attributeKey: 'metadata',
        valueJson: metadata,
      }

      const createdAttribute = {
        id: 'ba-125',
        ...newAttribute,
        valueString: null,
        valueInteger: null,
        valueReal: null,
        valueDate: null,
        valueBoolean: null,
      }

      prismaMock.businessAttribute.create.mockResolvedValue(createdAttribute as any)

      const request = createMockRequest({
        method: 'POST',
        url: '/api/business-attributes',
        body: newAttribute,
      })

      // When
      const response = await POST(request)
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.valueJson).toEqual(metadata)
    })

    it('objectId, attributeKey가 없으면 400 에러를 반환해야 함', async () => {
      // Given
      const request = createMockRequest({
        method: 'POST',
        url: '/api/business-attributes',
        body: { valueString: 'test' }, // objectId, attributeKey 누락
      })

      // When
      const response = await POST(request)
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('value가 없으면 400 에러를 반환해야 함', async () => {
      // Given
      const request = createMockRequest({
        method: 'POST',
        url: '/api/business-attributes',
        body: {
          objectId: 'obj-1',
          attributeKey: 'test',
          // value 없음
        },
      })

      // When
      const response = await POST(request)
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('value')
    })
  })

  describe('PATCH /api/business-attributes/:id', () => {
    it('BusinessAttribute 값을 수정해야 함', async () => {
      // Given
      const updatedAttribute = {
        id: 'ba-123',
        objectId: 'obj-1',
        attributeKey: 'amount',
        valueString: null,
        valueInteger: 2000000,
        valueReal: null,
        valueDate: null,
        valueBoolean: null,
        valueJson: null,
      }

      prismaMock.businessAttribute.update.mockResolvedValue(updatedAttribute as any)

      const request = createMockRequest({
        method: 'PATCH',
        url: '/api/business-attributes/ba-123',
        body: { valueInteger: 2000000 },
      })

      const params = createMockParams({ id: 'ba-123' })

      // When
      const response = await PATCH(request, { params })
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.valueInteger).toBe(2000000)
    })
  })

  describe('DELETE /api/business-attributes/:id', () => {
    it('BusinessAttribute를 삭제해야 함', async () => {
      // Given
      prismaMock.businessAttribute.delete.mockResolvedValue({
        id: 'ba-123',
        objectId: 'obj-1',
        attributeKey: 'title',
        valueString: '계약서',
        valueInteger: null,
        valueReal: null,
        valueDate: null,
        valueBoolean: null,
        valueJson: null,
      } as any)

      const request = createMockRequest({
        method: 'DELETE',
        url: '/api/business-attributes/ba-123',
      })

      const params = createMockParams({ id: 'ba-123' })

      // When
      const response = await DELETE(request, { params })
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })
})

