// Jest 통합 테스트 전역 설정
// 실제 Supabase DB 연결 정보 사용

const fs = require('fs')
const path = require('path')

// .env.test 파일 우선 로드 (통합 테스트 전용 - Direct Connection)
const envTestPath = path.resolve(process.cwd(), '.env.test')
const envLocalPath = path.resolve(process.cwd(), '.env.local')

if (fs.existsSync(envTestPath)) {
  // .env.test 사용 (Direct Connection)
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
  console.log('✅ .env.test 로드 완료 (Direct Connection)')
} else if (fs.existsSync(envLocalPath)) {
  // .env.local fallback (Pooler)
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
  console.log('✅ .env.local 로드 완료 (Pooler - 테스트용으로는 권장하지 않음)')
  console.warn('⚠️  통합 테스트는 Direct Connection을 사용하세요! .env.test 파일을 생성하세요.')
} else {
  console.error('❌ .env.test 또는 .env.local 파일이 없습니다!')
}

// 환경 변수 확인 및 수정
if (process.env.DATABASE_URL) {
  let dbUrl = process.env.DATABASE_URL
  
  // Pooler (6543) → Direct Connection (5432)로 변경
  if (dbUrl.includes(':6543')) {
    dbUrl = dbUrl.replace(':6543', ':5432')
    console.log('ℹ️  Pooler → Direct Connection (6543 → 5432)')
  }
  
  // pgbouncer=true 제거 (Direct Connection에서는 불필요)
  if (dbUrl.includes('pgbouncer=true')) {
    dbUrl = dbUrl.replace(/[?&]pgbouncer=true/, '')
    console.log('ℹ️  pgbouncer=true 제거')
  }
  
  // schema=public 추가 (없는 경우)
  if (!dbUrl.includes('schema=')) {
    const separator = dbUrl.includes('?') ? '&' : '?'
    dbUrl = dbUrl + separator + 'schema=public'
    console.log('ℹ️  schema=public 추가')
  }
  
  // sslmode=require 추가 (없는 경우)
  if (!dbUrl.includes('sslmode=')) {
    const separator = dbUrl.includes('?') ? '&' : '?'
    dbUrl = dbUrl + separator + 'sslmode=require'
    console.log('ℹ️  sslmode=require 추가')
  }
  
  process.env.DATABASE_URL = dbUrl
  
  const dbHost = dbUrl.split('@')[1]?.split('/')[0] || 'N/A'
  console.log(`📊 DB 연결: ${dbHost}`)
} else {
  console.error('❌ DATABASE_URL이 설정되지 않았습니다!')
}

