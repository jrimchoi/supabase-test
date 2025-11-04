# Database Migrations

## 버전 관리 규칙

### 버전 번호 체계
- **Major.Minor** 형식 (예: 2.0, 2.1, 2.2)
- **Major**: 큰 변경사항 (테이블 추가, 스키마 재구성)
- **Minor**: 작은 변경사항 (컬럼 추가, 인덱스 추가)

### 파일 네이밍
```
v{MAJOR}.{MINOR}_{description}.sql
```

**예시:**
- `v2.0_init_complete_schema.sql` - 초기 완전한 스키마
- `v2.1_add_owner_fields.sql` - owner 필드 추가
- `v2.2_add_profile_relations.sql` - Profile 관계 추가

### 마이그레이션 실행 순서

1. **Supabase SQL Editor에서 실행**
   ```bash
   # Supabase Dashboard → SQL Editor → New Query
   # 파일 내용 붙여넣기 → Run
   ```

2. **로컬 Prisma 업데이트**
   ```bash
   # 1. schema.prisma 수정
   # 2. Prisma Client 재생성
   npx prisma generate
   
   # 3. 타입 확인
   npm run type-check
   ```

3. **타입 파일 업데이트** (필요시)
   ```bash
   # src/types/*.ts 파일 업데이트
   # - Query 정의 수정
   # - Export 타입 추가
   ```

4. **빌드 테스트**
   ```bash
   npm run build
   ```

### 현재 버전

**v2.0** (2025-11-04)
- 초기 완전한 스키마
- Policy, State, Type, BusinessObject, Relationship 등 전체 테이블
- Profile 연동 (auth.users)

## 마이그레이션 체크리스트

새로운 마이그레이션 작성 시:

- [ ] SQL 파일 작성 (`v{version}_{description}.sql`)
- [ ] Supabase에서 실행 및 테스트
- [ ] `prisma/schema.prisma` 업데이트
- [ ] `npx prisma generate` 실행
- [ ] `src/types/*.ts` 업데이트 (필요시)
- [ ] 영향받는 컴포넌트 확인 및 수정
- [ ] `npm run build` 성공 확인
- [ ] Git 커밋
  ```bash
  git add supabase/migrations prisma/schema.prisma src/types
  git commit -m "feat: Add migration v{version} - {description}"
  ```
- [ ] Cursor Rules 업데이트 (주요 변경사항 시)

## 롤백 가이드

마이그레이션 롤백이 필요한 경우:

1. **Supabase에서 롤백 SQL 실행**
2. **schema.prisma 이전 버전으로 복원**
3. **Prisma generate 재실행**
4. **빌드 테스트**

## 참고 사항

- 모든 마이그레이션은 Supabase Dashboard에서 먼저 테스트
- 프로덕션 적용 전 개발 환경에서 충분히 검증
- 데이터 마이그레이션은 별도 스크립트로 작성
- 중요한 변경사항은 백업 후 진행

