# profiles 테이블 RLS 정책 수정 가이드

## 🎯 목적

관리자 페이지에서 **모든 사용자의 프로필**을 조회할 수 있도록 RLS 정책을 수정합니다.

---

## 🔧 변경 사항

### Before (기존 정책)
```sql
-- 본인 프로필만 조회 가능
CREATE POLICY "사용자는 본인 프로필만 조회 가능"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);
```

**문제**: 관리자가 다른 사용자의 프로필을 조회할 수 없음

---

### After (새 정책)
```sql
-- 인증된 사용자는 모든 프로필 조회 가능
CREATE POLICY "인증된 사용자는 모든 프로필 조회 가능"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);
```

**장점**:
- ✅ 관리자가 모든 사용자 조회 가능
- ✅ 인증된 사용자만 조회 가능 (보안 유지)
- ✅ UPDATE/DELETE는 여전히 본인 것만 가능

---

## 📝 실행 방법

### 1단계: Supabase SQL Editor 접속

1. https://supabase.com/dashboard 접속
2. 프로젝트 선택 (`ckujlkdumhhtjkinngjf`)
3. **SQL Editor** 메뉴 클릭
4. **New query** 클릭

---

### 2단계: SQL 복사 & 실행

`supabase/profiles-public-read.sql` 파일 내용을 복사해서 붙여넣고 **RUN** 클릭:

```sql
-- 기존 SELECT 정책 삭제
DROP POLICY IF EXISTS "사용자는 본인 프로필만 조회 가능" ON public.profiles;

-- 새로운 SELECT 정책: 인증된 사용자는 모든 프로필 조회 가능
CREATE POLICY "인증된 사용자는 모든 프로필 조회 가능"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);
```

---

### 3단계: 확인

SQL Editor에서 다음 쿼리로 확인:

```sql
-- 정책 확인
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

---

### 4단계: 브라우저에서 테스트

```
http://localhost:3000/admin/roles
→ Role 이름 클릭
→ ✅ 할당된 사용자 리스트 표시됨!
```

---

## 🔒 보안 고려사항

### ✅ 안전한 정책

| 작업 | 정책 | 설명 |
|------|------|------|
| **SELECT** | 모든 인증된 사용자 | ✅ 프로필 조회 가능 (읽기 전용) |
| **UPDATE** | 본인만 | ✅ 자기 프로필만 수정 |
| **INSERT** | 자동 (트리거) | ✅ 회원가입 시 자동 생성 |
| **DELETE** | 제한적 | ✅ 일반 사용자는 삭제 불가 |

### 📊 노출되는 정보

현재 SELECT에서 조회하는 필드:
- `id` - 사용자 ID
- `email` - 이메일
- `full_name` - 전체 이름
- `name` - 이름
- `avatar_url` - 프로필 이미지

**민감 정보는 포함되지 않음** (비밀번호, 인증 토큰 등은 `auth.users` 테이블에만 존재)

---

## 🚨 롤백 방법 (원래대로 되돌리기)

만약 다시 "본인만 조회 가능"으로 되돌리려면:

```sql
-- 새 정책 삭제
DROP POLICY IF EXISTS "인증된 사용자는 모든 프로필 조회 가능" ON public.profiles;

-- 기존 정책 복원
CREATE POLICY "사용자는 본인 프로필만 조회 가능"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);
```

---

## 🎯 실행 후 기대 결과

### Role 상세 페이지
```
✅ 할당된 사용자 (3)
  👤 test-user-1-xxx (test-user-1-xxx) [X]
  👤 test-user-2-xxx (test-user-2-xxx) [X]
  👤 test-user-3-xxx (test-user-3-xxx) [X]
```

### Group 상세 페이지
```
✅ 할당된 사용자 (3)
  👤 test-user-1-xxx (test-user-1-xxx) [X]
  👤 test-user-2-xxx (test-user-2-xxx) [X]
  👤 test-user-3-xxx (test-user-3-xxx) [X]
```

### 사용자 검색
```
🔍 [이메일, 이름으로 검색...]

검색 결과:
👤 i01020615591@gmail.com (i01020615591@gmail.com) [+]
```

---

## 📋 체크리스트

- [ ] Supabase SQL Editor 접속
- [ ] `supabase/profiles-public-read.sql` 파일 내용 복사
- [ ] SQL Editor에 붙여넣기
- [ ] **RUN** 클릭
- [ ] 정책 확인 쿼리 실행
- [ ] 브라우저 새로고침 (F5)
- [ ] Role/Group 상세 페이지에서 사용자 리스트 확인

---

**SQL 파일 위치**: `supabase/profiles-public-read.sql`

이 SQL을 Supabase SQL Editor에서 실행하면 즉시 해결됩니다! 🚀

