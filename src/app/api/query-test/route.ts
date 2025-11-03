import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Connection Type별 DATABASE_URL
const CONNECTION_URLS = {
  default: process.env.DATABASE_URL!,
  pooler: 'postgresql://postgres.ckujlkdumhhtjkinngjf:JFU1hbZtGSvFspnM@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?schema=public',
  direct: 'postgresql://postgres.ckujlkdumhhtjkinngjf:JFU1hbZtGSvFspnM@db.ckujlkdumhhtjkinngjf.supabase.co:5432/postgres?schema=public',
  local: 'postgresql://postgres:postgres@localhost:54322/postgres?schema=public',
}

// Prisma Client 생성 함수
function createPrismaClient(connectionType: string) {
  const databaseUrl = CONNECTION_URLS[connectionType as keyof typeof CONNECTION_URLS] || CONNECTION_URLS.default
  
  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  })
}

// 허용된 쿼리 목록 (보안)
const ALLOWED_QUERIES = {
  businessObjects: {
    name: 'BusinessObject 조회 (50개, JOIN 포함)',
    sql: `
      SELECT 
        bo.id,
        bo.name,
        bo.revision,
        bo."currentState",
        bo.description,
        bo.owner,
        bo."createdAt",
        bo."updatedAt",
        t.id as "type_id",
        t.name as "type_name",
        t.description as "type_description",
        p.id as "policy_id",
        p.name as "policy_name",
        p."revisionSequence" as "policy_revisionSequence"
      FROM "BusinessObject" bo
      LEFT JOIN "Type" t ON bo."typeId" = t.id
      LEFT JOIN "Policy" p ON bo."policyId" = p.id
      ORDER BY bo."createdAt" DESC
      LIMIT 50
    `,
  },
  businessObjectsNoJoin: {
    name: 'BusinessObject 조회 (50개, JOIN 없음)',
    sql: `
      SELECT 
        id,
        name,
        revision,
        "currentState",
        description,
        owner,
        "createdAt",
        "updatedAt",
        "typeId",
        "policyId"
      FROM "BusinessObject"
      ORDER BY "createdAt" DESC
      LIMIT 50
    `,
  },
  businessObjectsCount: {
    name: 'BusinessObject 개수',
    sql: `SELECT COUNT(*) as count FROM "BusinessObject"`,
  },
  types: {
    name: 'Type 전체 조회',
    sql: `SELECT id, name, description FROM "Type" ORDER BY "createdAt" DESC`,
  },
  policies: {
    name: 'Policy 전체 조회',
    sql: `SELECT id, name, description, "revisionSequence" FROM "Policy" ORDER BY "createdAt" DESC`,
  },
  states: {
    name: 'State 전체 조회',
    sql: `SELECT s.id, s.name, s.description, p.name as "policyName" FROM "State" s LEFT JOIN "Policy" p ON s."policyId" = p.id ORDER BY s."createdAt" DESC`,
  },
  permissions: {
    name: 'Permission 전체 조회',
    sql: `SELECT id, resource, action, "targetType", "targetId", expression FROM "Permission" LIMIT 100`,
  },
}

export async function POST(request: NextRequest) {
  let prismaClient: PrismaClient | null = null
  
  try {
    const body = await request.json()
    const { queryKey, customSql, connectionType = 'default' } = body

    let sql: string
    let queryName: string

    if (customSql) {
      // 커스텀 SQL (SELECT만 허용)
      sql = customSql.trim()
      queryName = 'Custom Query'
      
      // 보안 체크: SELECT만 허용
      if (!sql.toLowerCase().startsWith('select')) {
        return NextResponse.json(
          { error: 'SELECT 쿼리만 허용됩니다' },
          { status: 400 }
        )
      }
    } else if (queryKey && ALLOWED_QUERIES[queryKey as keyof typeof ALLOWED_QUERIES]) {
      // 미리 정의된 쿼리
      const query = ALLOWED_QUERIES[queryKey as keyof typeof ALLOWED_QUERIES]
      sql = query.sql
      queryName = query.name
    } else {
      return NextResponse.json(
        { error: '유효하지 않은 쿼리입니다' },
        { status: 400 }
      )
    }

    // Connection Type에 따라 Prisma Client 생성
    prismaClient = createPrismaClient(connectionType)

    // 성능 측정 시작
    const startTime = performance.now()
    const serverStartTime = Date.now()

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`🔍 [Query Test] ${queryName}`)
    console.log(`🔌 [Connection] ${connectionType}`)
    console.log(`📝 [SQL] ${sql.substring(0, 100)}...`)

    // 쿼리 실행
    const result = await prismaClient.$queryRawUnsafe(sql)

    // 성능 측정 종료
    const endTime = performance.now()
    const serverEndTime = Date.now()
    const executionTime = endTime - startTime
    const serverExecutionTime = serverEndTime - serverStartTime

    console.log(`✅ [Query Execution] ${executionTime.toFixed(2)}ms`)
    console.log(`📊 [Result Count] ${Array.isArray(result) ? result.length : 1}`)
    console.log(`⏱️  [Server Time] ${serverExecutionTime}ms`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    return NextResponse.json({
      success: true,
      queryName,
      sql,
      connectionType,
      executionTime: parseFloat(executionTime.toFixed(2)),
      serverExecutionTime,
      resultCount: Array.isArray(result) ? result.length : 1,
      data: result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('❌ [Query Error]', error)
    
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '쿼리 실행 실패',
        details: error,
      },
      { status: 500 }
    )
  } finally {
    // Prisma Client 연결 종료
    if (prismaClient) {
      await prismaClient.$disconnect()
    }
  }
}

// GET: 사용 가능한 쿼리 목록 반환
export async function GET() {
  return NextResponse.json({
    queries: Object.entries(ALLOWED_QUERIES).map(([key, value]) => ({
      key,
      name: value.name,
    })),
  })
}

