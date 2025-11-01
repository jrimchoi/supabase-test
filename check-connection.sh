#!/bin/bash

echo "=== Supabase Database 연결 확인 ==="
echo ""

# .env 파일에서 DATABASE_URL 읽기
if [ -f .env ]; then
    echo "✓ .env 파일 발견"
    DB_URL=$(grep "DATABASE_URL" .env | cut -d '=' -f2- | tr -d '"' | tr -d "'")
    if [ -z "$DB_URL" ]; then
        echo "✗ DATABASE_URL을 찾을 수 없습니다"
        exit 1
    fi
    
    # 비밀번호 마스킹
    MASKED_URL=$(echo "$DB_URL" | sed 's/:[^@]*@/:***@/')
    echo "DATABASE_URL: $MASKED_URL"
    echo ""
    
    # Host 추출
    HOST=$(echo "$DB_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
    PORT=$(echo "$DB_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    
    echo "연결 대상:"
    echo "  Host: $HOST"
    echo "  Port: $PORT"
    echo ""
    
    # 네트워크 연결 테스트
    echo "네트워크 연결 테스트..."
    if timeout 5 nc -z "$HOST" "$PORT" 2>/dev/null; then
        echo "✓ 포트 $PORT 연결 가능"
    else
        echo "✗ 포트 $PORT 연결 실패"
        echo ""
        echo "가능한 원인:"
        echo "  1. Supabase 프로젝트가 일시 중지됨"
        echo "  2. IP 제한 설정됨"
        echo "  3. 네트워크/방화벽 문제"
        echo ""
        echo "해결 방법:"
        echo "  1. Supabase Dashboard → Settings → Database"
        echo "  2. Connection Pooling 사용 시도 (포트 6543)"
        echo "  3. IP Restrictions 확인"
    fi
else
    echo "✗ .env 파일을 찾을 수 없습니다"
fi

