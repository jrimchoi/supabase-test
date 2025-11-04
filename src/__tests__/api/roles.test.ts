// Role API 테스트
import { prismaMock } from '../mocks/prisma'

// Prisma Mock 설정 (반드시 import 전에!)
jest.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))

import { GET, POST } from '@/app/api/roles/route'
import { PATCH, DELETE } from '@/app/api/roles/[id]/route'
import { createMockRequest, parseResponse, createMockParams } from '../helpers/api'

describe('Role API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/roles', () => {
    it('모든 Role 목록을 반환해야 함', async () => {
      // Given
      const mockRoles = [
        {
          id: 'role-1',
          name: 'Manager',
          description: '관리자',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'role-2',
          name: 'Developer',
          description: '개발자',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      prismaMock.role.findMany.mockResolvedValue(mockRoles)

      const request = createMockRequest({
        method: 'GET',
        url: '/api/roles',
      })

      // When
      const response = await GET(request)
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(2)
      expect(data.data[0].name).toBe('Manager')
    })
  })

  describe('POST /api/roles', () => {
    it('새로운 Role을 생성해야 함', async () => {
      // Given
      const newRole = {
        name: 'Admin',
        description: '시스템 관리자',
        isActive: true,
      }

      const createdRole = {
        id: 'role-123',
        ...newRole,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      prismaMock.role.create.mockResolvedValue(createdRole)

      const request = createMockRequest({
        method: 'POST',
        url: '/api/roles',
        body: newRole,
      })

      // When
      const response = await POST(request)
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.name).toBe('Admin')
    })

    it('name이 없으면 400 에러를 반환해야 함', async () => {
      // Given
      const request = createMockRequest({
        method: 'POST',
        url: '/api/roles',
        body: { description: '설명만 있음' },
      })

      // When
      const response = await POST(request)
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })

  describe('PATCH /api/roles/:id', () => {
    it('Role을 수정해야 함', async () => {
      // Given
      const updatedRole = {
        id: 'role-123',
        name: 'Super Admin',
        description: '슈퍼 관리자',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      prismaMock.role.update.mockResolvedValue(updatedRole)

      const request = createMockRequest({
        method: 'PATCH',
        url: '/api/roles/role-123',
        body: { name: 'Super Admin' },
      })

      const params = createMockParams({ id: 'role-123' })

      // When
      const response = await PATCH(request, { params })
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.name).toBe('Super Admin')
    })
  })

  describe('DELETE /api/roles/:id', () => {
    it('Role을 삭제해야 함', async () => {
      // Given
      prismaMock.role.delete.mockResolvedValue({
        id: 'role-123',
        name: 'Manager',
        description: '관리자',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const request = createMockRequest({
        method: 'DELETE',
        url: '/api/roles/role-123',
      })

      const params = createMockParams({ id: 'role-123' })

      // When
      const response = await DELETE(request, { params })
      const data = await parseResponse(response)

      // Then
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })
})

