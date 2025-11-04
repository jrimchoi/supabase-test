#!/usr/bin/env node

/**
 * PWA 아이콘 생성 스크립트
 * 
 * 사용법:
 * 1. sharp 패키지 설치: npm install --save-dev sharp
 * 2. 512x512 PNG 아이콘을 public/icon-512.png에 준비
 * 3. 스크립트 실행: node scripts/generate-pwa-icons.js
 */

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputFile = path.join(__dirname, '../public/icon-512.png');
const outputDir = path.join(__dirname, '../public/icons');

console.log('PWA 아이콘 생성을 위한 안내:');
console.log('');
console.log('1. 512x512 PNG 파일을 준비하세요 (public/icon-512.png)');
console.log('2. sharp 패키지를 설치하세요: npm install --save-dev sharp');
console.log('3. 아래 코드의 주석을 해제하여 실행하세요');
console.log('');
console.log('또는 온라인 도구 사용:');
console.log('- https://realfavicongenerator.net/');
console.log('- https://www.pwabuilder.com/imageGenerator');
console.log('');

// 아이콘 생성 코드 (sharp 패키지 설치 후 주석 해제)
/*
async function generateIcons() {
  try {
    const sharp = require('sharp');
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    if (!fs.existsSync(inputFile)) {
      console.error(`Error: ${inputFile} 파일이 없습니다.`);
      console.log('512x512 PNG 파일을 생성하여 public/icon-512.png에 저장하세요.');
      return;
    }

    console.log('아이콘 생성 중...');

    for (const size of sizes) {
      const outputFile = path.join(outputDir, `icon-${size}x${size}.png`);
      
      await sharp(inputFile)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputFile);
      
      console.log(`✓ Generated: icon-${size}x${size}.png`);
    }

    console.log('');
    console.log('✨ 모든 아이콘이 생성되었습니다!');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

generateIcons();
*/

