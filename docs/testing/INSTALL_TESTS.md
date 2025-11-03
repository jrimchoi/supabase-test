# 🧪 테스트 환경 설치 가이드

## ⚠️ npm 캐시 권한 문제 해결

### 1단계: npm 캐시 권한 수정

```bash
# 터미널에서 실행
sudo chown -R $(whoami) "/Users/jrchoi/.npm"
```

---

## 📦 테스트 의존성 설치

### 2단계: 의존성 설치

```bash
# API 테스트용 패키지 설치
npm install --save-dev @testing-library/jest-dom @types/jest jest jest-environment-node jest-mock-extended

# 또는 강제 설치 (권장하지 않음)
npm install --save-dev @testing-library/jest-dom @types/jest jest jest-environment-node jest-mock-extended --legacy-peer-deps
```

---

## ✅ 설치 확인

```bash
# Jest 버전 확인
npx jest --version

# 테스트 실행
npm test
```

---

## 🎯 설치 후 실행 순서

### 1. 테스트 실행

```bash
# 모든 테스트 실행
npm test

# Watch 모드
npm run test:watch

# 커버리지 확인
npm run test:coverage
```

### 2. 예상 결과

```
PASS  src/__tests__/api/policies.test.ts
  Policy API
    GET /api/policies
      ✓ 모든 Policy 목록을 반환해야 함
      ✓ include=states 쿼리로 State를 포함해야 함
    POST /api/policies
      ✓ 새로운 Policy를 생성해야 함
      ✓ name이 없으면 400 에러를 반환해야 함

Test Suites: 3 passed, 3 total
Tests:       24 passed, 24 total
Time:        2.456s
```

---

## 🔧 문제 해결

### 문제 1: "Cannot find module '@/lib/prisma'"

**원인**: TypeScript path mapping 문제

**해결**:
```bash
# tsconfig.json 확인
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}

# jest.config.js 확인
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
}
```

### 문제 2: "jest: command not found"

**원인**: Jest가 설치되지 않음

**해결**:
```bash
npm install --save-dev jest @types/jest
```

### 문제 3: React 19 버전 충돌

**해결**: API 테스트는 React 컴포넌트를 테스트하지 않으므로 `@testing-library/react`를 제거했습니다.

---

## 📝 참고사항

### API 테스트 vs React 컴포넌트 테스트

**현재 구성**: API Route 테스트만 포함
- ✅ Jest + jest-mock-extended (Prisma Mock)
- ✅ Node 환경 (`testEnvironment: 'node'`)
- ❌ React Testing Library (불필요)
- ❌ jsdom (불필요)

**React 컴포넌트 테스트 추가 시**:
```bash
# React 19 지원 버전 출시 후
npm install --save-dev @testing-library/react@next
```

---

## 🚀 빠른 시작

```bash
# 1. 권한 수정
sudo chown -R $(whoami) "/Users/jrchoi/.npm"

# 2. 패키지 설치
npm install

# 3. 테스트 실행
npm test
```

---

## 📚 관련 문서

- **테스트 가이드**: `TEST_GUIDE.md`
- **API 문서**: `API_GUIDE.md`
- **Postman 가이드**: `postman/README.md`

