# 사용자 리스트 표시 안 되는 문제 디버깅 가이드

## 🔍 문제 확인

### 증상
- `사용자 수: 3` (DB에 3명 할당됨)
- `할당된 사용자 (0)` (화면에는 0명 표시)
- "할당된 사용자가 없습니다" 메시지

---

## 📊 디버깅 방법

### 방법 1: 브라우저 콘솔 확인

1. **브라우저에서 F12 (개발자 도구) 열기**
2. **Console 탭** 선택
3. 페이지 새로고침 (F5)
4. 다음 로그 확인:

```
🎯 RoleDetail - role.users: [...]
🎯 RoleDetail - role._count.userRoles: 3
```

**질문**:
- `role.users` 배열이 비어있나요? `[]`
- 아니면 데이터가 있나요? `[{...}, {...}]`

---

### 방법 2: 터미널 로그 확인

`npm run dev`를 실행 중인 터미널에서 다음 로그 확인:

```
🔍 조회할 사용자 IDs: ['id1', 'id2', 'id3']
📊 Supabase 결과: [...]
❌ Supabase 에러: ...
✅ 최종 users 배열: ...
```

---

### 방법 3: Supabase에서 직접 확인

#### A. RLS 정책 확인

Supabase SQL Editor에서:

```sql
-- profiles 테이블의 SELECT 정책 확인
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'profiles'
  AND cmd = 'SELECT';
```

**예상 결과**:
```
policyname: "인증된 사용자는 모든 프로필 조회 가능"
cmd: "SELECT"
qual: "true"
```

만약 다른 결과가 나오면 SQL이 제대로 실행되지 않은 것입니다!

---

#### B. 실제 데이터 확인

Supabase SQL Editor에서:

```sql
-- UserRole 테이블에서 할당 확인
SELECT 
  ur.id,
  ur."userId",
  ur."roleId",
  r.name as role_name
FROM "UserRole" ur
JOIN "Role" r ON r.id = ur."roleId"
WHERE ur."roleId" = 'cmhg9iaxw0012dmbi4efmaxcq' -- 실제 Role ID로 변경
ORDER BY ur."createdAt" DESC;
```

**예상 결과**: 3개 행이 나와야 함

---

#### C. profiles 테이블 확인

```sql
-- profiles 테이블에 실제 사용자가 있는지 확인
SELECT id, email, full_name, name
FROM public.profiles
WHERE id IN (
  SELECT "userId" 
  FROM "UserRole" 
  WHERE "roleId" = 'cmhg9iaxw0012dmbi4efmaxcq'
);
```

**예상 결과**: 
- 3개 행이 나오면 → RLS 정책 문제
- 0개 행이 나오면 → profiles에 데이터가 없음 (test 사용자는 profiles에 없을 수 있음)

---

## 🎯 예상 문제 및 해결

### 문제 1: RLS 정책이 적용 안 됨

**확인**:
```sql
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

**해결**: SQL을 다시 실행
```sql
DROP POLICY IF EXISTS "사용자는 본인 프로필만 조회 가능" ON public.profiles;
CREATE POLICY "인증된 사용자는 모든 프로필 조회 가능"
ON public.profiles FOR SELECT TO authenticated USING (true);
```

---

### 문제 2: test 사용자는 profiles에 없음

**확인**: 
- `test-user-1-xxx`, `test-user-2-xxx`는 테스트용 ID
- 실제 Supabase `auth.users` 테이블에 없음
- 따라서 `profiles` 테이블에도 없음!

**해결**: 실제 로그인한 사용자를 Role에 할당해야 함

```sql
-- 현재 로그인한 사용자 확인
SELECT id, email FROM auth.users;

-- 실제 사용자 ID를 UserRole에 추가
INSERT INTO "UserRole" ("id", "userId", "roleId", "createdAt")
VALUES (
  gen_random_uuid()::text,
  '실제_사용자_ID',  -- auth.users.id
  'Role_ID',
  NOW()
);
```

---

### 문제 3: Supabase 쿼리 실패

**확인**: 브라우저 콘솔에서 `❌ Supabase 에러: ...` 확인

**가능한 에러**:
- RLS 정책 여전히 적용됨
- 네트워크 에러
- Supabase 인증 만료

**해결**:
1. 로그아웃 후 다시 로그인
2. RLS 정책 재확인
3. 브라우저 캐시 삭제

---

## 🧪 빠른 테스트

### 실제 로그인 사용자로 테스트

1. **현재 로그인한 사용자 ID 확인**:
   ```
   브라우저 콘솔에서:
   localStorage.getItem('app-auth')
   ```

2. **Supabase SQL Editor에서 할당**:
   ```sql
   -- 현재 로그인 사용자를 Developer Role에 할당
   INSERT INTO "UserRole" ("id", "userId", "roleId", "createdAt")
   SELECT 
     gen_random_uuid()::text,
     auth.uid(),  -- 현재 로그인 사용자
     'cmhg9iaxw0012dmbi4efmaxcq',  -- Developer Role ID
     NOW()
   WHERE NOT EXISTS (
     SELECT 1 FROM "UserRole" 
     WHERE "userId" = auth.uid() 
       AND "roleId" = 'cmhg9iaxw0012dmbi4efmaxcq'
   );
   ```

3. **브라우저 새로고침**:
   ```
   F5 → ✅ 자신이 표시되어야 함!
   ```

---

## 💡 핵심 요약

### 가장 가능성 높은 원인

**test 사용자(`test-user-1-xxx`)는 실제 Supabase auth.users에 없음!**

- ✅ Prisma의 `UserRole` 테이블에는 있음 (통합 테스트에서 생성)
- ❌ Supabase의 `profiles` 테이블에는 없음 (auth.users에 없어서)

**해결**:
1. 실제 로그인 사용자(`i01020615591@gmail.com`)를 Role에 할당
2. 또는 test 사용자를 실제로 auth.users에 생성

---

## 🎯 빠른 해결 (추천)

Supabase SQL Editor에서 실행:

```sql
-- 현재 로그인 사용자를 Developer Role에 할당
WITH current_user AS (
  SELECT id FROM auth.users WHERE email = 'i01020615591@gmail.com'
),
target_role AS (
  SELECT id FROM "Role" WHERE name LIKE '%Developer%' LIMIT 1
)
INSERT INTO "UserRole" ("id", "userId", "roleId", "createdAt")
SELECT 
  gen_random_uuid()::text,
  cu.id,
  tr.id,
  NOW()
FROM current_user cu, target_role tr
WHERE NOT EXISTS (
  SELECT 1 FROM "UserRole" 
  WHERE "userId" = cu.id AND "roleId" = tr.id
);
```

실행 후:
```
http://localhost:3000/admin/roles/[Role_ID]
→ 새로고침 (F5)
→ ✅ 자신(i01020615591@gmail.com)이 표시됨!
```

---

**먼저 브라우저 콘솔 로그(F12)를 확인해서 보여주세요!** 🔍

또는 터미널 로그를 복사해주시면 정확한 원인을 찾을 수 있습니다! 📊
