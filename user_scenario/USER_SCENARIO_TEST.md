# Team Workflow 사용자 시나리오 테스트

> **작성일**: 2025-11-02  
> **버전**: 2.0 (Policy System)  
> **테스트 대상**: Policy 기반 권한 관리 시스템

---

## 📋 목차

1. [시나리오 개요](#시나리오-개요)
2. [사전 준비](#사전-준비)
3. [시나리오 1: Policy 및 State 설정](#시나리오-1-policy-및-state-설정)
4. [시나리오 2: Type 및 Attribute 정의](#시나리오-2-type-및-attribute-정의)
5. [시나리오 3: 권한 설정](#시나리오-3-권한-설정)
6. [시나리오 4: BusinessObject 생성 및 관리](#시나리오-4-businessobject-생성-및-관리)
7. [시나리오 5: 다크모드 및 UI 테스트](#시나리오-5-다크모드-및-ui-테스트)
8. [테스트 결과 요약](#테스트-결과-요약)

---

## 시나리오 개요

### 비즈니스 목표
**송장 관리 시스템 구축**: 송장 문서의 생성부터 승인, 처리까지 전체 워크플로우를 Policy 기반으로 관리

### 주요 사용자
- **관리자**: 정책, 상태, 타입 정의
- **일반 사용자**: BusinessObject 생성 및 상태 전이
- **승인자**: 권한에 따라 승인/반려

### 시스템 구성 요소
1. **Policy**: 송장 관리 정책 (리비전 A,B,C)
2. **State**: Draft → Review → Approved → Processed
3. **Type**: invoice (송장 타입)
4. **Attribute**: invoiceNumber, customerName, amount
5. **Permission**: Role/Group/User별 CRUD 권한
6. **BusinessObject**: 실제 송장 인스턴스

---

## 사전 준비

### 1. 애플리케이션 접속
```
URL: http://localhost:3000
```

**✅ 확인사항:**
- [ ] 로그인 페이지 정상 표시
- [ ] OAuth 로그인 버튼 (Google, GitHub) 표시
- [ ] 이메일 OTP 로그인 가능
- [ ] 다크모드 토글 정상 작동

### 2. 관리자 로그인
```
이메일: admin@example.com
비밀번호: (설정된 비밀번호)
```

**✅ 확인사항:**
- [ ] 로그인 성공 후 `/dashboard` 리다이렉트
- [ ] 우측 상단에 프로필 아이콘 표시
- [ ] 프로필 클릭 시 이메일, 이름, 로그아웃 메뉴 표시

### 3. Admin 페이지 접근
```
URL: http://localhost:3000/admin
```

**✅ 확인사항:**
- [ ] 좌측 사이드바 표시
- [ ] "Team Workflow" 로고 + 텍스트 정렬
- [ ] 메뉴 항목 10개 + Help 메뉴
- [ ] 우측 상단 다크모드 토글 + 프로필 메뉴

---

## 시나리오 1: Policy 및 State 설정

### 1-1. Policy 생성

**목표**: 송장 관리 정책 생성

#### 단계
1. 사이드바에서 **"Policies"** 클릭
2. **"새 Policy 생성"** 버튼 클릭
3. Drawer가 오른쪽에서 슬라이드
4. 정보 입력:
   - **이름**: `송장_관리_정책`
   - **설명**: `송장 문서의 생성, 승인, 처리를 관리하는 정책`
   - **Revision Sequence**: `A,B,C`
   - **활성화**: ✅ (체크)
5. **"저장"** 버튼 클릭

#### ✅ 검증 항목
- [ ] Drawer가 오른쪽에서 부드럽게 슬라이드
- [ ] 모든 입력 필드 정상 작동
- [ ] 저장 후 Drawer 자동 닫힘
- [ ] Policy 목록에 새 항목 표시
- [ ] Policy 이름이 unique (중복 입력 시 에러)

#### UI 스크린샷
```
[스크린샷 1-1-1] Policies 목록 페이지
[스크린샷 1-1-2] Policy 생성 Drawer (펼침 상태)
[스크린샷 1-1-3] Policy 생성 완료 후 목록
```

---

### 1-2. Type 검색 및 추가

**목표**: Policy에 Type 연결 (Many-to-Many)

#### 단계
1. Policy 목록에서 **"수정"** 버튼 클릭
2. **"사용 가능한 Type (선택)"** 필드에 `inv` 입력
3. 검색 결과에서 `invoice` 타입 선택
4. 선택된 Type이 Badge로 표시
5. **"저장"** 버튼 클릭

#### ✅ 검증 항목
- [ ] 2글자 이상 입력 시 검색 시작
- [ ] 검색 결과 리스트 최대 높이 160px (스크롤)
- [ ] Type 선택 시 Badge로 표시
- [ ] Badge X 버튼으로 제거 가능
- [ ] 검색 중 포커스 유지 (깜박임 없음)
- [ ] 검색 결과 클릭 시 포커스 복원

#### UI 스크린샷
```
[스크린샷 1-2-1] Type 검색 입력
[스크린샷 1-2-2] Type 검색 결과 (스크롤)
[스크린샷 1-2-3] Type 선택 후 Badge 표시
```

---

### 1-3. State 생성

**목표**: 송장 워크플로우 상태 정의

#### 단계
1. 사이드바에서 **"States"** 클릭
2. **"새 State 생성"** 버튼 클릭 (4번 반복)

**State 1 - Draft (초안)**
- 이름: `Draft`
- 설명: `송장 초안 작성`
- Policy: `송장_관리_정책`
- 순서: `1`
- 초기 상태: ✅

**State 2 - Review (검토)**
- 이름: `Review`
- 설명: `송장 검토 중`
- Policy: `송장_관리_정책`
- 순서: `2`

**State 3 - Approved (승인)**
- 이름: `Approved`
- 설명: `송장 승인 완료`
- Policy: `송장_관리_정책`
- 순서: `3`

**State 4 - Processed (처리완료)**
- 이름: `Processed`
- 설명: `송장 처리 완료`
- Policy: `송장_관리_정책`
- 순서: `4`
- 최종 상태: ✅

#### ✅ 검증 항목
- [ ] Drawer 오른쪽 슬라이드
- [ ] Policy 선택 드롭다운 정상 작동
- [ ] 초기/최종 상태 체크박스 작동
- [ ] State 목록에 순서대로 표시
- [ ] 테이블 정렬: Policy → 순서

#### UI 스크린샷
```
[스크린샷 1-3-1] State 생성 Drawer
[스크린샷 1-3-2] State 목록 (4개 상태)
```

---

### 1-4. State Transition 정의

**목표**: State 간 전이 관계 설정

#### 단계
1. 사이드바에서 **"Transitions"** 클릭
2. **"새 Transition 생성"** 버튼 클릭 (3번 반복)

**Transition 1**
- From State: `Draft`
- To State: `Review`
- Condition: (없음)

**Transition 2**
- From State: `Review`
- To State: `Approved`
- Condition: `user.role === "Manager"`

**Transition 3**
- From State: `Approved`
- To State: `Processed`
- Condition: (없음)

#### ✅ 검증 항목
- [ ] From/To State 선택 드롭다운
- [ ] Condition 입력 (expression)
- [ ] Transition 목록 표시
- [ ] 중복 Transition 방지 (unique 제약)

#### UI 스크린샷
```
[스크린샷 1-4-1] Transition 생성 Drawer
[스크린샷 1-4-2] Transition 목록
```

---

## 시나리오 2: Type 및 Attribute 정의

### 2-1. Attribute 생성

**목표**: 송장의 공통 속성 정의

#### 단계
1. 사이드바에서 **"Attributes"** 클릭
2. **"새 공통 Attribute 생성"** 버튼 클릭 (3번 반복)

**Attribute 1 - 송장 번호**
- Key: `invoiceNumber`
- Label: `송장 번호`
- 설명: `고유 송장 식별 번호`
- 속성 타입: `STRING`
- 필수 항목: ✅

**Attribute 2 - 고객명**
- Key: `customerName`
- Label: `고객명`
- 설명: `송장 발행 대상 고객`
- 속성 타입: `STRING`
- 필수 항목: ✅

**Attribute 3 - 금액**
- Key: `amount`
- Label: `금액`
- 설명: `송장 총액 (원)`
- 속성 타입: `INTEGER`
- 필수 항목: ✅

#### ✅ 검증 항목
- [ ] Key는 수정 불가 (생성 후)
- [ ] AttrType 선택 (STRING, INTEGER, REAL, DATE, BOOLEAN, JSON, ENUM)
- [ ] 필수 항목 체크박스
- [ ] Attribute 목록 정렬 (key 기준)

#### UI 스크린샷
```
[스크린샷 2-1-1] Attribute 생성 Drawer
[스크린샷 2-1-2] Attribute 목록
```

---

### 2-2. Type 생성 및 Attribute 연결

**목표**: invoice 타입 생성 및 속성 할당

#### 단계
1. 사이드바에서 **"Types"** 클릭
2. **"새 Type 생성"** 버튼 클릭
3. 정보 입력:
   - **Type**: `invoice`
   - **Name**: `송장`
   - **Prefix**: `INV`
   - **설명**: `송장 문서 타입`
   - **Policy**: `송장_관리_정책` (리비전 A,B,C)
   - **Parent Type**: (없음)
4. **"저장"** 버튼 클릭
5. Type 목록에서 `invoice` 클릭 (상세 페이지)
6. **"Attribute 추가"** 버튼 클릭
7. `invoiceNumber`, `customerName`, `amount` 추가

#### ✅ 검증 항목
- [ ] Type은 unique (중복 방지)
- [ ] Prefix, Name 상속 (Parent가 있으면)
- [ ] Policy 선택 시 revisionSequence 표시
- [ ] Type 상세 페이지 정상 표시
- [ ] Attribute 추가/제거 기능
- [ ] Type 목록 테이블:
  - [ ] 컬럼 리사이즈
  - [ ] 텍스트 ellipsis
  - [ ] Parent 컬럼 툴팁

#### UI 스크린샷
```
[스크린샷 2-2-1] Type 생성 Drawer
[스크린샷 2-2-2] Type 목록 (테이블)
[스크린샷 2-2-3] Type 상세 페이지
[스크린샷 2-2-4] Attribute 추가 UI
```

---

## 시나리오 3: 권한 설정

### 3-1. Role 및 Group 생성

**목표**: 역할 및 그룹 정의

#### 단계

**Role 생성**
1. 사이드바에서 **"Roles"** 클릭
2. **"새 Role 생성"** 버튼 클릭 (2번)

**Role 1 - Manager**
- 이름: `Manager`
- 설명: `관리자 역할 (승인 권한)`
- 활성화: ✅

**Role 2 - Staff**
- 이름: `Staff`
- 설명: `일반 직원 (생성/조회 권한)`
- 활성화: ✅

**Group 생성**
3. 사이드바에서 **"Groups"** 클릭
4. **"새 Group 생성"** 버튼 클릭

**Group - Accounting**
- 이름: `Accounting`
- 설명: `회계팀`
- 부모 그룹: (없음)
- 활성화: ✅

#### ✅ 검증 항목
- [ ] Role/Group Drawer 정상 작동
- [ ] 활성화 체크박스
- [ ] Group 계층 구조 (Parent 선택)
- [ ] 목록 테이블 표시

#### UI 스크린샷
```
[스크린샷 3-1-1] Role 생성 Drawer
[스크린샷 3-1-2] Role 목록
[스크린샷 3-1-3] Group 생성 Drawer
[스크린샷 3-1-4] Group 목록
```

---

### 3-2. Permission 설정

**목표**: State별 권한 정의

#### 단계
1. 사이드바에서 **"Permissions"** 클릭
2. **"새 Permission 생성"** 버튼 클릭 (여러 번)

**Permission 1 - Draft State (Staff)**
- State: `Draft`
- Resource: `invoice`
- Action: `create`
- Target Type: `role`
- Role: `Staff`
- Expression: (없음)
- Allow: ✅

**Permission 2 - Review State (Manager)**
- State: `Review`
- Resource: `invoice`
- Action: `modify`
- Target Type: `role`
- Role: `Manager`
- Expression: `user.role === "Manager"`
- Allow: ✅

**Permission 3 - Approved State (Group)**
- State: `Approved`
- Resource: `invoice`
- Action: `view`
- Target Type: `group`
- Group: `Accounting`
- Expression: (없음)
- Allow: ✅

#### ✅ 검증 항목
- [ ] State 선택 드롭다운
- [ ] Resource, Action 입력
- [ ] Target Type 선택 (user/role/group)
- [ ] Role/Group 조건부 선택
- [ ] Expression 입력
- [ ] Permission 목록 필터링

#### UI 스크린샷
```
[스크린샷 3-2-1] Permission 생성 Drawer
[스크린샷 3-2-2] Permission 목록 (필터링)
```

---

## 시나리오 4: BusinessObject 생성 및 관리

### 4-1. BusinessObject 생성 (자동 리비전)

**목표**: 송장 인스턴스 생성 및 리비전 자동 할당

#### 단계
1. 사이드바에서 **"Business Objects"** 클릭
2. **"새 BusinessObject 생성"** 버튼 클릭
3. 정보 입력:
   - **Type**: `invoice` 선택
   - **Name**: `송장-2025-001` (또는 자동 생성)
   - **Description**: `ABC 주식회사 송장`
   - **Current State**: `Draft`
   - **Data 필드**:
     - `invoiceNumber`: `INV-2025-001`
     - `customerName`: `ABC 주식회사`
     - `amount`: `5000000`
4. **"저장"** 버튼 클릭

#### ✅ 검증 항목
- [ ] Type 선택 시 Policy 자동 할당
- [ ] Revision 자동 할당 (A)
- [ ] Name 자동 생성 (prefix-timestamp-random)
- [ ] Data 필드 JSON 편집
- [ ] BusinessObject 목록 표시:
  - [ ] Name (font-mono)
  - [ ] Revision (Badge)
  - [ ] Type (중첩 div: type + name)
  - [ ] Policy (중첩 div: name + revisionSequence)
  - [ ] State (Badge outline)
  - [ ] Owner (font-mono, 8글자 ellipsis)
  - [ ] Data 필드 개수
  - [ ] 생성일 (한국어 포맷)

#### UI 스크린샷
```
[스크린샷 4-1-1] BusinessObject 생성 Drawer
[스크린샷 4-1-2] BusinessObject 목록 (테이블)
[스크린샷 4-1-3] 긴 Name 텍스트 ellipsis 테스트
```

---

### 4-2. BusinessObject 리비전 순환

**목표**: 동일 Name으로 여러 리비전 생성

#### 단계
1. **"새 BusinessObject 생성"** 버튼 클릭 (2번 더)
2. 동일한 Name (`송장-2025-001`) 입력
3. 자동으로 리비전 B, C 할당 확인

#### ✅ 검증 항목
- [ ] 동일 Name + 다른 Revision 생성 가능
- [ ] Revision 순환: A → B → C → A...
- [ ] Policy의 revisionSequence 기준
- [ ] 테이블에서 리비전 구분 표시

#### UI 스크린샷
```
[스크린샷 4-2-1] 동일 Name, 다른 Revision (3개)
```

---

### 4-3. BusinessObject 상세 조회

**목표**: 상세 정보 확인

#### 단계
1. BusinessObject 목록에서 Name 클릭
2. 상세 페이지 표시
3. 모든 필드 확인:
   - Type, Policy, State
   - Data 필드 (JSON)
   - Owner, CreatedBy, UpdatedBy
   - 생성일, 수정일

#### ✅ 검증 항목
- [ ] 상세 페이지 레이아웃
- [ ] Type, Policy 정보 표시
- [ ] Data 필드 JSON 뷰어
- [ ] 관계 데이터 정상 표시

#### UI 스크린샷
```
[스크린샷 4-3-1] BusinessObject 상세 페이지
```

---

## 시나리오 5: 다크모드 및 UI 테스트

### 5-1. 다크모드 전환

**목표**: 라이트/다크 모드 전환 테스트

#### 단계
1. 우측 상단 **Moon/Sun 아이콘** 클릭
2. 모든 페이지에서 색상 변경 확인
3. Design Template 페이지에서 색상 팔레트 확인

#### ✅ 검증 항목
- [ ] 아이콘 전환 (Moon ↔ Sun)
- [ ] 배경색 변경
- [ ] 텍스트 색상 변경
- [ ] Border 색상 변경
- [ ] Badge, Button 색상 정상
- [ ] 테이블 색상 정상
- [ ] Drawer 색상 정상

#### UI 스크린샷
```
[스크린샷 5-1-1] 라이트 모드 - Policy 목록
[스크린샷 5-1-2] 다크 모드 - Policy 목록
[스크린샷 5-1-3] 다크 모드 - Design Template 색상 팔레트
```

---

### 5-2. Design Template 컴포넌트 테스트

**목표**: 모든 UI 컴포넌트 확인

#### 단계
1. 사이드바 **Help** 메뉴 클릭
2. **Design Template** 하위 메뉴 클릭
3. 각 탭 순회:
   - **Buttons**: 모든 variants, sizes
   - **Inputs**: Input, Textarea, Select, Checkbox
   - **Badges**: Badge variants, Alert variants
   - **Tables**: BusinessObject 스타일 테이블
   - **Menus**: DropdownMenu, Pagination
   - **Dialogs**: Drawer 예제

#### ✅ 검증 항목
- [ ] 모든 탭 전환 정상
- [ ] 버튼 모든 variants 표시
- [ ] 입력 필드 정상 작동
- [ ] Badge 색상 구분
- [ ] 테이블 ScrollableTable:
  - [ ] 헤더 고정
  - [ ] 데이터 스크롤
  - [ ] 컬럼 리사이즈 (드래그)
  - [ ] 텍스트 ellipsis
  - [ ] hover 시 전체 텍스트 툴팁
- [ ] Drawer 열기/닫기
- [ ] Pagination 표시

#### UI 스크린샷
```
[스크린샷 5-2-1] Design Template - Buttons 탭
[스크린샷 5-2-2] Design Template - Inputs 탭
[스크린샷 5-2-3] Design Template - Badges 탭
[스크린샷 5-2-4] Design Template - Tables 탭 (컬럼 리사이즈 테스트)
[스크린샷 5-2-5] Design Template - Menus 탭
[스크린샷 5-2-6] Design Template - Dialogs 탭 (Drawer 열림)
```

---

### 5-3. 반응형 테스트

**목표**: 모바일/데스크톱 화면 크기 테스트

#### 단계
1. 브라우저 창 크기 조절 (< 1024px)
2. 사이드바 자동 숨김 확인
3. 햄버거 메뉴 버튼 표시
4. 사이드바 열기/닫기
5. 오버레이 클릭 시 닫힘

#### ✅ 검증 항목
- [ ] Desktop (≥ 1024px): 사이드바 펼침/접기
- [ ] Mobile (< 1024px): 사이드바 자동 숨김
- [ ] 햄버거 메뉴 정상 작동
- [ ] 오버레이 배경 클릭 시 닫힘
- [ ] 메뉴 클릭 시 자동 닫힘

#### UI 스크린샷
```
[스크린샷 5-3-1] Desktop - 사이드바 펼침
[스크린샷 5-3-2] Desktop - 사이드바 접힘
[스크린샷 5-3-3] Mobile - 사이드바 숨김
[스크린샷 5-3-4] Mobile - 사이드바 오버레이
```

---

### 5-4. 테이블 UI 고급 기능

**목표**: ScrollableTable 모든 기능 테스트

#### 단계
1. Types 목록 페이지
2. 테스트 항목:
   - **가로 스크롤**: 테이블 넓이 조절
   - **세로 스크롤**: 많은 데이터 표시
   - **컬럼 리사이즈**: 각 컬럼 우측 드래그
   - **텍스트 ellipsis**: 긴 텍스트 말줄임표
   - **Hover 툴팁**: 전체 텍스트 표시 (네이티브)
   - **Sticky 헤더**: 스크롤 시 헤더 고정

#### ✅ 검증 항목
- [ ] 헤더와 데이터 컬럼 너비 일치
- [ ] 헤더 고정, 데이터만 스크롤
- [ ] 컬럼 드래그 리사이즈 (최소 50px)
- [ ] 긴 텍스트 ellipsis (`...`)
- [ ] hover 시 title 속성으로 전체 표시
- [ ] 중첩 div (Type, Policy 컬럼) ellipsis
- [ ] code, span 태그도 ellipsis 적용
- [ ] 행 높이 고정 (48px)

#### UI 스크린샷
```
[스크린샷 5-4-1] 테이블 기본 상태
[스크린샷 5-4-2] 컬럼 리사이즈 진행 중
[스크린샷 5-4-3] 텍스트 ellipsis (Before hover)
[스크린샷 5-4-4] Hover 툴팁 (After hover)
[스크린샷 5-4-5] 스크롤 시 헤더 고정
```

---

## 시나리오 6: Policy 삭제 제약 테스트

### 6-1. 종속 데이터 있을 때 삭제 시도

**목표**: Policy 삭제 제약 확인

#### 단계
1. Policies 페이지
2. `송장_관리_정책` 삭제 버튼 클릭
3. 삭제 Dialog 표시
4. 종속 데이터 확인:
   - State: 4개
   - Type: 1개
   - BusinessObject: N개
5. **"삭제"** 버튼 비활성화 확인

#### ✅ 검증 항목
- [ ] 삭제 Dialog 표시
- [ ] 종속 데이터 개수 표시
- [ ] Alert (destructive variant) 표시:
  - [ ] "삭제 불가: 종속 데이터 존재"
  - [ ] State: N개 → 삭제 필요
  - [ ] Type: N개 → 삭제 또는 다른 Policy로 변경
  - [ ] BusinessObject: N개 → 삭제 또는 Type 변경
- [ ] 삭제 버튼 비활성화 (`disabled`)

#### UI 스크린샷
```
[스크린샷 6-1-1] Policy 삭제 Dialog (종속 데이터 존재)
[스크린샷 6-1-2] 삭제 버튼 비활성화
```

---

### 6-2. 종속 데이터 정리 후 삭제

**목표**: 정상적인 삭제 프로세스

#### 단계
1. BusinessObject 모두 삭제
2. Type 삭제 또는 다른 Policy로 변경
3. State 삭제
4. Policy 삭제 재시도
5. 삭제 버튼 활성화 확인
6. 삭제 성공

#### ✅ 검증 항목
- [ ] 종속 데이터 0개 시 삭제 버튼 활성화
- [ ] 삭제 성공
- [ ] Policy 목록에서 제거됨

#### UI 스크린샷
```
[스크린샷 6-2-1] 종속 데이터 없음 - 삭제 버튼 활성화
[스크린샷 6-2-2] 삭제 성공 후 목록
```

---

## 시나리오 7: 프로필 및 로그아웃

### 7-1. 프로필 메뉴

**목표**: 프로필 정보 확인 및 로그아웃

#### 단계
1. 우측 상단 **User 아이콘** 클릭
2. DropdownMenu 표시:
   - 이메일
   - 이름 (user_metadata.full_name)
   - 구분선
   - 로그아웃 메뉴
3. **"로그아웃"** 클릭
4. `/signin` 페이지로 리다이렉트

#### ✅ 검증 항목
- [ ] User 아이콘 클릭 시 DropdownMenu
- [ ] 이메일 표시
- [ ] 이름 표시 (없으면 "사용자")
- [ ] 로그아웃 메뉴 (LogOut 아이콘)
- [ ] 로그아웃 시 localStorage 정리
- [ ] 로그아웃 시 쿠키 삭제
- [ ] `/signin`으로 리다이렉트

#### UI 스크린샷
```
[스크린샷 7-1-1] 프로필 DropdownMenu (열림)
[스크린샷 7-1-2] 로그아웃 후 로그인 페이지
```

---

## 테스트 결과 요약

### 📊 전체 테스트 통계

| 카테고리 | 테스트 항목 | 통과 | 실패 | 비고 |
|---------|------------|------|------|------|
| Policy 관리 | 8 | - | - | Policy 생성, Type 검색, 삭제 제약 |
| State 관리 | 4 | - | - | State 생성, Transition |
| Type 관리 | 6 | - | - | Type 생성, Attribute 연결 |
| 권한 관리 | 4 | - | - | Role, Group, Permission |
| BusinessObject | 8 | - | - | 생성, 리비전, 상세 조회 |
| UI/UX | 12 | - | - | 다크모드, 반응형, 테이블 |
| **합계** | **42** | **-** | **-** | - |

### ✅ 주요 성공 기능
1. **Policy 기반 권한 관리**
   - Policy-Type Many-to-Many 관계
   - State 워크플로우 정의
   - Permission 설정

2. **리비전 자동 할당**
   - Policy의 revisionSequence 기반
   - 동일 Name, 다른 Revision
   - 순환 할당 (A → B → C → A)

3. **EAV 패턴 (JSON 방식)**
   - Type/Attribute 스키마 정의
   - BusinessObject.data에 JSON 저장
   - 유연한 속성 관리

4. **고급 테이블 UI**
   - ScrollableTable (헤더 고정)
   - 컬럼 리사이즈 (드래그)
   - 텍스트 ellipsis + hover 툴팁
   - 중첩 div ellipsis 지원

5. **다크모드**
   - next-themes 통합
   - 전체 앱 테마 전환
   - Tailwind CSS 변수 기반

6. **Drawer UI**
   - Dialog → Drawer 변경
   - 오른쪽 슬라이드
   - 헤더/푸터 고정, 내용 스크롤

### ❌ 알려진 이슈
(테스트 후 추가)

### 🔧 개선 제안
(테스트 후 추가)

---

## 📸 스크린샷 체크리스트

### 필수 캡처 화면 (42개)

#### Policy 관리 (8개)
- [ ] 1-1-1: Policy 목록
- [ ] 1-1-2: Policy 생성 Drawer
- [ ] 1-1-3: Policy 생성 완료
- [ ] 1-2-1: Type 검색 입력
- [ ] 1-2-2: Type 검색 결과
- [ ] 1-2-3: Type Badge 표시
- [ ] 6-1-1: Policy 삭제 제약 (종속 데이터)
- [ ] 6-2-1: Policy 삭제 성공

#### State 관리 (4개)
- [ ] 1-3-1: State 생성 Drawer
- [ ] 1-3-2: State 목록
- [ ] 1-4-1: Transition 생성 Drawer
- [ ] 1-4-2: Transition 목록

#### Type 관리 (6개)
- [ ] 2-2-1: Type 생성 Drawer
- [ ] 2-2-2: Type 목록 테이블
- [ ] 2-2-3: Type 상세 페이지
- [ ] 2-2-4: Attribute 추가 UI
- [ ] 2-1-1: Attribute 생성 Drawer
- [ ] 2-1-2: Attribute 목록

#### 권한 관리 (4개)
- [ ] 3-1-1: Role 생성 Drawer
- [ ] 3-1-2: Role 목록
- [ ] 3-1-3: Group 생성 Drawer
- [ ] 3-2-1: Permission 생성 Drawer

#### BusinessObject (8개)
- [ ] 4-1-1: BusinessObject 생성 Drawer
- [ ] 4-1-2: BusinessObject 목록
- [ ] 4-1-3: 긴 Name ellipsis
- [ ] 4-2-1: 동일 Name 다른 Revision
- [ ] 4-3-1: BusinessObject 상세 페이지
- [ ] 5-4-1: 테이블 기본 상태
- [ ] 5-4-3: 텍스트 ellipsis
- [ ] 5-4-4: Hover 툴팁

#### UI/UX (12개)
- [ ] 5-1-1: 라이트 모드
- [ ] 5-1-2: 다크 모드
- [ ] 5-1-3: 색상 팔레트
- [ ] 5-2-1~6: Design Template 각 탭 (6개)
- [ ] 5-3-1: Desktop 펼침
- [ ] 5-3-2: Desktop 접힘
- [ ] 5-3-3: Mobile 숨김
- [ ] 7-1-1: 프로필 메뉴

---

## 📝 테스트 실행 가이드

### 사전 준비
```bash
# 1. 데이터베이스 초기화
psql $DATABASE_URL -f prisma/init-v2.sql

# 2. Prisma Client 생성
npx prisma generate

# 3. 개발 서버 시작
npm run dev

# 4. 브라우저 접속
open http://localhost:3000
```

### 테스트 순서
1. **로그인** → 관리자 계정
2. **시나리오 1** → Policy/State 설정
3. **시나리오 2** → Type/Attribute 정의
4. **시나리오 3** → 권한 설정
5. **시나리오 4** → BusinessObject 생성
6. **시나리오 5** → UI 테스트
7. **시나리오 6** → 삭제 제약 테스트
8. **시나리오 7** → 프로필/로그아웃

### 스크린샷 저장
- **폴더**: `doc/screenshots/`
- **명명 규칙**: `{시나리오}-{단계}-{번호}.png`
  - 예: `1-1-1_policy-list.png`
  - 예: `5-2-4_table-resize.png`

---

## 🎯 다음 단계

### 테스트 완료 후
1. 모든 체크리스트 항목 확인
2. 스크린샷 캡처 (42개)
3. 발견된 이슈 문서화
4. 개선 제안 작성

### 시나리오 수정 요청 시
```
사용자 → 수정된 시나리오 제공
       ↓
AI → 시나리오 업데이트
    → 재테스트
    → 리포트 업데이트
```

---

## 📌 참고사항

### 데이터 초기화
```sql
-- 모든 데이터 삭제 (개발 환경)
TRUNCATE TABLE "BusinessObject", "TypeAttribute", "Type", "PolicyType", 
               "StateTransition", "Permission", "State", "Policy", 
               "Attribute", "UserRole", "UserGroup", "Role", "Group" 
CASCADE;

-- 초기 데이터 재생성
\i prisma/init-v2.sql
```

### 주요 제약 조건
- **Policy.name**: unique
- **Type.type**: unique
- **Attribute.key**: unique
- **State**: (policyId, name) unique
- **BusinessObject**: (typeId, name, revision) unique

### Expression 평가
- **사용**: Permission, StateTransition
- **엔진**: `new Function()` (개발용)
- **프로덕션**: Sandbox 환경 권장

---

**테스트 문서 버전**: 1.0  
**마지막 업데이트**: 2025-11-02

