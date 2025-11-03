# PWA 설치 가이드 (Vercel 배포 앱)

## 📱 PWA란?

Progressive Web App - 웹사이트를 **앱처럼 설치**하여 사용할 수 있는 기술

**장점:**
- 📱 홈 화면에 아이콘 추가
- ⚡ 빠른 실행
- 🔌 오프라인 지원 (일부)
- 📊 네이티브 앱처럼 사용

---

## 🖥️ 데스크톱에서 설치 (Chrome/Edge)

### 1. Vercel 앱 접속
```
https://supabase-test-r6mfhneg6-jrimchoi1s-projects.vercel.app
```

### 2. 주소창 확인

**설치 가능한 경우:**
- 주소창 오른쪽에 **설치 아이콘** (컴퓨터 모니터 + 화살표) 표시
- 또는 주소창 끝에 **+ 아이콘**

### 3. 설치 버튼 클릭

**Chrome:**
- 주소창 오른쪽 **설치** 아이콘 클릭
- 또는 메뉴(⋮) → "Install Policy Manager..."

**Edge:**
- 주소창 오른쪽 **앱 설치** 아이콘
- 또는 메뉴(...) → "앱" → "이 사이트를 앱으로 설치"

### 4. 설치 확인 다이얼로그

```
앱 설치
Policy Manager를(을) 설치하시겠습니까?

[설치]  [취소]
```

**"설치"** 버튼 클릭

### 5. 완료!

- 새 창으로 앱 실행됨
- macOS: Dock, Launchpad, Applications에 아이콘 추가
- Windows: 시작 메뉴, 바탕화면

---

## 📱 모바일에서 설치

### Android (Chrome)

#### 1. Chrome에서 앱 접속
```
https://supabase-test-r6mfhneg6-jrimchoi1s-projects.vercel.app
```

#### 2. 메뉴 열기
- 화면 우측 상단 **⋮** (점 3개)

#### 3. "홈 화면에 추가" 선택
- "앱 설치" 또는
- "홈 화면에 추가"

#### 4. 이름 확인
```
Policy Manager
```

#### 5. "추가" 버튼 클릭

#### 6. 완료!
- 홈 화면에 아이콘 생성됨
- 탭하면 전체 화면 앱으로 실행

---

### iOS/iPadOS (Safari)

#### 1. Safari에서 앱 접속
```
https://supabase-test-r6mfhneg6-jrimchoi1s-projects.vercel.app
```

#### 2. 공유 버튼
- 하단 중앙 **공유** 아이콘 (상자 + 화살표)

#### 3. "홈 화면에 추가"
- 스크롤해서 찾기
- "홈 화면에 추가" 탭

#### 4. 이름 확인 & 추가
```
Policy Manager
```
- **추가** 버튼 클릭

#### 5. 완료!
- 홈 화면에 아이콘 생성
- Safari 툴바 없이 전체 화면 실행

---

## 🔍 PWA 설치 가능 확인 방법

### Chrome DevTools (F12):

#### 1. Application 탭
- F12 → **Application** 탭

#### 2. Manifest 확인
- 왼쪽 메뉴 → **Manifest**
- 정보 확인:
  ```json
  {
    "name": "Supabase Auth + Next.js - Policy Management System",
    "short_name": "Policy Manager",
    "start_url": "/",
    "display": "standalone"
  }
  ```

#### 3. Service Worker 확인
- 왼쪽 메뉴 → **Service Workers**
- Status: **activated and running** ✅

#### 4. Install 가능 여부
- 상단에 "Installability" 확인
- ✅ "Page is installable"

---

## 🐛 설치 버튼이 안 보이는 경우

### 원인 1: 개발 환경에서 실행 중

**현재 설정:**
```typescript
disable: process.env.NODE_ENV === "development"
```

**해결:**
- Vercel 프로덕션 앱에서만 설치 가능
- 로컬 개발 서버(`npm run dev`)에서는 설치 불가

---

### 원인 2: HTTPS 필요

**PWA 요구사항:**
- ✅ HTTPS 필수 (또는 localhost)
- ✅ Vercel은 자동으로 HTTPS 제공

---

### 원인 3: 아이콘 누락

**현재 상태:**
- ⚠️ 임시 SVG 아이콘만 있음
- PNG 아이콘 필요 (선택사항)

**해결:**
- 설치는 가능하지만 아이콘이 기본 이미지로 표시
- 나중에 PNG 아이콘 추가 가능 (선택)

---

### 원인 4: Service Worker 미생성

**확인:**
```
https://your-app.vercel.app/sw.js
```

**404 에러 시:**
- Vercel이 제대로 빌드 안 됨
- 재배포 필요 (캐시 없이!)

---

## 🎨 아이콘 개선 (선택사항)

### 현재:
- 임시 SVG 아이콘 사용
- 설치는 가능하지만 기본 아이콘으로 표시

### 개선:

#### 1. 온라인 도구로 아이콘 생성
```
https://www.pwabuilder.com/imageGenerator
```

#### 2. 512x512 PNG 업로드

#### 3. 생성된 아이콘 다운로드

#### 4. `public/icons/` 폴더에 복사
```
icon-72x72.png
icon-96x96.png
icon-128x128.png
icon-144x144.png
icon-152x152.png
icon-192x192.png
icon-384x384.png
icon-512x512.png
```

#### 5. 커밋 & 푸시 & 재배포

---

## ✅ 설치 후 확인

### 데스크톱:
- ✅ 독립 창으로 실행
- ✅ 주소창 없음
- ✅ 앱처럼 작동

### 모바일:
- ✅ 전체 화면
- ✅ 상태바 숨김
- ✅ 빠른 실행

---

## 🎯 Lighthouse 점수 확인

### Chrome DevTools:

1. **F12** → **Lighthouse** 탭
2. **Progressive Web App** 체크
3. **Analyze page load** 클릭

**목표:**
- PWA 점수: 90점 이상
- Performance: 90점 이상
- Accessibility: 90점 이상

---

## 🐛 문제 해결

### "설치 버튼이 안 보여요"

**체크리스트:**
- [ ] Vercel 프로덕션 앱 접속 (로컬 아님)
- [ ] HTTPS 사용 확인
- [ ] Chrome DevTools → Application → Manifest 확인
- [ ] Service Worker 활성화 확인
- [ ] 시크릿 모드로 재시도

### "Service Worker가 없어요"

**원인:**
- Vercel 빌드 캐시 문제

**해결:**
```
Vercel Dashboard → Redeploy (캐시 없이!)
```

---

## 📚 참고 자료

- [PWA Install 기준](https://web.dev/install-criteria/)
- [Next PWA 문서](https://ducanh-next-pwa.vercel.app/)
- [Manifest 문서](https://developer.mozilla.org/en-US/docs/Web/Manifest)

---

## 🎊 정리

**설치 방법:**
- **데스크톱:** 주소창 설치 버튼
- **Android:** 메뉴 → 홈 화면에 추가
- **iOS:** 공유 → 홈 화면에 추가

**현재 상태:**
- ✅ PWA 기능 활성화됨
- ✅ Vercel에서 설치 가능
- ⚠️ 아이콘은 기본 이미지 (개선 가능)

Vercel 앱에 접속해서 **주소창 설치 버튼**을 찾아보세요! 🚀

