# 통합 테스트 DB 연결 오류 해결

## ❌ 오류

```
Error opening a TLS connection: bad certificate format
```

---

## 🔍 원인

`.env.local`에 **Pooler URL**이 저장되어 있음:
```
aws-1-ap-southeast-1.pooler.supabase.com:6543
```

Direct Connection은 다른 호스트를 사용해야 함!

---

## ✅ 해결 방법

### 1단계: Supabase Dashboard에서 Direct Connection URL 확인

1. Supabase Dashboard 접속
2. **Settings** → **Database**
3. **Connection String** 섹션
4. **Direct connection** 탭 선택
5. **Connection string** 복사

**예시**:
```
postgresql://postgres.ckujlkdumhhtjkinngjf:PASSWORD@db.ckujlkdumhhtjkinngjf.supabase.co:5432/postgres
```

---

### 2단계: `.env.local` 수정

#### Before (Pooler)
```bash
DATABASE_URL="postgresql://postgres.ckujlkdumhhtjkinngjf:JFU1hbZtGSvFspnM@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?schema=public&pgbouncer=true"
```

#### After (Direct Connection)
```bash
DATABASE_URL="postgresql://postgres.ckujlkdumhhtjkinngjf:JFU1hbZtGSvFspnM@db.ckujlkdumhhtjkinngjf.supabase.co:5432/postgres?schema=public"
```

**핵심 변경**:
- ✅ `pooler.supabase.com:6543` → `db.xxx.supabase.co:5432`
- ✅ `&pgbouncer=true` 제거

---

### 3단계: 통합 테스트 재실행

```bash
npm run test:integration
```

**예상 결과**:
```
✅ .env.local 로드 완료
📊 DB 연결: db.ckujlkdumhhtjkinngjf.supabase.co:5432
✅ Policy 생성 완료!
```

---

## 🎯 완료!

Direct Connection으로 변경하면 TLS 인증서 오류가 해결됩니다!

---

## 💡 참고: Pooler vs Direct Connection

| 항목 | Pooler | Direct Connection |
|------|--------|-------------------|
| **호스트** | `pooler.supabase.com` | `db.xxx.supabase.co` |
| **포트** | 6543 | 5432 |
| **용도** | Serverless, 다수 연결 | 직접 연결, 안정적 |
| **파라미터** | `pgbouncer=true` | 없음 |
| **TLS** | Transaction Pooling | 표준 TLS |
| **테스트** | ⚠️ 제한적 | ✅ 권장 |

**통합 테스트에는 Direct Connection을 사용하세요!**
