# PWA (Progressive Web App) 설정 완료 ✅

Next.js 프로젝트에 PWA 기능이 성공적으로 추가되었습니다!

## 📦 설치된 패키지

- `@ducanh2912/next-pwa` - Next.js PWA 플러그인
- `workbox-window` - Service Worker 관리

## 📁 추가된 파일

### 1. 설정 파일
- `next.config.ts` - PWA 설정 추가
- `public/manifest.json` - 웹 앱 매니페스트

### 2. 아이콘 관련
- `public/icons/icon.svg` - SVG 아이콘 (임시)
- `public/icons/ICON_GUIDE.md` - 아이콘 생성 가이드
- `scripts/generate-pwa-icons.js` - 아이콘 생성 스크립트

### 3. 메타데이터
- `src/app/layout.tsx` - PWA 메타 태그 추가

### 4. Git 설정
- `.gitignore` - Service Worker 파일 무시

## 🚀 사용 방법

### 1. 개발 서버 실행 (PWA 비활성화)
```bash
npm run dev
```

**참고:** 개발 환경에서는 PWA가 자동으로 비활성화됩니다.
- Service Worker 미생성
- 빠른 Hot Reload
- Turbopack 사용

### 2. 프로덕션 빌드 (PWA 활성화)
```bash
npm run build
npm start
```

프로덕션 빌드 시 자동으로 Service Worker가 생성됩니다:
- `public/sw.js`
- `public/workbox-*.js`

### 3. PWA 설치 테스트

**⚠️ 중요:** PWA 기능은 프로덕션 빌드에서만 활성화됩니다!

```bash
# 프로덕션 빌드 및 실행
npm run build
npm start
```

#### Chrome/Edge
1. 프로덕션 서버 실행 (`npm start`)
2. Chrome DevTools 열기 (F12)
3. **Application** 탭 → **Manifest** 확인
4. **Service Workers** 확인
5. 주소창 오른쪽 **설치** 버튼 클릭

#### 모바일 (Android)
1. Chrome에서 앱 접속
2. 메뉴 → **홈 화면에 추가**

#### 모바일 (iOS)
1. Safari에서 앱 접속
2. 공유 버튼 → **홈 화면에 추가**

## ⚠️ 아이콘 생성 필요

현재 임시 SVG 아이콘만 있습니다. 실제 PNG 아이콘을 생성하세요:

### 방법 1: 온라인 도구 (권장)
1. https://www.pwabuilder.com/imageGenerator
2. 512x512 PNG 이미지 업로드
3. 생성된 아이콘을 `public/icons/` 폴더에 복사

### 방법 2: 스크립트 사용
```bash
# 1. sharp 패키지 설치
npm install --save-dev sharp

# 2. 512x512 PNG 파일 준비
# public/icon-512.png 파일 생성

# 3. 스크립트 수정 후 실행
node scripts/generate-pwa-icons.js
```

필요한 아이콘 크기:
- 72x72, 96x96, 128x128, 144x144
- 152x152, 192x192, 384x384, 512x512

## 🎨 커스터마이징

### manifest.json 수정
```json
{
  "name": "앱 전체 이름",
  "short_name": "앱 짧은 이름",
  "description": "앱 설명",
  "theme_color": "#18181b",
  "background_color": "#ffffff"
}
```

### PWA 설정 변경 (next.config.ts)
```typescript
const withPWA = withPWAInit({
  dest: "public",
  disable: false, // 개발 중 비활성화하려면 true
  // ... 기타 옵션
});
```

## 🔍 PWA 기능

### ✅ 현재 활성화된 기능
- **오프라인 지원** - 캐싱으로 오프라인에서도 동작
- **설치 가능** - 홈 화면에 추가 가능
- **빠른 로딩** - Service Worker 캐싱
- **자동 업데이트** - 새 버전 자동 감지
- **반응형** - 모바일/데스크톱 모두 지원

### 🎯 주요 설정
- **cacheOnFrontEndNav**: 클라이언트 라우팅 캐싱
- **aggressiveFrontEndNavCaching**: 적극적 캐싱
- **reloadOnOnline**: 온라인 복귀 시 새로고침

## 📊 PWA 점수 확인

### Chrome Lighthouse
1. Chrome DevTools 열기
2. **Lighthouse** 탭
3. **Progressive Web App** 체크
4. **Analyze page load** 클릭

목표: 90점 이상

## 🐛 트러블슈팅

### Turbopack 에러 (해결됨)
```
ERROR: This build is using Turbopack, with a `webpack` config
```

**해결책:** 이미 적용됨
- 개발 환경에서 PWA 비활성화
- `turbopack: {}` 설정 추가
- 프로덕션에서만 PWA 활성화

### Service Worker가 등록되지 않음
**원인:** 개발 환경에서 실행 중

```bash
# 프로덕션 빌드 후 실행
npm run build
npm start
```

### 아이콘이 표시되지 않음
- `public/icons/` 폴더에 PNG 파일 확인
- manifest.json의 경로 확인
- 브라우저 캐시 삭제 후 재시도

### 개발 중에도 PWA 활성화하기
현재는 개발 환경에서 PWA가 비활성화되어 있습니다.

**방법 1: 설정 변경 (권장하지 않음)**
```typescript
// next.config.ts
disable: false, // 항상 활성화
```

**방법 2: webpack 모드로 실행**
```bash
npm run dev -- --webpack
```

**참고:** 개발 중 PWA를 활성화하면 캐싱으로 인해 변경사항이 즉시 반영되지 않을 수 있습니다.

## 📚 참고 자료

- [Next PWA 문서](https://ducanh-next-pwa.vercel.app/)
- [Web.dev PWA](https://web.dev/progressive-web-apps/)
- [MDN PWA](https://developer.mozilla.org/ko/docs/Web/Progressive_web_apps)

## ✨ 프로덕션 배포

### Vercel
자동으로 PWA가 활성화됩니다.

### 다른 호스팅
1. `npm run build` 실행
2. `public/` 폴더의 Service Worker 파일 확인
3. HTTPS 필수 (PWA 요구사항)

## 🎉 완료!

이제 앱을 설치 가능한 PWA로 사용할 수 있습니다.
아이콘만 추가하면 모든 준비가 완료됩니다!

