#!/bin/bash

# ============================================
# Pooler → Direct Connection 자동 변환 스크립트
# ============================================

ENV_FILE=".env.local"

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ .env.local 파일이 없습니다!"
  exit 1
fi

echo "📊 현재 DATABASE_URL 확인 중..."
CURRENT_URL=$(grep "^DATABASE_URL=" "$ENV_FILE" | cut -d'"' -f2)
echo "$CURRENT_URL"
echo ""

# Pooler 체크
if [[ "$CURRENT_URL" == *"pooler.supabase.com:6543"* ]]; then
  echo "✅ Pooler URL 감지! Direct Connection으로 변경합니다."
  
  # 프로젝트 REF 추출
  if [[ "$CURRENT_URL" =~ postgres\.([^:]+): ]]; then
    PROJECT_REF="${BASH_REMATCH[1]}"
    echo "📌 프로젝트 REF: $PROJECT_REF"
    
    # URL 변환
    NEW_URL=$(echo "$CURRENT_URL" | sed -E \
      -e "s/aws-[^.]+\.pooler\.supabase\.com:6543/db.$PROJECT_REF.supabase.co:5432/" \
      -e 's/\?[^"]*/"/' \
      -e 's/"$/\?schema=public"/')
    
    echo ""
    echo "🔄 변경 후:"
    echo "$NEW_URL"
    echo ""
    
    # 백업 생성
    cp "$ENV_FILE" "${ENV_FILE}.backup"
    echo "💾 백업 생성: ${ENV_FILE}.backup"
    
    # 파일 수정
    sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=\"$NEW_URL\"|" "$ENV_FILE"
    echo "✅ $ENV_FILE 수정 완료!"
    echo ""
    echo "🚀 dev 서버를 재시작하세요:"
    echo "   npm run dev"
  else
    echo "❌ 프로젝트 REF를 추출할 수 없습니다."
    exit 1
  fi
elif [[ "$CURRENT_URL" == *"db."*".supabase.co:5432"* ]]; then
  echo "✅ 이미 Direct Connection을 사용 중입니다!"
else
  echo "⚠️  알 수 없는 DATABASE_URL 형식입니다."
  echo "   수동으로 변경하세요:"
  echo "   Supabase Dashboard → Settings → Database → Direct connection"
fi

