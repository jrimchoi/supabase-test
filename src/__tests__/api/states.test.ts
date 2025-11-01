// State API 테스트
import { prismaMock } from '../mocks/prisma'

// Prisma Mock 설정 (반드시 import 전에!)
jest.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))

import { GET, POST } from '@/app/api/states/route'
import { PATCH, DELETE } from '@/app/api/states/[id]/route'
import { createMockRequest, parseResponse, createMockParams } from '../helpers/api'

describe('State API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/states', () => {
    it('모든 State 목록을 반환해야 함', async () => {
      // Given
      const mockStates = [
        {
          id: 'state-1',
          policyId: 'policy-1',
          name: '작성중',
          description: '문서 작성 단계',
          order: 1,
          isInitial: true,
          isFinal: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'state-2',
          policyId: 'policy-1',
          name: '검토중',
          description: '문서 검토 단계',
          order: 2,
          isInitial: false,
          isFinal: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      prismaMock.state.findMany.mockResolvedValue(mockStates)

      const request = createMockRequest({
        method: 'GET',
        url: '/api/states',
      })

      // When
      const response = await GET(request)
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(2)
      expect(data.data[0].order).toBe(1)
    })

    it('policyId로 필터링해야 함', async () => {
      // Given
      const mockStates = [
        {
          id: 'state-1',
          policyId: 'policy-123',
          name: '작성중',
          description: null,
          order: 1,
          isInitial: true,
          isFinal: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      prismaMock.state.findMany.mockResolvedValue(mockStates)

      const request = createMockRequest({
        method: 'GET',
        url: '/api/states?policyId=policy-123',
      })

      // When
      const response = await GET(request)
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data[0].policyId).toBe('policy-123')
    })
  })

  describe('POST /api/states', () => {
    it('새로운 State를 생성해야 함', async () => {
      // Given
      const newState = {
        policyId: 'policy-123',
        name: '작성중',
        description: '문서 작성 단계',
        order: 1,
        isInitial: true,
        isFinal: false,
      }

      const createdState = {
        id: 'state-456',
        policyId: 'policy-123',
        name: '작성중',
        description: '문서 작성 단계',
        order: 1,
        isInitial: true,
        isFinal: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      prismaMock.state.create.mockResolvedValue(createdState)

      const request = createMockRequest({
        method: 'POST',
        url: '/api/states',
        body: newState,
      })

      // When
      const response = await POST(request)
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.id).toBe('state-456')
      expect(data.data.name).toBe('작성중')
    })

    it('policyId, name, order가 없으면 400 에러를 반환해야 함', async () => {
      // Given
      const request = createMockRequest({
        method: 'POST',
        url: '/api/states',
        body: { name: '작성중' }, // policyId, order 누락
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

  describe('PATCH /api/states/:id', () => {
    it('State를 수정해야 함', async () => {
      // Given
      const updatedState = {
        id: 'state-123',
        policyId: 'policy-123',
        name: '승인완료',
        description: '최종 승인',
        order: 3,
        isInitial: false,
        isFinal: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      prismaMock.state.update.mockResolvedValue(updatedState)

      const request = createMockRequest({
        method: 'PATCH',
        url: '/api/states/state-123',
        body: {
          name: '승인완료',
          isFinal: true,
        },
      })

      const params = createMockParams({ id: 'state-123' })

      // When
      const response = await PATCH(request, { params })
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.name).toBe('승인완료')
      expect(data.data.isFinal).toBe(true)
    })
  })

  describe('DELETE /api/states/:id', () => {
    it('State를 삭제해야 함', async () => {
      // Given
      prismaMock.state.delete.mockResolvedValue({
        id: 'state-123',
        policyId: 'policy-123',
        name: '작성중',
        description: null,
        order: 1,
        isInitial: true,
        isFinal: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const request = createMockRequest({
        method: 'DELETE',
        url: '/api/states/state-123',
      })

      const params = createMockParams({ id: 'state-123' })

      // When
      const response = await DELETE(request, { params })
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toContain('삭제')
    })
  })
})

