const nextJest = require('next/jest')

const createJestConfig = nextJest({
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
  testTimeout: 30000, // 통합 테스트는 더 긴 타임아웃
}

module.exports = createJestConfig(customJestConfig)

