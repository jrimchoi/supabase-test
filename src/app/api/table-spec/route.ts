import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tableName = searchParams.get('table')

    if (!tableName) {
      return NextResponse.json({ error: '테이블 이름이 필요합니다' }, { status: 400 })
    }

    const startTime = performance.now()

    // 1. 테이블 목록 조회 (table 파라미터 없을 때)
    if (tableName === '__list__') {
      const tables: any[] = await prisma.$queryRawUnsafe(`
        SELECT 
          tablename,
          schemaname
        FROM pg_catalog.pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename
      `)
      
      return NextResponse.json({ tables })
    }

    // 2. 컬럼 정보
    const columns: any[] = await prisma.$queryRawUnsafe(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length,
        numeric_precision,
        numeric_scale
      FROM information_schema.columns
      WHERE table_schema = 'public' 
        AND table_name = '${tableName}'
      ORDER BY ordinal_position
    `)

    // 3. 인덱스 정보
    const indexes: any[] = await prisma.$queryRawUnsafe(`
      SELECT 
        indexname,
        indexdef
      FROM pg_catalog.pg_indexes
      WHERE schemaname = 'public' 
        AND tablename = '${tableName}'
      ORDER BY indexname
    `)

    // 4. 제약 조건 (Primary Key, Foreign Key, Unique)
    const constraints: any[] = await prisma.$queryRawUnsafe(`
      SELECT
        conname as constraint_name,
        contype as constraint_type,
        pg_catalog.pg_get_constraintdef(oid) as definition
      FROM pg_catalog.pg_constraint
      WHERE conrelid = (
        SELECT oid FROM pg_catalog.pg_class 
        WHERE relname = '${tableName}' 
          AND relnamespace = (SELECT oid FROM pg_catalog.pg_namespace WHERE nspname = 'public')
      )
      ORDER BY conname
    `)

    // 5. 테이블 통계
    const stats: any[] = await prisma.$queryRawUnsafe(`
      SELECT 
        schemaname,
        relname as tablename,
        n_live_tup as row_count,
        n_dead_tup as dead_rows,
        last_vacuum,
        last_autovacuum,
        last_analyze,
        last_autoanalyze
      FROM pg_catalog.pg_stat_user_tables
      WHERE relname = '${tableName}'
    `)

    // 6. 테이블 크기
    const size: any[] = await prisma.$queryRawUnsafe(`
      SELECT 
        pg_catalog.pg_size_pretty(pg_catalog.pg_total_relation_size('"${tableName}"'::regclass)) as total_size,
        pg_catalog.pg_size_pretty(pg_catalog.pg_relation_size('"${tableName}"'::regclass)) as table_size,
        pg_catalog.pg_size_pretty(pg_catalog.pg_indexes_size('"${tableName}"'::regclass)) as indexes_size
    `)

    // 7. DDL 생성 (간단 버전)
    let ddl = `CREATE TABLE "${tableName}" (\n`
    columns.forEach((col, idx) => {
      ddl += `  "${col.column_name}" ${col.data_type}`
      if (col.character_maximum_length) {
        ddl += `(${col.character_maximum_length})`
      }
      if (col.is_nullable === 'NO') {
        ddl += ' NOT NULL'
      }
      if (col.column_default) {
        ddl += ` DEFAULT ${col.column_default}`
      }
      if (idx < columns.length - 1) {
        ddl += ','
      }
      ddl += '\n'
    })
    ddl += ');'

    const executionTime = (performance.now() - startTime).toFixed(2)

    // BigInt를 Number로 변환하는 함수
    const convertBigInt = (obj: any): any => {
      if (obj === null || obj === undefined) return obj
      if (typeof obj === 'bigint') return Number(obj)
      if (Array.isArray(obj)) return obj.map(convertBigInt)
      if (typeof obj === 'object') {
        const converted: any = {}
        for (const key in obj) {
          converted[key] = convertBigInt(obj[key])
        }
        return converted
      }
      return obj
    }

    return NextResponse.json({
      success: true,
      tableName,
      columns: convertBigInt(columns),
      indexes: convertBigInt(indexes),
      constraints: convertBigInt(constraints),
      stats: convertBigInt(stats[0]) || null,
      size: size[0] || null,
      ddl,
      executionTime: parseFloat(executionTime),
    })
  } catch (error) {
    console.error('❌ [Table Spec] 오류:', error)
    
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '테이블 정보 조회 실패',
        details: error,
      },
      { status: 500 }
    )
  }
}

