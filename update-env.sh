#!/bin/bash

echo "=== .env 파일 업데이트 ==="
echo ""

# 백업
cp .env .env.backup
echo "✓ .env 백업 생성 (.env.backup)"

# DATABASE_URL에 schema 파라미터 추가
if grep -q "DATABASE_URL.*schema" .env; then
    echo "✓ DATABASE_URL에 이미 schema 파라미터가 있습니다"
else
    sed -i.bak 's|DATABASE_URL=\(.*\)|DATABASE_URL=\1?schema=public|' .env
    echo "✓ DATABASE_URL에 schema=public 추가"
fi

# DATABASE_DIRECT_URL 추가 (마이그레이션용)
if grep -q "DATABASE_DIRECT_URL" .env; then
    echo "✓ DATABASE_DIRECT_URL이 이미 있습니다"
else
    # Direct Connection URL 생성
    CURRENT_URL=$(grep "^DATABASE_URL" .env | cut -d'=' -f2-)
    
    # pooler URL을 direct URL로 변환
    DIRECT_URL=$(echo "$CURRENT_URL" | sed 's|postgres\.ckujlkdumhhtjkinngjf|postgres|' | sed 's|aws-1-ap-southeast-1\.pooler\.supabase\.com:6543|db.ckujlkdumhhtjkinngjf.supabase.co:5432|' | sed 's|?schema=public||')
    
    # 비밀번호 추출
    PASSWORD=$(echo "$CURRENT_URL" | sed -n 's/.*:\([^@]*\)@.*/\1/p')
    
    # Direct URL 구성
    DIRECT_FULL="postgresql://postgres:${PASSWORD}@db.ckujlkdumhhtjkinngjf.supabase.co:5432/postgres?schema=public"
    
    echo "" >> .env
    echo "# Direct Connection for Prisma migrations" >> .env
    echo "DATABASE_DIRECT_URL=\"${DIRECT_FULL}\"" >> .env
    echo "✓ DATABASE_DIRECT_URL 추가됨"
    echo ""
    echo "⚠️  주의: Direct Connection은 IP 제한으로 실패할 수 있습니다."
    echo "   실패 시 Supabase Dashboard에서 IP 제한을 해제하세요."
fi

echo ""
echo "=== 업데이트 완료 ==="
echo ""
echo "변경 사항 확인:"
echo "DATABASE_URL:"
grep "^DATABASE_URL" .env | sed 's/:[^@]*@/:***@/'
echo ""
echo "DATABASE_DIRECT_URL:"
grep "^DATABASE_DIRECT_URL" .env | sed 's/:[^@]*@/:***@/' || echo "(없음)"

