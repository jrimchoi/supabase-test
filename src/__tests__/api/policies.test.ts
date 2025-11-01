// Policy API 테스트
import { prismaMock } from '../mocks/prisma'

// Prisma Mock 설정 (반드시 import 전에!)
jest.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))

import { GET, POST } from '@/app/api/policies/route'
import { GET as GET_BY_ID, PATCH, DELETE } from '@/app/api/policies/[id]/route'
import { createMockRequest, parseResponse, createMockParams } from '../helpers/api'

describe('Policy API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/policies', () => {
    it('모든 Policy 목록을 반환해야 함', async () => {
      // Given
      const mockPolicies = [
        {
          id: 'policy-1',
          name: '정책 1',
          description: '설명 1',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: null,
          updatedBy: null,
        },
        {
          id: 'policy-2',
          name: '정책 2',
          description: '설명 2',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: null,
          updatedBy: null,
        },
      ]

      prismaMock.policy.findMany.mockResolvedValue(mockPolicies)

      const request = createMockRequest({
        method: 'GET',
        url: '/api/policies',
      })

      // When
      const response = await GET(request)
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(2)
      expect(data.data[0].name).toBe('정책 1')
    })

    it('include=states 쿼리로 State를 포함해야 함', async () => {
      // Given
      const mockPoliciesWithStates = [
        {
          id: 'policy-1',
          name: '정책 1',
          description: '설명 1',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: null,
          updatedBy: null,
          states: [
            {
              id: 'state-1',
              policyId: 'policy-1',
              name: '작성중',
              description: null,
              order: 1,
              isInitial: true,
              isFinal: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        },
      ]

      prismaMock.policy.findMany.mockResolvedValue(mockPoliciesWithStates as any)

      const request = createMockRequest({
        method: 'GET',
        url: '/api/policies?include=states',
      })

      // When
      const response = await GET(request)
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data[0].states).toBeDefined()
      expect(data.data[0].states).toHaveLength(1)
    })
  })

  describe('POST /api/policies', () => {
    it('새로운 Policy를 생성해야 함', async () => {
      // Given
      const newPolicy = {
        name: '문서 결재 정책',
        description: '문서 결재 흐름 관리',
        isActive: true,
      }

      const createdPolicy = {
        id: 'policy-123',
        ...newPolicy,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: null,
        updatedBy: null,
      }

      prismaMock.policy.create.mockResolvedValue(createdPolicy)

      const request = createMockRequest({
        method: 'POST',
        url: '/api/policies',
        body: newPolicy,
      })

      // When
      const response = await POST(request)
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.id).toBe('policy-123')
      expect(data.data.name).toBe('문서 결재 정책')
    })

    it('name이 없으면 400 에러를 반환해야 함', async () => {
      // Given
      const request = createMockRequest({
        method: 'POST',
        url: '/api/policies',
        body: { description: '설명만 있음' },
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

  describe('GET /api/policies/:id', () => {
    it('특정 Policy를 반환해야 함', async () => {
      // Given
      const mockPolicy = {
        id: 'policy-123',
        name: '정책 1',
        description: '설명 1',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: null,
        updatedBy: null,
      }

      prismaMock.policy.findUnique.mockResolvedValue(mockPolicy)

      const request = createMockRequest({
        method: 'GET',
        url: '/api/policies/policy-123',
      })

      const params = createMockParams({ id: 'policy-123' })

      // When
      const response = await GET_BY_ID(request, { params })
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.id).toBe('policy-123')
    })

    it('존재하지 않는 Policy는 404를 반환해야 함', async () => {
      // Given
      prismaMock.policy.findUnique.mockResolvedValue(null)

      const request = createMockRequest({
        method: 'GET',
        url: '/api/policies/non-existent',
      })

      const params = createMockParams({ id: 'non-existent' })

      // When
      const response = await GET_BY_ID(request, { params })
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error).toContain('찾을 수 없습니다')
    })
  })

  describe('PATCH /api/policies/:id', () => {
    it('Policy를 수정해야 함', async () => {
      // Given
      const updatedPolicy = {
        id: 'policy-123',
        name: '수정된 정책',
        description: '수정된 설명',
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: null,
        updatedBy: 'user-123',
      }

      prismaMock.policy.update.mockResolvedValue(updatedPolicy)

      const request = createMockRequest({
        method: 'PATCH',
        url: '/api/policies/policy-123',
        body: {
          name: '수정된 정책',
          isActive: false,
        },
      })

      const params = createMockParams({ id: 'policy-123' })

      // When
      const response = await PATCH(request, { params })
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.name).toBe('수정된 정책')
      expect(data.data.isActive).toBe(false)
    })
  })

  describe('DELETE /api/policies/:id', () => {
    it('Policy를 삭제해야 함', async () => {
      // Given
      prismaMock.policy.delete.mockResolvedValue({
        id: 'policy-123',
        name: '정책 1',
        description: '설명 1',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: null,
        updatedBy: null,
      })

      const request = createMockRequest({
        method: 'DELETE',
        url: '/api/policies/policy-123',
      })

      const params = createMockParams({ id: 'policy-123' })

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

