// API 테스트 헬퍼 함수
import { NextRequest } from 'next/server'

/**
 * NextRequest Mock 생성
 */
export function createMockRequest(options: {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  url: string
  body?: any
  headers?: Record<string, string>
}): NextRequest {
  const { method, url, body, headers = {} } = options

  const init: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  }

  if (body) {
    init.body = JSON.stringify(body)
  }

  return new NextRequest(new URL(url, 'http://localhost:3000'), init as any)
}

/**
 * 응답 JSON 파싱
 */
export async function parseResponse(response: Response) {
  const text = await response.text()
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

/**
 * Mock Params 생성 (Next.js 15+)
 */
export function createMockParams<T extends Record<string, string>>(
  params: T
): Promise<T> {
  return Promise.resolve(params)
}

