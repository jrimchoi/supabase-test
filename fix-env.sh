#!/bin/bash

# .env.local 파일 수정
# Pooler 사용, pgbouncer=true 제거

cat > .env.local << 'EOF'
# Supabase Connection (Pooler - pgbouncer=true 제거)
DATABASE_URL="postgresql://postgres.ckujlkdumhhtjkinngjf:JFU1hbZtGSvFspnM@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?schema=public"

# Supabase Config
NEXT_PUBLIC_SUPABASE_URL="https://ckujlkdumhhtjkinngjf.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrdWpsa2R1bWhod

GpraW5uZ2pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAzNzcxNTQsImV4cCI6MjA0NTk1MzE1NH0.7vY1234567890abcdefghijklmnopqrstuvwxyz"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
EOF

echo "✅ .env.local 파일이 재생성되었습니다."
echo ""
echo "📋 설정:"
echo "  - Pooler 사용 (6543 포트)"
echo "  - pgbouncer=true 제거됨"
echo "  - schema=public 유지"
echo ""
echo "🚀 dev 서버를 재시작하세요:"
echo "   npm run dev"

