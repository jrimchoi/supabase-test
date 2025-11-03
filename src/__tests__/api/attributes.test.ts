// Attribute API 테스트 (속성 정의/스키마)
import { prismaMock } from '../mocks/prisma'

// Prisma Mock 설정 (반드시 import 전에!)
jest.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))

import { GET, POST } from '@/app/api/attributes/route'
import { GET as GET_BY_ID, PATCH, DELETE } from '@/app/api/attributes/[id]/route'
import { createMockRequest, parseResponse, createMockParams } from '../helpers/api'

describe('Attribute API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/attributes', () => {
    it('모든 공통 Attribute 목록을 반환해야 함', async () => {
      // Given
      const mockAttributes = [
        {
          id: 'attr-1',
          name: 'amount',
          label: '금액',
          attrType: 'INTEGER',
          isRequired: true,
          defaultValue: null,
          validation: null,
          createdAt: new Date(),
        },
        {
          id: 'attr-2',
          name: 'dueDate',
          label: '마감일',
          attrType: 'DATE',
          isRequired: false,
          defaultValue: null,
          validation: null,
          createdAt: new Date(),
        },
      ]

      prismaMock.attribute.findMany.mockResolvedValue(mockAttributes as any)

      const request = createMockRequest({
        method: 'GET',
        url: '/api/attributes',
      })

      // When
      const response = await GET(request)
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(2)
      expect(data.data[0].name).toBe('amount')
    })

    it('typeId로 필터링해야 함 (TypeAttribute 사용)', async () => {
      // Given
      const mockTypeAttributes = [
        {
          id: 'ta-1',
          typeId: 'type-123',
          attributeId: 'attr-1',
          createdAt: new Date(),
          attribute: {
            id: 'attr-1',
            name: 'title',
            label: '제목',
            attrType: 'STRING',
            isRequired: true,
            defaultValue: null,
            validation: null,
            createdAt: new Date(),
          },
        },
      ]

      prismaMock.typeAttribute.findMany.mockResolvedValue(mockTypeAttributes as any)

      const request = createMockRequest({
        method: 'GET',
        url: '/api/attributes?typeId=type-123',
      })

      // When
      const response = await GET(request)
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(200)
      expect(data.data[0].name).toBe('title')
    })
  })

  describe('POST /api/attributes', () => {
    it('새로운 공통 Attribute를 생성해야 함', async () => {
      // Given
      const newAttribute = {
        name: 'amount',
        label: '금액',
        attrType: 'INTEGER',
        isRequired: true,
      }

      const createdAttribute = {
        id: 'attr-123',
        ...newAttribute,
        defaultValue: null,
        validation: null,
        createdAt: new Date(),
      }

      prismaMock.attribute.create.mockResolvedValue(createdAttribute as any)

      const request = createMockRequest({
        method: 'POST',
        url: '/api/attributes',
        body: newAttribute,
      })

      // When
      const response = await POST(request)
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.name).toBe('amount')
      expect(data.data.attrType).toBe('INTEGER')
    })

    it('필수 필드가 없으면 400 에러를 반환해야 함', async () => {
      // Given
      const request = createMockRequest({
        method: 'POST',
        url: '/api/attributes',
        body: { name: 'amount' }, // label, attrType 누락
      })

      // When
      const response = await POST(request)
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('잘못된 attrType이면 400 에러를 반환해야 함', async () => {
      // Given
      const request = createMockRequest({
        method: 'POST',
        url: '/api/attributes',
        body: {
          name: 'test',
          label: '테스트',
          attrType: 'INVALID',
        },
      })

      // When
      const response = await POST(request)
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })

  describe('PATCH /api/attributes/:id', () => {
    it('Attribute를 수정해야 함', async () => {
      // Given
      const updatedAttribute = {
        id: 'attr-123',
        name: 'amount',
        label: '총 금액',
        attrType: 'REAL',
        isRequired: true,
        defaultValue: null,
        validation: null,
        createdAt: new Date(),
      }

      prismaMock.attribute.update.mockResolvedValue(updatedAttribute as any)

      const request = createMockRequest({
        method: 'PATCH',
        url: '/api/attributes/attr-123',
        body: { label: '총 금액', attrType: 'REAL' },
      })

      const params = createMockParams({ id: 'attr-123' })

      // When
      const response = await PATCH(request, { params })
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.label).toBe('총 금액')
    })
  })

  describe('DELETE /api/attributes/:id', () => {
    it('Attribute를 삭제해야 함', async () => {
      // Given
      prismaMock.attribute.delete.mockResolvedValue({
        id: 'attr-123',
        name: 'amount',
        label: '금액',
        attrType: 'INTEGER',
        isRequired: false,
        defaultValue: null,
        validation: null,
        createdAt: new Date(),
      } as any)

      const request = createMockRequest({
        method: 'DELETE',
        url: '/api/attributes/attr-123',
      })

      const params = createMockParams({ id: 'attr-123' })

      // When
      const response = await DELETE(request, { params })
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })
})

