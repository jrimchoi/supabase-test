# Postman 테스트 가이드

## 📥 Collection Import 방법

### 1. Postman 열기
- Postman 앱 실행 또는 웹 버전 접속 (https://www.postman.com/)

### 2. Collection Import
1. **Import** 버튼 클릭
2. **파일 업로드** 또는 **드래그 앤 드롭**
3. `postman/Policy-API-Collection.json` 파일 선택
4. **Import** 클릭

---

## 🔑 Admin 토큰 발급 방법

### 방법 1: Supabase Service Role Key 사용 (개발용 권장)

**장점**: 즉시 사용 가능, 모든 권한  
**단점**: 프로덕션에서는 절대 사용 금지

#### 1-1. Supabase Dashboard에서 키 복사
```
1. Supabase Dashboard 접속
2. Settings → API
3. Project API keys → service_role (secret) 복사
```

#### 1-2. Postman에서 설정
```
1. Collection 선택 (Policy 기반 권한 관리 API)
2. Variables 탭
3. token 값에 service_role 키 붙여넣기
4. Save
```

**⚠️ 주의**: Service Role Key는 모든 RLS를 우회하므로 개발용으로만 사용!

---

### 방법 2: Admin User 생성 후 JWT 토큰 발급

#### 2-1. Supabase SQL Editor에서 Admin User 생성

```sql
-- 1. Admin 이메일/비밀번호로 사용자 생성
-- Supabase Dashboard → SQL Editor에서 실행

-- 이미 auth.users에 사용자가 있다면 해당 사용자 ID 사용
-- 없다면 Supabase Auth UI에서 회원가입 먼저 진행

-- 예시: 기존 사용자 조회
SELECT id, email FROM auth.users;
```

#### 2-2. API로 로그인하여 토큰 받기

**Option A: 브라우저에서 로그인**
```
1. http://localhost:3000/signin 접속
2. Google/GitHub/Email로 로그인
3. 개발자 도구 (F12) → Application → Cookies
4. 'app_jwt' 쿠키 값 복사
```

**Option B: cURL로 토큰 받기**
```bash
# Email/Password 로그인
curl -X POST 'https://[YOUR-PROJECT-REF].supabase.co/auth/v1/token?grant_type=password' \
  -H "apikey: [YOUR-ANON-KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your-password"
  }'

# Response에서 access_token 복사
```

#### 2-3. Postman에 토큰 설정
```
1. Collection 선택
2. Variables 탭
3. token 값에 access_token 붙여넣기
4. Save
```

---

### 방법 3: Postman Pre-request Script (자동 토큰 갱신)

Collection의 **Pre-request Script**에 추가:

```javascript
// Supabase 자동 로그인 및 토큰 설정
const supabaseUrl = 'https://[YOUR-PROJECT-REF].supabase.co';
const supabaseAnonKey = '[YOUR-ANON-KEY]';
const email = 'admin@example.com';
const password = 'your-password';

// 기존 토큰이 없거나 만료되었으면 새로 발급
if (!pm.collectionVariables.get('token')) {
    pm.sendRequest({
        url: `${supabaseUrl}/auth/v1/token?grant_type=password`,
        method: 'POST',
        header: {
            'apikey': supabaseAnonKey,
            'Content-Type': 'application/json'
        },
        body: {
            mode: 'raw',
            raw: JSON.stringify({
                email: email,
                password: password
            })
        }
    }, (err, res) => {
        if (err) {
            console.error(err);
        } else {
            const token = res.json().access_token;
            pm.collectionVariables.set('token', token);
            console.log('Token refreshed:', token);
        }
    });
}
```

---

## 🧪 테스트 시나리오

### 1. Policy → State → Permission 생성

#### Step 1: Policy 생성
```
POST /api/policies
{
  "name": "문서 결재 정책",
  "description": "문서 결재 흐름"
}
```
→ 응답에서 `id` 복사 (예: `policy-123`)

#### Step 2: State 생성
```
POST /api/states
{
  "policyId": "policy-123",
  "name": "작성중",
  "order": 1,
  "isInitial": true
}
```
→ 응답에서 `id` 복사 (예: `state-456`)

#### Step 3: Role 생성
```
POST /api/roles
{
  "name": "Manager",
  "description": "관리자"
}
```
→ 응답에서 `id` 복사 (예: `role-789`)

#### Step 4: Permission 생성
```
POST /api/permissions
{
  "stateId": "state-456",
  "resource": "document",
  "action": "modify",
  "targetType": "role",
  "roleId": "role-789",
  "isAllowed": true
}
```

---

## 📊 Environment 설정 (선택사항)

### Local 환경
```json
{
  "baseUrl": "http://localhost:3000",
  "token": "[YOUR-TOKEN]"
}
```

### Production 환경
```json
{
  "baseUrl": "https://your-app.vercel.app",
  "token": "[YOUR-TOKEN]"
}
```

Postman에서:
1. **Environments** 클릭
2. **Create Environment** (Local, Production 각각 생성)
3. 상황에 맞게 환경 전환

---

## ⚠️ 주의사항

1. **Service Role Key**: 절대 프론트엔드나 Git에 노출하지 말 것
2. **토큰 만료**: JWT 토큰은 1시간 후 만료 (재발급 필요)
3. **CORS**: 로컬 테스트 시 Next.js 서버 실행 필수 (`npm run dev`)
4. **인증**: 현재 API는 인증 미들웨어 없음 (향후 추가 예정)

---

## 🔍 디버깅 팁

### 응답 확인
```javascript
// Tests 탭에 추가
pm.test("Status is 200", () => {
    pm.response.to.have.status(200);
});

pm.test("Success is true", () => {
    const json = pm.response.json();
    pm.expect(json.success).to.be.true;
});

// 응답 데이터 자동 저장
if (pm.response.json().success) {
    const data = pm.response.json().data;
    pm.collectionVariables.set('lastId', data.id);
}
```

### 로그 확인
- Postman Console (View → Show Postman Console)
- Next.js 서버 로그 (터미널)

---

## 📚 참고

- API 상세 문서: `API_GUIDE.md`
- Prisma Schema: `prisma/schema.prisma`
- 프로젝트 규칙: `.cursorrules`

