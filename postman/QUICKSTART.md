# Postman Collection 빠른 시작 가이드

5분 안에 모든 API를 테스트할 수 있습니다! 🚀

## 1️⃣ 준비하기 (1분)

### Postman 설치
- [Postman 다운로드](https://www.postman.com/downloads/)
- 또는 웹 버전 사용: [Postman Web](https://web.postman.co/)

### 서버 실행
```bash
npm run dev
# 또는
npm start
```

서버가 `http://localhost:3000`에서 실행 중인지 확인!

## 2️⃣ Import 하기 (30초)

### Collection Import
1. Postman 열기
2. 좌측 상단 `Import` 버튼 클릭
3. `postman/Complete-API-Collection.json` 파일 선택
4. `Import` 클릭

### Environment Import
1. 다시 `Import` 버튼 클릭
2. `postman/Complete-Environment.json` 파일 선택
3. `Import` 클릭

## 3️⃣ Environment 설정 (10초)

1. 우측 상단 Environment 드롭다운 클릭
2. `Complete Environment` 선택
3. ✅ 설정 완료!

## 4️⃣ 첫 API 테스트 (30초)

### 테스트 1: Policies 조회
```
1. 좌측 "Policies" 폴더 펼치기
2. "List Policies" 클릭
3. 파란색 "Send" 버튼 클릭
4. ✅ 200 OK 응답 확인!
```

### 테스트 2: Policy 생성
```
1. "Create Policy" 클릭
2. Body 탭에서 샘플 데이터 확인
3. "Send" 버튼 클릭
4. ✅ 201 Created 확인!
```

## 5️⃣ 실전 워크플로우 (3분)

### 완전한 시스템 설정하기

#### Step 1: Policy 생성
```http
POST /api/policies
```
샘플 데이터가 이미 있음 → Send!

**응답에서 `id` 복사** → Environment의 `policyId`에 저장

#### Step 2: State 생성 (Draft)
```http
POST /api/states
```
Body에서 `policyId`를 `{{policyId}}`로 변경 → Send!

**응답에서 `id` 복사** → `stateId`에 저장

#### Step 3: Type 생성
```http
POST /api/types
```
Body에서 `policyId` 수정 → Send!

**응답에서 `id` 복사** → `typeId`에 저장

#### Step 4: Attribute 생성
```http
POST /api/attributes
```
샘플 데이터 그대로 → Send!

#### Step 5: Business Object 생성
```http
POST /api/business-objects
```
Body에서 `typeId`, `policyId` 수정 → Send!

**🎉 완료! 전체 시스템이 설정되었습니다!**

## 6️⃣ 자주 사용하는 패턴

### 패턴 1: 목록 조회 + 필터링
```
GET /api/business-objects?typeId={{typeId}}&currentState=Draft
```

### 패턴 2: ID로 조회
```
GET /api/business-objects/:id
```
URL에서 `:id`를 실제 ID로 변경

### 패턴 3: 수정
```
PUT /api/business-objects/:id
```
Body에서 수정할 필드만 전송

### 패턴 4: 삭제
```
DELETE /api/business-objects/:id
```

## 💡 프로 팁

### 팁 1: Environment 변수 자동 저장
Tests 탭에서:
```javascript
pm.environment.set("policyId", pm.response.json().data.id);
```

### 팁 2: Collection Runner 사용
```
1. Collection 우클릭
2. "Run collection" 선택
3. 순차 실행으로 전체 워크플로우 테스트
```

### 팁 3: 빠른 복사
- Response에서 JSON 우클릭 → Copy value
- 다른 Request Body에 붙여넣기

### 팁 4: 여러 환경 설정
```
Complete Environment (복제)
→ Development Environment
→ Production Environment
```

## 📊 샘플 데이터 치트시트

### Policy
```json
{
  "name": "My Policy",
  "version": 1,
  "revisionSequence": "A,B,C",
  "isActive": true
}
```

### State
```json
{
  "name": "Draft",
  "policyId": "{{policyId}}",
  "order": 1,
  "isInitial": true
}
```

### Business Object
```json
{
  "typeId": "{{typeId}}",
  "policyId": "{{policyId}}",
  "currentState": "Draft",
  "data": {
    "field1": "value1",
    "field2": 123
  }
}
```

## 🎯 다음 단계

### 권한 시스템 테스트
```
1. Roles > Create Role
2. Groups > Create Group
3. Permissions > Create Permission
4. User Roles > Create User Role
```

### 관계 시스템 테스트
```
1. Relationships > Create Relationship (Type 간)
2. Business Relations > Create Business Relation (Object 간)
```

### 고급 기능
```
1. State Transitions - 워크플로우 정의
2. Permissions - Expression 기반 권한
3. Query Test - SQL 실행 및 성능 측정
```

## 🐛 문제 해결

### ❌ 401 Unauthorized
```
Solution: Auth > Set Session Cookie 실행
```

### ❌ 404 Not Found
```
Solution: URL의 ID 확인 또는 Environment 변수 확인
```

### ❌ 400 Bad Request
```
Solution: Body의 JSON 형식 확인
        필수 필드 확인 (typeId, policyId 등)
```

### ❌ 500 Internal Server Error
```
Solution: 서버 로그 확인
        터미널에서 에러 메시지 확인
```

## 📚 더 알아보기

- 📖 [COMPLETE_API_GUIDE.md](./COMPLETE_API_GUIDE.md) - 전체 API 레퍼런스
- 📖 [README.md](./README.md) - 전체 개요
- 🔗 [프로젝트 문서](../docs/)

## 🎓 학습 경로

### 초급 (방금 완료!)
✅ Collection Import  
✅ 첫 API 테스트  
✅ 기본 CRUD 이해  

### 중급 (다음 30분)
- [ ] 전체 워크플로우 실행
- [ ] Environment 변수 활용
- [ ] 필터링 및 페이징 사용

### 고급 (다음 1시간)
- [ ] State Transitions 설계
- [ ] Expression 기반 권한 설정
- [ ] Collection Runner 자동화
- [ ] Tests 스크립트 작성

---

**도움이 필요하신가요?**
- 💬 Issues 탭에서 질문
- 📧 팀에 문의
- 📖 가이드 문서 참고

**Happy Testing! 🚀**
