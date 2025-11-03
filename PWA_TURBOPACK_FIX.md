# Next.js 16 + Turbopack + PWA 설정

## 문제 해결 완료 ✅

Next.js 16에서 Turbopack이 기본으로 활성화되면서 next-pwa의 webpack 설정과 충돌하는 문제가 해결되었습니다.

## 적용된 해결책

### 1. 개발 환경에서 PWA 비활성화
```typescript
disable: process.env.NODE_ENV === "development"
```

**이유:**
- 개발 중에는 Service Worker가 캐싱으로 인해 변경사항이 즉시 반영되지 않을 수 있음
- PWA는 프로덕션 빌드에서만 필요
- 개발 속도 향상

### 2. Turbopack 설정 추가
```typescript
turbopack: {}
```

**이유:**
- Next.js 16의 경고 메시지 제거
- 명시적으로 Turbopack 사용 의사 표시

## 사용 방법

### 개발 환경 (PWA 비활성화)
```bash
npm run dev
```

- Service Worker 미생성
- 빠른 개발 환경
- Hot Reload 정상 작동

### 프로덕션 빌드 (PWA 활성화)
```bash
npm run build
npm start
```

- Service Worker 자동 생성 (`public/sw.js`)
- PWA 기능 완전 활성화
- 오프라인 지원, 캐싱 등

### 프로덕션 미리보기
```bash
# 빌드
npm run build

# 프로덕션 모드로 실행
npm start

# 또는
NODE_ENV=production npm run dev
```

## PWA 테스트

### 로컬에서 PWA 기능 테스트
```bash
# 1. 프로덕션 빌드
npm run build

# 2. 프로덕션 서버 실행
npm start

# 3. 브라우저에서 접속
# http://localhost:3000
```

### 체크리스트
- [ ] Chrome DevTools → Application → Manifest 확인
- [ ] Chrome DevTools → Application → Service Workers 확인
- [ ] 주소창 설치 버튼 표시 확인
- [ ] 오프라인 모드에서 동작 확인

## 대안 설정

### 옵션 1: 항상 PWA 활성화 (권장하지 않음)
```typescript
disable: false,
```

**문제점:**
- 개발 중 캐싱으로 인한 혼란
- Hot Reload 문제 가능성

### 옵션 2: webpack 강제 사용
```bash
npm run dev -- --webpack
```

**문제점:**
- Turbopack의 빠른 빌드 속도 이점 상실

### 옵션 3: Turbopack 비활성화 (package.json)
```json
{
  "scripts": {
    "dev": "next dev --webpack"
  }
}
```

## 현재 권장 설정 (적용됨)

✅ **개발:** Turbopack + PWA 비활성화
- 빠른 빌드
- 즉각적인 변경 반영
- 에러 없음

✅ **프로덕션:** webpack + PWA 활성화
- Service Worker 생성
- 완전한 PWA 기능
- 오프라인 지원

## 추가 팁

### Service Worker 강제 업데이트
프로덕션에서 Service Worker가 업데이트되지 않을 때:

```javascript
// 브라우저 콘솔에서 실행
navigator.serviceWorker.getRegistrations()
  .then(registrations => {
    registrations.forEach(registration => registration.unregister())
  })
  .then(() => location.reload())
```

### PWA 개발 모드 활성화
꼭 개발 중에 PWA를 테스트하려면:

```typescript
// next.config.ts
disable: false, // 모든 환경에서 활성화
```

그리고 터미널에서:
```bash
npm run dev -- --webpack
```

## 참고

- Next.js 16은 Turbopack이 기본
- next-pwa는 webpack 기반
- 두 가지를 함께 사용하려면 설정 필요
- 프로덕션에서는 webpack으로 자동 빌드됨

