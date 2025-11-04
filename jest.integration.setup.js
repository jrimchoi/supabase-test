// Jest 통합 테스트 전역 설정
// 실제 Supabase DB 연결 정보 사용

const fs = require('fs')
const path = require('path')

// 통합 테스트에서는 Prisma Extensions 비활성화 (TLS 충돌 방지)
process.env.SKIP_PRISMA_EXTENSIONS = 'true'

// .env.local 파일 우선 로드 (통합 테스트 전용)
const envLocalPath = path.resolve(process.cwd(), '.env.local')
const envTestPath = path.resolve(process.cwd(), '.env.test')

if (fs.existsSync(envLocalPath)) {
  // .env.local 사용 (Pooler)
  const envConfig = fs.readFileSync(envLocalPath, 'utf8')
  envConfig.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...values] = trimmed.split('=')
      const value = values.join('=')
      if (key && value) {
        process.env[key] = value.replace(/^["']|["']$/g, '')
      }
    }
  })
  console.log('✅ .env.local 로드 완료 (Pooler)')
} else if (fs.existsSync(envTestPath)) {
  // .env.test fallback
  const envConfig = fs.readFileSync(envTestPath, 'utf8')
  envConfig.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...values] = trimmed.split('=')
      const value = values.join('=')
      if (key && value) {
        process.env[key] = value.replace(/^["']|["']$/g, '')
      }
    }
  })
  console.log('✅ .env.test 로드 완료')
} else {
  console.error('❌ .env.local 또는 .env.test 파일이 없습니다!')
}

// 환경 변수 확인 및 수정
if (process.env.DATABASE_URL) {
  let dbUrl = process.env.DATABASE_URL
  
  // Pooler 사용 (6543 포트 유지)
  console.log('ℹ️  Pooler Connection 사용 (6543 포트)')
  
  // pgbouncer=true 확인 및 추가 (Pooler에서 필요)
  if (!dbUrl.includes('pgbouncer=true')) {
    const separator = dbUrl.includes('?') ? '&' : '?'
    dbUrl = dbUrl + separator + 'pgbouncer=true'
    console.log('ℹ️  pgbouncer=true 추가 (Pooler용)')
  }
  
  // schema=public 추가 (없는 경우)
  if (!dbUrl.includes('schema=')) {
    const separator = dbUrl.includes('?') ? '&' : '?'
    dbUrl = dbUrl + separator + 'schema=public'
    console.log('ℹ️  schema=public 추가')
  }
  
  // sslmode=disable 추가 (없는 경우)
  if (!dbUrl.includes('sslmode=')) {
    const separator = dbUrl.includes('?') ? '&' : '?'
    dbUrl = dbUrl + separator + 'sslmode=disable'
    console.log('ℹ️  sslmode=disable 추가 (Pooler TLS 우회)')
  } else if (!dbUrl.includes('sslmode=disable')) {
    console.log(`ℹ️  현재 sslmode: ${dbUrl.match(/sslmode=([^&]+)/)?.[1]}`)
  }
  
  process.env.DATABASE_URL = dbUrl
  
  // SSL 인증서 검증 비활성화 (Node.js 전역 설정)
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
  console.log('ℹ️  SSL 인증서 검증 비활성화 (테스트용)')
  
  const dbHost = dbUrl.split('@')[1]?.split('/')[0] || 'N/A'
  console.log(`📊 DB 연결: ${dbHost}`)
} else {
  console.error('❌ DATABASE_URL이 설정되지 않았습니다!')
}

