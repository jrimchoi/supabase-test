# 🚀 Postman 빠른 시작 가이드

## 1️⃣ Import Collection (30초)

### Postman에서:
1. **Import** 버튼 클릭
2. `postman/Policy-API-Collection.json` 파일 업로드
3. **Import** 클릭

---

## 2️⃣ Admin 토큰 발급 (3가지 방법 중 선택)

### ⚡ 방법 1: Service Role Key 사용 (가장 빠름 - 개발용)

```bash
# 1. Supabase Dashboard 접속
# 2. Settings → API → service_role 키 복사

# 3. Postman에서:
#    - Collection 선택
#    - Variables 탭
#    - token 값에 service_role 키 붙여넣기
#    - Save
```

**✅ 장점**: 즉시 사용, 모든 권한  
**⚠️ 주의**: 프로덕션에서 절대 사용 금지!

---

### 🔐 방법 2: 스크립트로 토큰 발급 (권장)

```bash
# 터미널에서 실행
./scripts/get-admin-token.sh

# 출력된 Access Token 복사하여 Postman Variables에 붙여넣기
```

---

### 🌐 방법 3: 브라우저 로그인

```bash
# 1. 개발 서버 실행
npm run dev

# 2. http://localhost:3000/signin 접속
# 3. 로그인
# 4. 개발자 도구 (F12) → Application → Cookies
# 5. 'app_jwt' 쿠키 값 복사
# 6. Postman Variables에 붙여넣기
```

---

## 3️⃣ 첫 API 테스트 (10초)

### Postman에서:
1. **1. Policy** 폴더 열기
2. **Policy 생성** 요청 클릭
3. **Send** 버튼 클릭

**예상 응답**:
```json
{
  "success": true,
  "data": {
    "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "name": "문서 결재 정책",
    "description": "문서 결재 흐름 관리",
    "isActive": true,
    "createdAt": "2024-11-01T...",
    "updatedAt": "2024-11-01T..."
  }
}
```

✅ **성공!** 이제 모든 API를 사용할 수 있습니다!

---

## 📝 자주 사용하는 API

### Policy 생성
```
POST /api/policies
Body: { "name": "정책명", "description": "설명" }
```

### State 생성
```
POST /api/states
Body: {
  "policyId": "policy-id",
  "name": "작성중",
  "order": 1,
  "isInitial": true
}
```

### Role 생성
```
POST /api/roles
Body: { "name": "Manager", "description": "관리자" }
```

### Permission 생성
```
POST /api/permissions
Body: {
  "stateId": "state-id",
  "resource": "document",
  "action": "modify",
  "targetType": "role",
  "roleId": "role-id"
}
```

---

## 🔍 문제 해결

### ❌ "Cannot GET /api/policies"
→ Next.js 서버가 실행 중인지 확인: `npm run dev`

### ❌ 401 Unauthorized
→ token 값이 올바른지 확인 (Collection Variables)

### ❌ 500 Internal Server Error
→ Prisma Client 생성 확인: `npx prisma generate`  
→ 데이터베이스 테이블 생성 확인 (Supabase Table Editor)

### ❌ CORS Error
→ 브라우저가 아닌 Postman에서 테스트 (CORS 무관)

---

## 📚 더 알아보기

- **상세 가이드**: `postman/README.md`
- **API 문서**: `API_GUIDE.md`
- **스키마 정의**: `prisma/schema.prisma`

---

**Happy Testing! 🎉**

