const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // next.config.js와 .env 파일이 있는 Next.js 앱의 경로
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.integration.setup.js'],
  testEnvironment: 'jest-environment-node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '**/__tests__/integration/**/*.test.ts',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
  ],
  // 순차 실행 (안정성 우선)
  // 병렬 실행 시 DB 연결 경쟁으로 타임아웃 발생 가능
  maxWorkers: 1,
  // 타임아웃 설정
  testTimeout: 30000,
  // 상세 로그 비활성화 (속도 향상)
  verbose: false,
}

module.exports = createJestConfig(customJestConfig)
