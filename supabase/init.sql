-- ============================================
-- Policy-based Permission Management System
-- Generated from prisma/schema.prisma
-- ============================================

-- ============================================
-- 기존 테이블 삭제 (외래 키 제약조건 역순)
-- ============================================
-- 주의: 모든 데이터가 삭제됩니다!
-- 필요시 주석 해제하여 사용하세요

/*
DROP TABLE IF EXISTS "UserPermission" CASCADE;
DROP TABLE IF EXISTS "UserGroup" CASCADE;
DROP TABLE IF EXISTS "UserRole" CASCADE;
DROP TABLE IF EXISTS "Permission" CASCADE;
DROP TABLE IF EXISTS "StateTransition" CASCADE;
DROP TABLE IF EXISTS "State" CASCADE;
DROP TABLE IF EXISTS "Group" CASCADE;
DROP TABLE IF EXISTS "Role" CASCADE;
DROP TABLE IF EXISTS "Policy" CASCADE;
*/

-- ============================================
-- 1. Policy 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS "Policy" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "version" INTEGER NOT NULL DEFAULT 1,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  CONSTRAINT "Policy_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Policy_name_version_key" UNIQUE ("name", "version")
);

CREATE INDEX IF NOT EXISTS "Policy_isActive_idx" ON "Policy"("isActive");
CREATE INDEX IF NOT EXISTS "Policy_createdAt_idx" ON "Policy"("createdAt");
CREATE INDEX IF NOT EXISTS "Policy_version_idx" ON "Policy"("version");

-- ============================================
-- 2. State 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS "State" (
  "id" TEXT NOT NULL,
  "policyId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "order" INTEGER NOT NULL,
  "isInitial" BOOLEAN NOT NULL DEFAULT false,
  "isFinal" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "State_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "State_policyId_name_key" UNIQUE ("policyId", "name")
);

CREATE INDEX IF NOT EXISTS "State_policyId_idx" ON "State"("policyId");
CREATE INDEX IF NOT EXISTS "State_order_idx" ON "State"("order");

ALTER TABLE "State" ADD CONSTRAINT "State_policyId_fkey" 
  FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================
-- 3. StateTransition 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS "StateTransition" (
  "id" TEXT NOT NULL,
  "fromStateId" TEXT NOT NULL,
  "toStateId" TEXT NOT NULL,
  "condition" TEXT,
  "order" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StateTransition_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "StateTransition_fromStateId_toStateId_key" UNIQUE ("fromStateId", "toStateId")
);

CREATE INDEX IF NOT EXISTS "StateTransition_fromStateId_idx" ON "StateTransition"("fromStateId");
CREATE INDEX IF NOT EXISTS "StateTransition_toStateId_idx" ON "StateTransition"("toStateId");

ALTER TABLE "StateTransition" ADD CONSTRAINT "StateTransition_fromStateId_fkey" 
  FOREIGN KEY ("fromStateId") REFERENCES "State"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StateTransition" ADD CONSTRAINT "StateTransition_toStateId_fkey" 
  FOREIGN KEY ("toStateId") REFERENCES "State"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================
-- 4. Role 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS "Role" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Role_isActive_idx" ON "Role"("isActive");
CREATE UNIQUE INDEX IF NOT EXISTS "Role_name_key" ON "Role"("name");

-- ============================================
-- 5. Group 테이블 (계층 구조 지원)
-- ============================================
CREATE TABLE IF NOT EXISTS "Group" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "parentId" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Group_isActive_idx" ON "Group"("isActive");
CREATE INDEX IF NOT EXISTS "Group_parentId_idx" ON "Group"("parentId");
CREATE UNIQUE INDEX IF NOT EXISTS "Group_name_key" ON "Group"("name");

ALTER TABLE "Group" ADD CONSTRAINT "Group_parentId_fkey" 
  FOREIGN KEY ("parentId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================
-- 6. Permission 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS "Permission" (
  "id" TEXT NOT NULL,
  "stateId" TEXT NOT NULL,
  "resource" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "targetType" TEXT NOT NULL,
  "roleId" TEXT,
  "groupId" TEXT,
  "userId" TEXT,
  "expression" TEXT,
  "isAllowed" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Permission_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Permission_stateId_resource_action_targetType_roleId_groupId_userId_key" 
    UNIQUE ("stateId", "resource", "action", "targetType", "roleId", "groupId", "userId")
);

CREATE INDEX IF NOT EXISTS "Permission_stateId_idx" ON "Permission"("stateId");
CREATE INDEX IF NOT EXISTS "Permission_targetType_idx" ON "Permission"("targetType");
CREATE INDEX IF NOT EXISTS "Permission_resource_action_idx" ON "Permission"("resource", "action");
CREATE INDEX IF NOT EXISTS "Permission_roleId_idx" ON "Permission"("roleId");
CREATE INDEX IF NOT EXISTS "Permission_groupId_idx" ON "Permission"("groupId");
CREATE INDEX IF NOT EXISTS "Permission_userId_idx" ON "Permission"("userId");

ALTER TABLE "Permission" ADD CONSTRAINT "Permission_stateId_fkey" 
  FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Permission" ADD CONSTRAINT "Permission_roleId_fkey" 
  FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Permission" ADD CONSTRAINT "Permission_groupId_fkey" 
  FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================
-- 7. UserRole 테이블 (User-Role Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS "UserRole" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "roleId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "UserRole_userId_roleId_key" UNIQUE ("userId", "roleId")
);

CREATE INDEX IF NOT EXISTS "UserRole_userId_idx" ON "UserRole"("userId");
CREATE INDEX IF NOT EXISTS "UserRole_roleId_idx" ON "UserRole"("roleId");

ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" 
  FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================
-- 8. UserGroup 테이블 (User-Group Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS "UserGroup" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "groupId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserGroup_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "UserGroup_userId_groupId_key" UNIQUE ("userId", "groupId")
);

CREATE INDEX IF NOT EXISTS "UserGroup_userId_idx" ON "UserGroup"("userId");
CREATE INDEX IF NOT EXISTS "UserGroup_groupId_idx" ON "UserGroup"("groupId");

ALTER TABLE "UserGroup" ADD CONSTRAINT "UserGroup_groupId_fkey" 
  FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================
-- 9. UserPermission 테이블 (User별 직접 권한)
-- ============================================
CREATE TABLE IF NOT EXISTS "UserPermission" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "stateId" TEXT NOT NULL,
  "resource" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "expression" TEXT,
  "isAllowed" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserPermission_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "UserPermission_userId_stateId_resource_action_key" 
    UNIQUE ("userId", "stateId", "resource", "action")
);

CREATE INDEX IF NOT EXISTS "UserPermission_userId_idx" ON "UserPermission"("userId");
CREATE INDEX IF NOT EXISTS "UserPermission_stateId_idx" ON "UserPermission"("stateId");

-- ============================================
-- 10. Type 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS "Type" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL UNIQUE,
  "policy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Type_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Type_name_key" ON "Type"("name");
CREATE INDEX IF NOT EXISTS "Type_name_idx" ON "Type"("name");
CREATE INDEX IF NOT EXISTS "Type_policy_idx" ON "Type"("policy");

-- ============================================
-- 11. BusinessObject 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS "BusinessObject" (
  "id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "revision" INTEGER NOT NULL DEFAULT 1,
  "current" BOOLEAN NOT NULL DEFAULT true,
  "owner" TEXT,
  "modifiedBy" TEXT,
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BusinessObject_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "BusinessObject_name_revision_key" UNIQUE ("name", "revision")
);

CREATE INDEX IF NOT EXISTS "BusinessObject_type_idx" ON "BusinessObject"("type");
CREATE INDEX IF NOT EXISTS "BusinessObject_current_idx" ON "BusinessObject"("current");
CREATE INDEX IF NOT EXISTS "BusinessObject_owner_idx" ON "BusinessObject"("owner");

-- ============================================
-- 12. AttributeType Enum
-- ============================================
DO $$ BEGIN
  CREATE TYPE "AttributeType" AS ENUM ('string', 'integer', 'real', 'date');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- 13. BusinessAttribute 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS "BusinessAttribute" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL UNIQUE,
  "type" "AttributeType" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BusinessAttribute_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "BusinessAttribute_name_key" ON "BusinessAttribute"("name");
CREATE INDEX IF NOT EXISTS "BusinessAttribute_name_idx" ON "BusinessAttribute"("name");
CREATE INDEX IF NOT EXISTS "BusinessAttribute_type_idx" ON "BusinessAttribute"("type");

-- ============================================
-- 완료
-- ============================================
-- 모든 테이블 생성 완료
-- Supabase SQL Editor에서 이 파일을 실행하세요.

