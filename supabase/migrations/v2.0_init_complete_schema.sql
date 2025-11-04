-- ============================================
-- Migration v2.0: 초기 완전한 스키마
-- Date: 2025-11-04
-- Description: Policy 기반 권한 관리 시스템 전체 테이블 생성
-- ============================================

-- 이 파일은 Supabase SQL Editor에서 실행합니다
-- prisma/schema.prisma 기반으로 자동 생성된 테이블 정의

-- 참고: 실제 테이블 생성은 Prisma migrate 또는 db push로 수행
-- 이 파일은 참조용 문서입니다

/*
주요 테이블:
- Policy: 권한 정책
- State: 상태 정의
- StateTransition: 상태 전이
- Permission: 권한 정의
- Role: 역할
- Group: 그룹
- Type: 비즈니스 타입
- Attribute: 속성 정의
- TypeAttribute: Type-Attribute 연결
- BusinessObject: 비즈니스 객체 인스턴스
- Relationship: Type 간 관계 정의
- BusinessObjectRelationship: BusinessObject 간 관계 인스턴스
- Profile: 사용자 프로필 (auth.users 연동)
- UserRole: User-Role 매핑
- UserGroup: User-Group 매핑
- UserPermission: User별 직접 권한

실행 방법:
1. Supabase Dashboard → SQL Editor
2. prisma db push 명령어 실행:
   npx prisma db push

또는 migration 생성:
   npx prisma migrate dev --name init_v2_0
*/

-- Version 기록
COMMENT ON SCHEMA public IS 'Schema Version: v2.0 (2025-11-04)';

