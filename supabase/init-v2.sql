-- ============================================
-- Policy-based Permission Management System V2
-- EAV (Entity-Attribute-Value) 패턴 + 리비전 자동 할당 시스템
-- ============================================

-- ============================================
-- 기존 테이블 삭제 (외래 키 제약조건 역순)
-- ============================================
-- 주의: 모든 데이터가 삭제됩니다!

DROP TABLE IF EXISTS "BusinessAttribute" CASCADE;
DROP TABLE IF EXISTS "BusinessObject" CASCADE;
DROP TABLE IF EXISTS "TypeAttribute" CASCADE;
DROP TABLE IF EXISTS "Attribute" CASCADE;
DROP TABLE IF EXISTS "PolicyType" CASCADE;
DROP TABLE IF EXISTS "Type" CASCADE;
DROP TABLE IF EXISTS "UserPermission" CASCADE;
DROP TABLE IF EXISTS "UserGroup" CASCADE;
DROP TABLE IF EXISTS "UserRole" CASCADE;
DROP TABLE IF EXISTS "Permission" CASCADE;
DROP TABLE IF EXISTS "StateTransition" CASCADE;
DROP TABLE IF EXISTS "State" CASCADE;
DROP TABLE IF EXISTS "Group" CASCADE;
DROP TABLE IF EXISTS "Role" CASCADE;
DROP TABLE IF EXISTS "Policy" CASCADE;

-- Enum 타입 삭제 및 재생성
DROP TYPE IF EXISTS "AttrType" CASCADE;
CREATE TYPE "AttrType" AS ENUM ('STRING', 'INTEGER', 'REAL', 'DATE', 'BOOLEAN', 'JSON', 'ENUM');

-- ============================================
-- 1. Policy 테이블 (리비전 순서 관리)
-- ============================================
CREATE TABLE "Policy" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "revisionSequence" TEXT NOT NULL DEFAULT 'A,B,C',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  CONSTRAINT "Policy_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Policy_name_key" UNIQUE ("name")
);

CREATE INDEX "Policy_isActive_idx" ON "Policy"("isActive");
CREATE INDEX "Policy_createdAt_idx" ON "Policy"("createdAt");

COMMENT ON COLUMN "Policy"."revisionSequence" IS '리비전 순서 (콤마로 구분, 예: A,B,C)';

-- ============================================
-- 2. State 테이블
-- ============================================
CREATE TABLE "State" (
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

CREATE INDEX "State_policyId_idx" ON "State"("policyId");
CREATE INDEX "State_order_idx" ON "State"("order");

ALTER TABLE "State" ADD CONSTRAINT "State_policyId_fkey" 
  FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================
-- 3. StateTransition 테이블
-- ============================================
CREATE TABLE "StateTransition" (
  "id" TEXT NOT NULL,
  "fromStateId" TEXT NOT NULL,
  "toStateId" TEXT NOT NULL,
  "condition" TEXT,
  "order" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StateTransition_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "StateTransition_fromStateId_toStateId_key" UNIQUE ("fromStateId", "toStateId")
);

CREATE INDEX "StateTransition_fromStateId_idx" ON "StateTransition"("fromStateId");
CREATE INDEX "StateTransition_toStateId_idx" ON "StateTransition"("toStateId");

ALTER TABLE "StateTransition" ADD CONSTRAINT "StateTransition_fromStateId_fkey" 
  FOREIGN KEY ("fromStateId") REFERENCES "State"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StateTransition" ADD CONSTRAINT "StateTransition_toStateId_fkey" 
  FOREIGN KEY ("toStateId") REFERENCES "State"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================
-- 4. Role 테이블
-- ============================================
CREATE TABLE "Role" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Role_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Role_name_key" UNIQUE ("name")
);

CREATE INDEX "Role_isActive_idx" ON "Role"("isActive");

-- ============================================
-- 5. Group 테이블 (계층 구조 지원)
-- ============================================
CREATE TABLE "Group" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "parentId" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Group_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Group_name_key" UNIQUE ("name")
);

CREATE INDEX "Group_isActive_idx" ON "Group"("isActive");
CREATE INDEX "Group_parentId_idx" ON "Group"("parentId");

ALTER TABLE "Group" ADD CONSTRAINT "Group_parentId_fkey" 
  FOREIGN KEY ("parentId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================
-- 6. Permission 테이블
-- ============================================
CREATE TABLE "Permission" (
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

CREATE INDEX "Permission_stateId_idx" ON "Permission"("stateId");
CREATE INDEX "Permission_targetType_idx" ON "Permission"("targetType");
CREATE INDEX "Permission_resource_action_idx" ON "Permission"("resource", "action");
CREATE INDEX "Permission_roleId_idx" ON "Permission"("roleId");
CREATE INDEX "Permission_groupId_idx" ON "Permission"("groupId");
CREATE INDEX "Permission_userId_idx" ON "Permission"("userId");

ALTER TABLE "Permission" ADD CONSTRAINT "Permission_stateId_fkey" 
  FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Permission" ADD CONSTRAINT "Permission_roleId_fkey" 
  FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Permission" ADD CONSTRAINT "Permission_groupId_fkey" 
  FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================
-- 7. UserRole 테이블
-- ============================================
CREATE TABLE "UserRole" (
  "id" TEXT NOT NULL,
  "userId" UUID NOT NULL,
  "roleId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "UserRole_userId_roleId_key" UNIQUE ("userId", "roleId")
);

CREATE INDEX "UserRole_userId_idx" ON "UserRole"("userId");
CREATE INDEX "UserRole_roleId_idx" ON "UserRole"("roleId");

ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" 
  FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================
-- 8. UserGroup 테이블
-- ============================================
CREATE TABLE "UserGroup" (
  "id" TEXT NOT NULL,
  "userId" UUID NOT NULL,
  "groupId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserGroup_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "UserGroup_userId_groupId_key" UNIQUE ("userId", "groupId")
);

CREATE INDEX "UserGroup_userId_idx" ON "UserGroup"("userId");
CREATE INDEX "UserGroup_groupId_idx" ON "UserGroup"("groupId");

ALTER TABLE "UserGroup" ADD CONSTRAINT "UserGroup_groupId_fkey" 
  FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserGroup" ADD CONSTRAINT "UserGroup_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================
-- 9. UserPermission 테이블
-- ============================================
CREATE TABLE "UserPermission" (
  "id" TEXT NOT NULL,
  "userId" UUID NOT NULL,
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

CREATE INDEX "UserPermission_userId_idx" ON "UserPermission"("userId");

-- profiles와의 Foreign Key는 추가하지 않음 (auth.users 직접 참조)
CREATE INDEX "UserPermission_stateId_idx" ON "UserPermission"("stateId");

-- ============================================
-- 10. Type 테이블 (비즈니스 타입 - 계층 구조 지원, 속성 상속)
-- ============================================
CREATE TABLE "Type" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "prefix" TEXT,
  "policyId" TEXT NOT NULL,
  "parentId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Type_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Type_name_key" UNIQUE ("name")
);

CREATE INDEX "Type_name_idx" ON "Type"("name");
CREATE INDEX "Type_policyId_idx" ON "Type"("policyId");
CREATE INDEX "Type_parentId_idx" ON "Type"("parentId");

ALTER TABLE "Type" ADD CONSTRAINT "Type_policyId_fkey" 
  FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Type" ADD CONSTRAINT "Type_parentId_fkey" 
  FOREIGN KEY ("parentId") REFERENCES "Type"("id") ON DELETE SET NULL ON UPDATE CASCADE;

COMMENT ON TABLE "Type" IS '비즈니스 타입 (계층 구조 지원, 속성 상속)';
COMMENT ON COLUMN "Type"."name" IS '고유 타입 식별자 (예: invoice, tax-invoice)';
COMMENT ON COLUMN "Type"."description" IS '타입 설명 (중복 허용, 상속 가능)';
COMMENT ON COLUMN "Type"."prefix" IS '접두사 (예: INV, TAX, 상속 가능)';
COMMENT ON COLUMN "Type"."policyId" IS '기본 Policy (리비전 자동 할당용)';

-- ============================================
-- 10-1. PolicyType 테이블 (Policy-Type Many-to-Many)
-- ============================================
CREATE TABLE "PolicyType" (
  "id" TEXT NOT NULL,
  "policyId" TEXT NOT NULL,
  "typeId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PolicyType_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PolicyType_policyId_typeId_key" UNIQUE ("policyId", "typeId")
);

CREATE INDEX "PolicyType_policyId_idx" ON "PolicyType"("policyId");
CREATE INDEX "PolicyType_typeId_idx" ON "PolicyType"("typeId");

ALTER TABLE "PolicyType" ADD CONSTRAINT "PolicyType_policyId_fkey" 
  FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "PolicyType" ADD CONSTRAINT "PolicyType_typeId_fkey" 
  FOREIGN KEY ("typeId") REFERENCES "Type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

COMMENT ON TABLE "PolicyType" IS 'Policy와 Type의 Many-to-Many 관계';

-- ============================================
-- 11. Attribute 테이블 (공통 속성 정의)
-- ============================================
CREATE TABLE "Attribute" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "description" TEXT,
  "attrType" "AttrType" NOT NULL,
  "isRequired" BOOLEAN NOT NULL DEFAULT false,
  "defaultValue" TEXT,
  "validation" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Attribute_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Attribute_name_key" UNIQUE ("name")
);

CREATE INDEX "Attribute_name_idx" ON "Attribute"("name");

-- ============================================
-- 12. TypeAttribute 테이블 (Type-Attribute 연결)
-- ============================================
CREATE TABLE "TypeAttribute" (
  "id" TEXT NOT NULL,
  "typeId" TEXT NOT NULL,
  "attributeId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TypeAttribute_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "TypeAttribute_typeId_attributeId_key" UNIQUE ("typeId", "attributeId")
);

CREATE INDEX "TypeAttribute_typeId_idx" ON "TypeAttribute"("typeId");
CREATE INDEX "TypeAttribute_attributeId_idx" ON "TypeAttribute"("attributeId");

ALTER TABLE "TypeAttribute" ADD CONSTRAINT "TypeAttribute_typeId_fkey" 
  FOREIGN KEY ("typeId") REFERENCES "Type"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TypeAttribute" ADD CONSTRAINT "TypeAttribute_attributeId_fkey" 
  FOREIGN KEY ("attributeId") REFERENCES "Attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================
-- 13. BusinessObject 테이블 (비즈니스 객체 인스턴스)
-- ============================================
CREATE TABLE "BusinessObject" (
  "id" TEXT NOT NULL,
  -- Type 참조 (스키마 정의용)
  "typeId" TEXT,
  "name" TEXT,
  "revision" TEXT,
  -- 기본 속성 (표준)
  "policyId" TEXT NOT NULL,
  "currentState" TEXT NOT NULL,
  "description" TEXT,
  "owner" TEXT,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  -- 사용자 정의 데이터
  "data" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BusinessObject_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "BusinessObject_typeId_name_revision_key" 
    UNIQUE ("typeId", "name", "revision")
);

CREATE INDEX "BusinessObject_typeId_idx" ON "BusinessObject"("typeId");
CREATE INDEX "BusinessObject_policyId_idx" ON "BusinessObject"("policyId");
CREATE INDEX "BusinessObject_currentState_idx" ON "BusinessObject"("currentState");
CREATE INDEX "BusinessObject_owner_idx" ON "BusinessObject"("owner");
CREATE INDEX "BusinessObject_createdBy_idx" ON "BusinessObject"("createdBy");
CREATE INDEX "BusinessObject_createdAt_idx" ON "BusinessObject"("createdAt" DESC);  -- ORDER BY 성능 최적화
CREATE INDEX "BusinessObject_typeId_policyId_name_revision_idx" 
  ON "BusinessObject"("typeId", "policyId", "name", "revision");

ALTER TABLE "BusinessObject" ADD CONSTRAINT "BusinessObject_typeId_fkey" 
  FOREIGN KEY ("typeId") REFERENCES "Type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "BusinessObject" ADD CONSTRAINT "BusinessObject_policyId_fkey" 
  FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

COMMENT ON TABLE "BusinessObject" IS '비즈니스 객체 인스턴스 (Type의 스키마 정의에 맞춰 data 필드에 JSON 저장)';
COMMENT ON COLUMN "BusinessObject"."typeId" IS 'Type 참조 (스키마 정의용)';
COMMENT ON COLUMN "BusinessObject"."name" IS '비즈니스 객체 이름 (예: 송장-2025-001)';
COMMENT ON COLUMN "BusinessObject"."revision" IS '리비전 (예: A, B, C)';
COMMENT ON COLUMN "BusinessObject"."owner" IS '소유자 (auth.users.id)';
COMMENT ON COLUMN "BusinessObject"."createdBy" IS '생성자 (auth.users.id)';
COMMENT ON COLUMN "BusinessObject"."updatedBy" IS '수정자 (auth.users.id)';
COMMENT ON COLUMN "BusinessObject"."data" IS '사용자 정의 데이터 (JSON) - Type/Attribute 스키마에 맞춰 저장';

-- ============================================
-- 13. Relationship Management (EAV 패턴)
-- ============================================

-- RelationshipCardinality Enum
CREATE TYPE "RelationshipCardinality" AS ENUM ('ONE_TO_ONE', 'ONE_TO_MANY', 'MANY_TO_ONE', 'MANY_TO_MANY');

-- Relationship 테이블 (관계 정의)
CREATE TABLE "Relationship" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "fromTypeId" TEXT NOT NULL,
  "toTypeId" TEXT NOT NULL,
  "cardinality" "RelationshipCardinality" NOT NULL,
  "isRequired" BOOLEAN NOT NULL DEFAULT false,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  CONSTRAINT "Relationship_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Relationship_name_key" ON "Relationship"("name");
CREATE UNIQUE INDEX "Relationship_fromTypeId_toTypeId_name_key" ON "Relationship"("fromTypeId", "toTypeId", "name");
CREATE INDEX "Relationship_fromTypeId_idx" ON "Relationship"("fromTypeId");
CREATE INDEX "Relationship_toTypeId_idx" ON "Relationship"("toTypeId");
CREATE INDEX "Relationship_cardinality_idx" ON "Relationship"("cardinality");
CREATE INDEX "Relationship_isActive_idx" ON "Relationship"("isActive");

ALTER TABLE "Relationship" ADD CONSTRAINT "Relationship_fromTypeId_fkey" 
  FOREIGN KEY ("fromTypeId") REFERENCES "Type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Relationship" ADD CONSTRAINT "Relationship_toTypeId_fkey" 
  FOREIGN KEY ("toTypeId") REFERENCES "Type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

COMMENT ON TABLE "Relationship" IS 'Type 간 관계 정의 (EAV 패턴)';
COMMENT ON COLUMN "Relationship"."name" IS '관계 이름 (예: invoice_to_customer)';
COMMENT ON COLUMN "Relationship"."cardinality" IS '관계 카디널리티: ONE_TO_ONE, ONE_TO_MANY, MANY_TO_ONE, MANY_TO_MANY';
COMMENT ON COLUMN "Relationship"."isRequired" IS '필수 관계 여부';

-- RelationshipAttribute 테이블 (Relationship-Attribute 연결)
CREATE TABLE "RelationshipAttribute" (
  "id" TEXT NOT NULL,
  "relationshipId" TEXT NOT NULL,
  "attributeId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RelationshipAttribute_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RelationshipAttribute_relationshipId_attributeId_key" 
  ON "RelationshipAttribute"("relationshipId", "attributeId");
CREATE INDEX "RelationshipAttribute_relationshipId_idx" ON "RelationshipAttribute"("relationshipId");
CREATE INDEX "RelationshipAttribute_attributeId_idx" ON "RelationshipAttribute"("attributeId");

ALTER TABLE "RelationshipAttribute" ADD CONSTRAINT "RelationshipAttribute_relationshipId_fkey" 
  FOREIGN KEY ("relationshipId") REFERENCES "Relationship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RelationshipAttribute" ADD CONSTRAINT "RelationshipAttribute_attributeId_fkey" 
  FOREIGN KEY ("attributeId") REFERENCES "Attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

COMMENT ON TABLE "RelationshipAttribute" IS 'Relationship-Attribute 연결 (Many-to-Many)';

-- BusinessObjectRelationship 테이블 (실제 객체 간 관계)
CREATE TABLE "BusinessObjectRelationship" (
  "id" TEXT NOT NULL,
  "relationshipId" TEXT NOT NULL,
  "fromObjectId" TEXT NOT NULL,
  "toObjectId" TEXT NOT NULL,
  "data" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  CONSTRAINT "BusinessObjectRelationship_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BusinessObjectRelationship_relationshipId_fromObjectId_toOb_key" 
  ON "BusinessObjectRelationship"("relationshipId", "fromObjectId", "toObjectId");
CREATE INDEX "BusinessObjectRelationship_relationshipId_idx" ON "BusinessObjectRelationship"("relationshipId");
CREATE INDEX "BusinessObjectRelationship_fromObjectId_idx" ON "BusinessObjectRelationship"("fromObjectId");
CREATE INDEX "BusinessObjectRelationship_toObjectId_idx" ON "BusinessObjectRelationship"("toObjectId");

ALTER TABLE "BusinessObjectRelationship" ADD CONSTRAINT "BusinessObjectRelationship_relationshipId_fkey" 
  FOREIGN KEY ("relationshipId") REFERENCES "Relationship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "BusinessObjectRelationship" ADD CONSTRAINT "BusinessObjectRelationship_fromObjectId_fkey" 
  FOREIGN KEY ("fromObjectId") REFERENCES "BusinessObject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BusinessObjectRelationship" ADD CONSTRAINT "BusinessObjectRelationship_toObjectId_fkey" 
  FOREIGN KEY ("toObjectId") REFERENCES "BusinessObject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

COMMENT ON TABLE "BusinessObjectRelationship" IS '실제 BusinessObject 인스턴스 간의 관계';
COMMENT ON COLUMN "BusinessObjectRelationship"."data" IS '관계 속성 데이터 (JSON)';

-- ============================================
-- 14. updatedAt 자동 업데이트 트리거
-- ============================================

-- 트리거 함수 생성
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Policy 트리거
DROP TRIGGER IF EXISTS policy_updated_at_trigger ON "Policy";
CREATE TRIGGER policy_updated_at_trigger
  BEFORE UPDATE ON "Policy"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- State 트리거
DROP TRIGGER IF EXISTS state_updated_at_trigger ON "State";
CREATE TRIGGER state_updated_at_trigger
  BEFORE UPDATE ON "State"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Role 트리거
DROP TRIGGER IF EXISTS role_updated_at_trigger ON "Role";
CREATE TRIGGER role_updated_at_trigger
  BEFORE UPDATE ON "Role"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Group 트리거
DROP TRIGGER IF EXISTS group_updated_at_trigger ON "Group";
CREATE TRIGGER group_updated_at_trigger
  BEFORE UPDATE ON "Group"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Permission 트리거
DROP TRIGGER IF EXISTS permission_updated_at_trigger ON "Permission";
CREATE TRIGGER permission_updated_at_trigger
  BEFORE UPDATE ON "Permission"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- UserPermission 트리거
DROP TRIGGER IF EXISTS user_permission_updated_at_trigger ON "UserPermission";
CREATE TRIGGER user_permission_updated_at_trigger
  BEFORE UPDATE ON "UserPermission"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Type 트리거
DROP TRIGGER IF EXISTS type_updated_at_trigger ON "Type";
CREATE TRIGGER type_updated_at_trigger
  BEFORE UPDATE ON "Type"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- BusinessObject 트리거
DROP TRIGGER IF EXISTS business_object_updated_at_trigger ON "BusinessObject";
CREATE TRIGGER business_object_updated_at_trigger
  BEFORE UPDATE ON "BusinessObject"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Relationship 트리거
DROP TRIGGER IF EXISTS relationship_updated_at_trigger ON "Relationship";
CREATE TRIGGER relationship_updated_at_trigger
  BEFORE UPDATE ON "Relationship"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- BusinessObjectRelationship 트리거
DROP TRIGGER IF EXISTS business_object_relationship_updated_at_trigger ON "BusinessObjectRelationship";
CREATE TRIGGER business_object_relationship_updated_at_trigger
  BEFORE UPDATE ON "BusinessObjectRelationship"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 샘플 데이터 (선택적)
-- ============================================

-- 샘플 Policy
INSERT INTO "Policy" ("id", "name", "description", "revisionSequence", "isActive")
VALUES 
  ('policy1', '송장 관리 정책', '송장 문서의 생성, 승인, 처리를 관리하는 정책', 'A,B,C', true),
  ('policy2', '계약 관리 정책', '계약서 문서의 작성, 검토, 승인을 관리하는 정책', 'Draft,Review,Final', true);

-- 샘플 State (송장 정책)
INSERT INTO "State" ("id", "policyId", "name", "description", "order", "isInitial", "isFinal")
VALUES
  ('state1', 'policy1', 'draft', '초안', 1, true, false),
  ('state2', 'policy1', 'submitted', '제출됨', 2, false, false),
  ('state3', 'policy1', 'approved', '승인됨', 3, false, true);

-- 샘플 StateTransition
INSERT INTO "StateTransition" ("id", "fromStateId", "toStateId", "order")
VALUES
  ('trans1', 'state1', 'state2', 1),
  ('trans2', 'state2', 'state3', 2);

-- 샘플 Role
INSERT INTO "Role" ("id", "name", "description", "isActive")
VALUES
  ('role1', 'admin', '관리자', true),
  ('role2', 'manager', '매니저', true),
  ('role3', 'user', '일반 사용자', true);

-- 샘플 Group
INSERT INTO "Group" ("id", "name", "description", "isActive")
VALUES
  ('group1', 'accounting', '회계팀', true),
  ('group2', 'sales', '영업팀', true);

-- 샘플 Type (비즈니스 타입, 계층 구조)
INSERT INTO "Type" ("id", "name", "description", "prefix", "policyId")
VALUES
  ('type1', 'document', '문서', 'DOC', 'policy1'),
  ('type2', 'invoice', '일반 송장', 'INV', 'policy1'),
  ('type3', 'tax-invoice', '세금 계산서', 'TAX', 'policy1'),
  ('type4', 'contract', '계약서', 'CTR', 'policy2');

-- 계층 구조 설정 (invoice는 document의 자식)
UPDATE "Type" SET "parentId" = 'type1' WHERE "id" = 'type2';
UPDATE "Type" SET "parentId" = 'type2' WHERE "id" = 'type3';
UPDATE "Type" SET "parentId" = 'type1' WHERE "id" = 'type4';

-- 샘플 PolicyType (Policy-Type 관계)
INSERT INTO "PolicyType" ("id", "policyId", "typeId")
VALUES
  ('pt1', 'policy1', 'type1'),  -- 송장 관리 정책 - document
  ('pt2', 'policy1', 'type2'),  -- 송장 관리 정책 - invoice
  ('pt3', 'policy1', 'type3'),  -- 송장 관리 정책 - tax-invoice
  ('pt4', 'policy2', 'type4');  -- 계약 관리 정책 - contract

-- 샘플 Attribute (공통 속성 정의)
INSERT INTO "Attribute" ("id", "name", "label", "description", "attrType", "isRequired")
VALUES
  ('attr1', 'invoiceNumber', '송장 번호', '고유한 송장 식별 번호', 'STRING', true),
  ('attr2', 'customerName', '고객명', '송장을 받는 고객의 이름', 'STRING', true),
  ('attr3', 'totalAmount', '총 금액', '송장 총 금액 (원)', 'INTEGER', true),
  ('attr4', 'unitPrice', '단가', '개별 항목 단가', 'REAL', false),
  ('attr5', 'issueDate', '발행일', '송장 발행 날짜', 'DATE', true),
  ('attr6', 'dueDate', '마감일', '결제 마감 날짜', 'DATE', false),
  ('attr7', 'isPaid', '결제 완료', '결제 완료 여부', 'BOOLEAN', false),
  ('attr8', 'metadata', '메타데이터', '추가 정보 (JSON)', 'JSON', false);

-- 샘플 TypeAttribute (Type과 Attribute 연결)
INSERT INTO "TypeAttribute" ("id", "typeId", "attributeId")
VALUES
  ('ta1', 'type2', 'attr1'),  -- invoice - invoiceNumber
  ('ta2', 'type2', 'attr2'),  -- invoice - customerName
  ('ta3', 'type2', 'attr3'),  -- invoice - totalAmount
  ('ta4', 'type2', 'attr4'),  -- invoice - unitPrice
  ('ta5', 'type2', 'attr5'),  -- invoice - issueDate
  ('ta6', 'type2', 'attr6'),  -- invoice - dueDate
  ('ta7', 'type2', 'attr7'),  -- invoice - isPaid
  ('ta8', 'type2', 'attr8');  -- invoice - metadata

-- 샘플 BusinessObject (테스트용)
INSERT INTO "BusinessObject" ("id", "typeId", "name", "revision", "policyId", "currentState", "description", "owner", "createdBy", "data")
VALUES
  (
    'obj1', 
    'type2',               -- Type: invoice (일반 송장)
    'INV-2024-11-001',     -- Name
    'A',                   -- Revision
    'policy1', 
    'draft', 
    '2024년 11월 테스트 송장 (리비전 A)',
    'test-user-001',
    'test-user-001',
    '{"invoiceNumber": "INV-2024-001", "customerName": "ABC 주식회사", "totalAmount": 5000000, "unitPrice": 125000.5, "issueDate": "2024-11-01", "isPaid": false, "metadata": {"department": "Sales", "priority": "high"}}'::jsonb
  ),
  (
    'obj2',
    'type2',               -- Type: invoice (일반 송장)
    'INV-2024-11-002',     -- Name (자동 생성 형식)
    'A',                   -- Revision
    'policy1',
    'submitted',
    '2024년 11월 테스트 송장 (리비전 A)',
    'test-user-002',
    'test-user-002',
    '{"invoiceNumber": "INV-2024-002", "customerName": "XYZ 코퍼레이션", "totalAmount": 8500000, "issueDate": "2024-11-02", "isPaid": true}'::jsonb
  ),
  (
    'obj3',
    'type2',               -- Type: invoice (일반 송장)
    'INV-2024-11-002',     -- Name (동일)
    'B',                   -- Revision (다음 버전)
    'policy1',
    'approved',
    '2024년 11월 테스트 송장 (리비전 B - 수정본)',
    'test-user-002',
    'test-user-003',
    '{"invoiceNumber": "INV-2024-002-Rev", "customerName": "XYZ 코퍼레이션", "totalAmount": 9000000, "issueDate": "2024-11-02", "isPaid": true}'::jsonb
  );

-- 샘플 Relationship (Type 간 관계 정의)
INSERT INTO "Relationship" ("id", "name", "description", "fromTypeId", "toTypeId", "cardinality", "isRequired", "isActive")
VALUES
  (
    'rel1',
    'invoice_to_document',
    '송장-문서 관계 (일반 송장은 문서의 하위 타입)',
    'type2',  -- invoice (일반 송장)
    'type1',  -- document (문서)
    'MANY_TO_ONE',
    true,
    true
  ),
  (
    'rel2',
    'invoice_to_tax_invoice',
    '송장-세금계산서 관계 (일반 송장과 세금계산서의 연관)',
    'type2',  -- invoice (일반 송장)
    'type3',  -- tax-invoice (세금 계산서)
    'ONE_TO_MANY',
    false,
    true
  );

-- 샘플 RelationshipAttribute (관계에 속성 추가)
INSERT INTO "RelationshipAttribute" ("id", "relationshipId", "attributeId")
VALUES
  ('relattr1', 'rel1', 'attr1'),  -- invoice_to_document 관계에 invoiceNumber 속성
  ('relattr2', 'rel2', 'attr3');  -- invoice_to_tax_invoice 관계에 totalAmount 속성

-- 샘플 BusinessObjectRelationship (실제 객체 간 관계)
INSERT INTO "BusinessObjectRelationship" 
  ("id", "relationshipId", "fromObjectId", "toObjectId", "data", "createdBy")
VALUES
  (
    'objrel1',
    'rel1',
    'obj1',  -- 송장#1 (invoice 타입)
    'obj2',  -- 송장#2 (invoice 타입) - document 관계
    '{"since": "2024-11-01", "accountManager": "홍길동"}'::jsonb,
    'test-user-001'
  ),
  (
    'objrel2',
    'rel2',
    'obj2',  -- 송장#2 (invoice 타입)
    'obj3',  -- 송장#3 (invoice 타입, revision B) - tax-invoice 관계
    '{"quantity": 10, "lineNumber": 1}'::jsonb,
    'test-user-002'
  );

-- ============================================
-- 완료
-- ============================================

-- 생성된 테이블 확인
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'Policy', 'State', 'StateTransition', 
    'Role', 'Group', 'Permission',
    'Type', 'PolicyType', 'Attribute', 'TypeAttribute',
    'BusinessObject',
    'Relationship', 'RelationshipAttribute', 'BusinessObjectRelationship'
  )
ORDER BY tablename;

-- 샘플 데이터 확인
SELECT 'Policies' as table_name, COUNT(*) as count FROM "Policy"
UNION ALL
SELECT 'States', COUNT(*) FROM "State"
UNION ALL
SELECT 'Roles', COUNT(*) FROM "Role"
UNION ALL
SELECT 'Groups', COUNT(*) FROM "Group"
UNION ALL
SELECT 'Types', COUNT(*) FROM "Type"
UNION ALL
SELECT 'PolicyTypes', COUNT(*) FROM "PolicyType"
UNION ALL
SELECT 'Attributes', COUNT(*) FROM "Attribute"
UNION ALL
SELECT 'BusinessObjects', COUNT(*) FROM "BusinessObject"
UNION ALL
SELECT 'Relationships', COUNT(*) FROM "Relationship"
UNION ALL
SELECT 'RelationshipAttributes', COUNT(*) FROM "RelationshipAttribute"
UNION ALL
SELECT 'BusinessObjectRelationships', COUNT(*) FROM "BusinessObjectRelationship"
ORDER BY table_name;
