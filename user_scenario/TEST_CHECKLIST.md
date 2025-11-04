# Team Workflow 테스트 체크리스트

> **버전**: 1.0  
> **작성일**: 2025-11-02

---

## 🎯 빠른 테스트 가이드

### 1단계: 환경 설정
```bash
# DB 초기화
psql $DATABASE_URL -f prisma/init-v2.sql

# 서버 시작
npm run dev

# 브라우저 접속
open http://localhost:3000
```

### 2단계: 로그인
- [ ] 로그인 페이지 정상 표시
- [ ] OAuth 또는 Email로 로그인
- [ ] Dashboard로 리다이렉트

### 3단계: 핵심 기능 테스트 (10분)
- [ ] Policy 생성 → Type 검색/추가
- [ ] State 4개 생성 (Draft/Review/Approved/Processed)
- [ ] Type 생성 → Attribute 연결
- [ ] BusinessObject 생성 → 리비전 자동 할당
- [ ] 다크모드 전환

### 4단계: UI 테스트 (5분)
- [ ] 테이블 컬럼 리사이즈
- [ ] 텍스트 ellipsis hover
- [ ] Drawer 오른쪽 슬라이드
- [ ] 반응형 (모바일 화면)

---

## 📋 상세 체크리스트

### A. 인증 및 프로필 (7개)
- [ ] A-1: Google OAuth 로그인
- [ ] A-2: Email OTP 로그인
- [ ] A-3: Email/Password 로그인
- [ ] A-4: 프로필 메뉴 표시 (이메일, 이름)
- [ ] A-5: 로그아웃 기능
- [ ] A-6: 로그아웃 후 localStorage 정리
- [ ] A-7: 로그아웃 후 `/signin` 리다이렉트

### B. Policy 관리 (12개)
- [ ] B-1: Policy 목록 페이지 정상 표시
- [ ] B-2: Policy 생성 Drawer 오른쪽 슬라이드
- [ ] B-3: Policy 이름 unique 제약
- [ ] B-4: Revision Sequence 입력 (A,B,C)
- [ ] B-5: Type 검색 (2글자 이상)
- [ ] B-6: Type 검색 결과 스크롤 (max-h-160px)
- [ ] B-7: Type 선택 → Badge 표시
- [ ] B-8: Type 제거 (X 버튼)
- [ ] B-9: 검색 중 포커스 유지
- [ ] B-10: Policy 수정 기능
- [ ] B-11: Policy 삭제 제약 (종속 데이터)
- [ ] B-12: Policy 목록 테이블 정렬

### C. State 관리 (8개)
- [ ] C-1: State 목록 페이지
- [ ] C-2: State 생성 Drawer
- [ ] C-3: Policy 선택 드롭다운
- [ ] C-4: 순서 입력 (number)
- [ ] C-5: 초기 상태 체크박스
- [ ] C-6: 최종 상태 체크박스
- [ ] C-7: State 목록 Policy별 정렬
- [ ] C-8: State 수정/삭제

### D. StateTransition 관리 (4개)
- [ ] D-1: Transition 목록 페이지
- [ ] D-2: Transition 생성 Drawer
- [ ] D-3: From/To State 선택
- [ ] D-4: Condition (expression) 입력

### E. Type 관리 (10개)
- [ ] E-1: Type 목록 페이지
- [ ] E-2: Type 생성 Drawer (700px)
- [ ] E-3: Type unique 제약
- [ ] E-4: Prefix, Name 입력
- [ ] E-5: Policy 선택 (기본 Policy)
- [ ] E-6: Parent Type 선택 (계층 구조)
- [ ] E-7: Type 상세 페이지
- [ ] E-8: Attribute 추가 UI
- [ ] E-9: Attribute 제거 기능
- [ ] E-10: 부모로부터 prefix/name 상속

### F. Attribute 관리 (5개)
- [ ] F-1: Attribute 목록 페이지
- [ ] F-2: Attribute 생성 Drawer
- [ ] F-3: Key unique 제약
- [ ] F-4: AttrType 선택 (7가지)
- [ ] F-5: 필수 항목 체크박스

### G. 권한 관리 (8개)
- [ ] G-1: Role 목록 페이지
- [ ] G-2: Role 생성 Drawer
- [ ] G-3: Group 목록 페이지
- [ ] G-4: Group 생성 Drawer (계층 구조)
- [ ] G-5: Permission 목록 페이지
- [ ] G-6: Permission 생성 Drawer
- [ ] G-7: Target Type 선택 (user/role/group)
- [ ] G-8: Expression 입력

### H. BusinessObject 관리 (12개)
- [ ] H-1: BusinessObject 목록 페이지
- [ ] H-2: BusinessObject 생성 Drawer
- [ ] H-3: Type 선택 → Policy 자동 할당
- [ ] H-4: Name 자동 생성 (prefix-timestamp-random)
- [ ] H-5: Revision 자동 할당 (순환)
- [ ] H-6: Data 필드 JSON 입력
- [ ] H-7: BusinessObject 상세 페이지
- [ ] H-8: 동일 Name, 다른 Revision 생성
- [ ] H-9: 테이블 Name 컬럼 (font-mono)
- [ ] H-10: 테이블 Revision Badge
- [ ] H-11: 테이블 Type 중첩 div
- [ ] H-12: 테이블 Policy 중첩 div

### I. 테이블 UI (15개)
- [ ] I-1: ScrollableTable 헤더 고정
- [ ] I-2: 데이터만 세로 스크롤
- [ ] I-3: 가로 스크롤 (헤더+데이터 동기화)
- [ ] I-4: 컬럼 리사이즈 (우측 드래그)
- [ ] I-5: 리사이즈 최소 너비 50px
- [ ] I-6: 헤더-데이터 컬럼 너비 일치
- [ ] I-7: 텍스트 ellipsis (`...`)
- [ ] I-8: Hover 시 전체 텍스트 (title 속성)
- [ ] I-9: 중첩 div ellipsis (Type, Policy)
- [ ] I-10: code 태그 ellipsis
- [ ] I-11: span 태그 ellipsis
- [ ] I-12: 행 높이 고정 (48px)
- [ ] I-13: Pagination 표시
- [ ] I-14: 페이지 크기 선택 (10/20/50/100/전체)
- [ ] I-15: 페이지 이동 정상

### J. 다크모드 (8개)
- [ ] J-1: 다크모드 토글 아이콘 (Moon/Sun)
- [ ] J-2: 배경색 전환
- [ ] J-3: 텍스트 색상 전환
- [ ] J-4: Border 색상 전환
- [ ] J-5: Badge 색상 정상
- [ ] J-6: Button 색상 정상
- [ ] J-7: 테이블 색상 정상
- [ ] J-8: Drawer 색상 정상

### K. Drawer UI (6개)
- [ ] K-1: PolicyDialog → Drawer (600px)
- [ ] K-2: StateDialog → Drawer (500px)
- [ ] K-3: TypeDialog → Drawer (700px)
- [ ] K-4: Drawer 오른쪽 슬라이드
- [ ] K-5: Drawer 헤더/푸터 고정
- [ ] K-6: Drawer 내용 스크롤

### L. 반응형 (6개)
- [ ] L-1: Desktop (≥1024px) 사이드바 펼침/접기
- [ ] L-2: Mobile (<1024px) 사이드바 자동 숨김
- [ ] L-3: 햄버거 메뉴 표시
- [ ] L-4: 오버레이 배경
- [ ] L-5: 메뉴 클릭 시 자동 닫힘
- [ ] L-6: 창 크기 조절 감지

### M. Design Template (7개)
- [ ] M-1: Help 메뉴 → Design Template 하위 메뉴
- [ ] M-2: Buttons 탭 - 모든 variants
- [ ] M-3: Inputs 탭 - 모든 입력 필드
- [ ] M-4: Badges 탭 - Badge, Alert
- [ ] M-5: Tables 탭 - BusinessObject 스타일
- [ ] M-6: Menus 탭 - DropdownMenu, Pagination
- [ ] M-7: Dialogs 탭 - Drawer 예제

### N. 삭제 제약 (5개)
- [ ] N-1: Policy 삭제 시 종속 데이터 확인
- [ ] N-2: 종속 데이터 있으면 버튼 비활성화
- [ ] N-3: Alert 메시지 표시
- [ ] N-4: State 삭제 필요
- [ ] N-5: Type/BusinessObject 삭제 또는 변경 필요

---

## 📊 테스트 결과 기록

### 테스트 일시
- **시작**: ____년 __월 __일 __:__
- **종료**: ____년 __월 __일 __:__
- **소요 시간**: __분

### 테스트 환경
- **OS**: macOS / Windows / Linux
- **브라우저**: Chrome / Safari / Firefox
- **화면 크기**: ____px × ____px
- **다크모드**: Light / Dark

### 통과/실패
| 카테고리 | 항목 수 | 통과 | 실패 | 통과율 |
|---------|--------|------|------|--------|
| A. 인증 | 7 | - | - | -% |
| B. Policy | 12 | - | - | -% |
| C. State | 8 | - | - | -% |
| D. Transition | 4 | - | - | -% |
| E. Type | 10 | - | - | -% |
| F. Attribute | 5 | - | - | -% |
| G. 권한 | 8 | - | - | -% |
| H. BusinessObject | 12 | - | - | -% |
| I. 테이블 UI | 15 | - | - | -% |
| J. 다크모드 | 8 | - | - | -% |
| K. Drawer | 6 | - | - | -% |
| L. 반응형 | 6 | - | - | -% |
| M. Design Template | 7 | - | - | -% |
| N. 삭제 제약 | 5 | - | - | -% |
| **합계** | **113** | **-** | **-** | **-%** |

### 발견된 이슈
1. 
2. 
3. 

### 개선 제안
1. 
2. 
3. 

---

**테스트 담당자**: ___________  
**검토자**: ___________  
**승인**: ___________

