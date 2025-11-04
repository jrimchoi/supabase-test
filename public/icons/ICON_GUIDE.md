# PWA 아이콘 생성 가이드

현재 PWA 기능이 활성화되어 있지만, 실제 아이콘 파일이 없습니다.
다음 방법 중 하나를 선택하여 아이콘을 생성하세요.

## 방법 1: 온라인 도구 사용 (권장)

### PWA Builder Image Generator
1. https://www.pwabuilder.com/imageGenerator 접속
2. 512x512 PNG 이미지 업로드
3. 생성된 아이콘을 다운로드하여 `public/icons/` 폴더에 복사

### RealFaviconGenerator
1. https://realfavicongenerator.net/ 접속
2. 이미지 업로드
3. PWA 아이콘 옵션 선택
4. 다운로드하여 `public/icons/` 폴더에 복사

## 방법 2: 스크립트 사용

### 준비물
- 512x512 PNG 파일 (public/icon-512.png)
- sharp 패키지

### 실행 방법
```bash
# 1. sharp 패키지 설치
npm install --save-dev sharp

# 2. 512x512 PNG 파일 준비
# public/icon-512.png 파일을 생성하세요

# 3. 스크립트 실행
node scripts/generate-pwa-icons.js
```

## 방법 3: 직접 생성

필요한 아이콘 크기:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

각 크기의 PNG 파일을 `public/icons/` 폴더에 생성하세요.

## 임시 아이콘

개발 중에는 `public/icons/icon.svg` 파일을 사용할 수 있습니다.
SVG를 PNG로 변환하려면:
```bash
# ImageMagick 사용 (설치 필요)
convert -background none -resize 512x512 public/icons/icon.svg public/icon-512.png
```

## 디자인 팁

1. **단순함**: 작은 크기에서도 인식 가능하도록 단순한 디자인
2. **명확성**: 앱의 목적을 명확히 나타내는 심볼
3. **대비**: 배경색과 전경색의 충분한 대비
4. **Safe Zone**: 중요한 요소는 중앙 80% 영역 내에 배치
5. **투명 배경**: PNG 파일은 투명 배경 사용 가능

