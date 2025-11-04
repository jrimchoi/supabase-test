-- Relationship 관련 테이블 존재 확인
SELECT 
    tablename,
    schemaname
FROM pg_tables
WHERE tablename IN (
    'Relationship',
    'RelationshipAttribute', 
    'BusinessObjectRelationship'
)
ORDER BY tablename;

-- Enum 타입 확인
SELECT 
    typname,
    enumlabel
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE typname = 'RelationshipCardinality'
ORDER BY enumlabel;
