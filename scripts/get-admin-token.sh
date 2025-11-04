#!/bin/bash

# Admin 토큰 발급 스크립트
# Usage: ./scripts/get-admin-token.sh

echo "🔑 Supabase Admin 토큰 발급"
echo "================================"
echo ""

# .env 파일에서 Supabase 정보 읽기
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# 환경 변수 확인
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "❌ .env 파일에 NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY가 필요합니다."
    exit 1
fi

echo "📝 Admin 계정 정보 입력"
echo "--------------------------------"
read -p "Email: " EMAIL
read -sp "Password: " PASSWORD
echo ""
echo ""

echo "🔄 로그인 중..."

# Supabase Auth API 호출
RESPONSE=$(curl -s -X POST "${NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password" \
  -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}")

# 에러 체크
if echo "$RESPONSE" | grep -q "error"; then
    echo "❌ 로그인 실패:"
    echo "$RESPONSE" | jq '.error_description // .message // .error'
    exit 1
fi

# 토큰 추출
ACCESS_TOKEN=$(echo "$RESPONSE" | jq -r '.access_token')
REFRESH_TOKEN=$(echo "$RESPONSE" | jq -r '.refresh_token')
USER_ID=$(echo "$RESPONSE" | jq -r '.user.id')
USER_EMAIL=$(echo "$RESPONSE" | jq -r '.user.email')

if [ "$ACCESS_TOKEN" = "null" ] || [ -z "$ACCESS_TOKEN" ]; then
    echo "❌ 토큰을 받지 못했습니다:"
    echo "$RESPONSE"
    exit 1
fi

echo "✅ 로그인 성공!"
echo ""
echo "================================"
echo "👤 User Info"
echo "--------------------------------"
echo "ID:    $USER_ID"
echo "Email: $USER_EMAIL"
echo ""
echo "🎫 Access Token (1시간 유효)"
echo "--------------------------------"
echo "$ACCESS_TOKEN"
echo ""
echo "🔄 Refresh Token"
echo "--------------------------------"
echo "$REFRESH_TOKEN"
echo ""
echo "================================"
echo ""
echo "📋 Postman 설정 방법:"
echo "1. Postman Collection 열기"
echo "2. Variables 탭 → 'token' 값에 위의 Access Token 붙여넣기"
echo "3. Save"
echo ""
echo "🔗 또는 cURL로 바로 테스트:"
echo "curl -H 'Authorization: Bearer $ACCESS_TOKEN' http://localhost:3000/api/policies"
echo ""

