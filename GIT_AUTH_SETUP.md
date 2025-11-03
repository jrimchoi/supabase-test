# GitHub 인증 설정 가이드 (macOS)

## 🐛 에러

```bash
fatal: could not read Username for 'https://github.com': Device not configured
```

## 🚀 해결 방법 (3가지)

---

## 방법 1: GitHub CLI 사용 (가장 간단! ⭐)

### 1. GitHub CLI 설치
```bash
brew install gh
```

### 2. 로그인
```bash
gh auth login
```

**질문에 답변:**
```
? What account do you want to log into? 
→ GitHub.com

? What is your preferred protocol for Git operations?
→ HTTPS

? Authenticate Git with your GitHub credentials?
→ Yes

? How would you like to authenticate GitHub CLI?
→ Login with a web browser
```

### 3. 브라우저에서 인증
- 브라우저가 자동으로 열림
- GitHub 로그인
- Authorize 클릭

### 4. 완료!
```bash
# 이제 바로 푸시 가능
git push
```

---

## 방법 2: Personal Access Token (PAT)

### 1. GitHub에서 Token 생성

**GitHub 웹사이트:**
```
1. https://github.com/settings/tokens
2. "Generate new token" → "Generate new token (classic)"
3. Note: "Vercel Deploy Token"
4. Expiration: 90 days 또는 No expiration
5. Scopes 선택:
   ✅ repo (전체)
   ✅ workflow
6. "Generate token" 클릭
7. 토큰 복사 (ghp_xxxxxxxxxxxx)
```

### 2. Git에 저장

```bash
# macOS Keychain에 저장
git config --global credential.helper osxkeychain

# 푸시 시도
git push

# Username: (GitHub 사용자명 입력)
# Password: (복사한 Token 붙여넣기)
```

### 3. 완료!
- Keychain에 저장되어 다음부터는 자동

---

## 방법 3: SSH 키 사용

### 1. SSH 키 생성 (없는 경우)

```bash
# SSH 키 확인
ls -al ~/.ssh

# 없으면 생성
ssh-keygen -t ed25519 -C "your_email@example.com"

# Enter 3번 (기본값 사용)
```

### 2. SSH 키 복사

```bash
# macOS
cat ~/.ssh/id_ed25519.pub | pbcopy

# 또는 직접 출력
cat ~/.ssh/id_ed25519.pub
```

### 3. GitHub에 등록

**GitHub 웹사이트:**
```
1. https://github.com/settings/keys
2. "New SSH key" 클릭
3. Title: "MacBook Pro"
4. Key: (복사한 키 붙여넣기)
5. "Add SSH key" 클릭
```

### 4. Remote URL 변경

```bash
# HTTPS → SSH로 변경
git remote set-url origin git@github.com:jrimchoi/supabase-test.git

# 확인
git remote -v
```

### 5. SSH 테스트

```bash
ssh -T git@github.com
# "Hi jrimchoi! You've successfully authenticated"
```

### 6. 푸시

```bash
git push
```

---

## 방법 4: GitHub Desktop 사용 (GUI)

### 1. GitHub Desktop 설치
```
https://desktop.github.com/
```

### 2. 로그인
- File → Options → Accounts
- Sign in to GitHub.com

### 3. 저장소 열기
- File → Add Local Repository
- `/Users/jrchoi/Documents/GitHub/supabase-test` 선택

### 4. 푸시
- 상단 **Push origin** 버튼 클릭

---

## 🎯 권장 방법 (빠른 순서)

### 가장 빠름: GitHub CLI
```bash
brew install gh
gh auth login
# 브라우저에서 인증
git push
```

### 가장 쉬움: GitHub Desktop
```
1. 앱 설치
2. 로그인
3. 저장소 추가
4. Push 버튼 클릭
```

### 가장 안전: SSH
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
cat ~/.ssh/id_ed25519.pub | pbcopy
# GitHub에 등록
git remote set-url origin git@github.com:jrimchoi/supabase-test.git
git push
```

---

## 🔧 현재 상태 확인

```bash
# Remote URL 확인
git remote -v

# 결과:
# origin https://github.com/jrimchoi/supabase-test.git (fetch)
# origin https://github.com/jrimchoi/supabase-test.git (push)
```

HTTPS 방식을 사용 중이므로, **GitHub CLI** 또는 **Personal Access Token**이 필요합니다.

---

## 💡 추천 (1분 안에 해결!)

```bash
# GitHub CLI 설치 & 로그인
brew install gh
gh auth login

# 푸시
git push
```

완료! 🎉

---

## 🚨 급한 경우: Vercel에서 수동 재배포

GitHub 푸시 없이도 가능:

```
1. Vercel Dashboard
2. Deployments
3. 최신 배포 → ... → Redeploy
4. "Use existing Build Cache" 체크 해제
5. Redeploy
```

**단점:** 
- 다음 푸시 시 또 인증 문제 발생
- 근본적 해결은 위의 방법 필요

---

## ✅ 설정 후

```bash
# 테스트
git push

# 성공 메시지:
# Enumerating objects...
# Writing objects: 100%
# To https://github.com/jrimchoi/supabase-test.git
```

Vercel이 자동으로 재배포 시작! 🚀

