# Team Workflow 문서

> **프로젝트**: Team Workflow - Policy 기반 권한 관리 시스템  
> **버전**: 2.0  
> **마지막 업데이트**: 2025-11-02

---

## 📂 문서 구조

```
user_scenario/                  # 사용자 시나리오 및 테스트
├── README.md                   # 이 파일 (문서 개요)
├── USER_SCENARIO_TEST.md       # 사용자 시나리오 및 테스트 가이드
├── TEST_CHECKLIST.md           # 테스트 체크리스트 (113개 항목)
├── TEST_REPORT.md              # 테스트 결과 리포트 ⭐
├── UI_COMPONENTS.md            # UI 컴포넌트 가이드
└── screenshots/                # 테스트 스크린샷 폴더
    ├── 1-1-1_policy-list.png
    ├── 1-1-2_policy-drawer.png
    └── ... (42개 스크린샷)
```

---

## 📋 문서 요약

### 1. USER_SCENARIO_TEST.md
**사용자 시나리오 기반 테스트 가이드**

- **목적**: 실제 업무 시나리오로 전체 시스템 테스트
- **시나리오**: 송장 관리 시스템 구축
- **단계**: 7개 시나리오, 20개 세부 단계
- **스크린샷**: 42개 필수 캡처 화면

**주요 시나리오**:
1. Policy 및 State 설정
2. Type 및 Attribute 정의
3. 권한 설정 (Role, Group, Permission)
4. BusinessObject 생성 및 리비전 관리
5. 다크모드 및 UI 테스트
6. Policy 삭제 제약 테스트
7. 프로필 및 로그아웃

---

### 2. TEST_CHECKLIST.md
**상세 테스트 체크리스트**

- **목적**: 모든 기능의 세부 검증 항목
- **항목 수**: 113개
- **카테고리**: 14개 (A~N)
- **테스트 시간**: 약 30-40분

**주요 카테고리**:
- A. 인증 및 프로필 (7개)
- B. Policy 관리 (12개)
- C. State 관리 (8개)
- D. StateTransition 관리 (4개)
- E. Type 관리 (10개)
- F. Attribute 관리 (5개)
- G. 권한 관리 (8개)
- H. BusinessObject 관리 (12개)
- I. 테이블 UI (15개)
- J. 다크모드 (8개)
- K. Drawer UI (6개)
- L. 반응형 (6개)
- M. Design Template (7개)
- N. 삭제 제약 (5개)

---

### 3. TEST_REPORT.md ⭐
**자동화 테스트 결과 리포트**

- **목적**: 단위/통합 테스트 실행 결과
- **자동화 테스트**: 58개 (단위 51개 + 통합 7개)
- **통과율**: **100%** ✅
- **소요 시간**: 38.526초

**주요 내용**:
- 단위 테스트 결과 (API 엔드포인트)
- 통합 테스트 결과 (워크플로우 3개)
  - Policy Workflow (19초)
  - EAV Workflow (11초)
  - Revision Workflow (8초)
- 수동 테스트 가이드
- 성능 지표

### 4. UI_COMPONENTS.md
**UI 컴포넌트 레퍼런스**

- **목적**: shadcn/ui 및 커스텀 컴포넌트 사용법
- **컴포넌트**: 15개 shadcn + 3개 커스텀
- **Props 설명**: 각 컴포넌트별 Props
- **코드 예제**: 실제 사용 예시

**주요 내용**:
- shadcn/ui 컴포넌트 목록
- ScrollableTable 상세 가이드
- 컬러 시스템 (CSS 변수)
- 레이아웃 시스템
- 개발자 가이드

---

## 🚀 빠른 시작

### 1. 자동화 테스트 실행 (1분)
```bash
# 단위 테스트
npm test

# 통합 테스트
npm run test:integration

# 결과: 58개 모두 통과 (38초)
# 상세 결과: doc/TEST_REPORT.md 참조
```

### 2. UI 수동 테스트 (40분)
```bash
# 1. 데이터베이스 초기화
psql $DATABASE_URL -f prisma/init-v2.sql

# 2. 개발 서버 시작
npm run dev

# 3. 브라우저 접속
open http://localhost:3000

# 4. 시나리오 테스트
# doc/USER_SCENARIO_TEST.md 순서대로 진행
# doc/TEST_CHECKLIST.md 체크

# 5. 스크린샷 캡처 (42개)
# doc/screenshots/ 폴더에 저장
```

### 3. 빠른 기능 확인 (10분)
```bash
# 핵심 기능만 빠르게 확인
1. 로그인
2. Policies → Type 검색/추가
3. States → 4개 생성
4. Types → Attribute 연결
5. Business Objects → 리비전 확인
6. 다크모드 전환
7. Design Template 확인
```

---

## 📸 스크린샷 가이드

### 캡처 도구
- **macOS**: `Cmd + Shift + 4`
- **Windows**: `Win + Shift + S`
- **Chrome**: DevTools → Device Toolbar

### 명명 규칙
```
{시나리오}-{단계}-{번호}_{설명}.png

예시:
1-1-1_policy-list.png
1-1-2_policy-drawer.png
5-2-4_table-resize.png
```

### 저장 위치
```
doc/screenshots/
├── 1-1-1_policy-list.png
├── 1-1-2_policy-drawer.png
├── 1-1-3_policy-created.png
└── ... (42개)
```

### 캡처 시 주의사항
1. **전체 화면 vs 영역**:
   - 전체 페이지: 전체 화면 캡처
   - Drawer: Drawer + 배경 일부 포함
   - 테이블 상세: 테이블 영역만 캡처

2. **다크모드**:
   - 라이트/다크 모드 각각 캡처 (5-1-1, 5-1-2)

3. **UI 상태**:
   - Hover 상태: 마우스 오버 시점 캡처
   - Drawer: 완전히 슬라이드된 후 캡처
   - Dropdown: 메뉴가 열린 상태

---

## 🔄 시나리오 수정 프로세스

### 수정 요청 시
1. **현재 시나리오** 검토
2. **수정 사항** 명시
3. **AI가 문서 업데이트**
4. **재테스트** 진행
5. **새 리포트** 생성

### 예시
```
사용자: "시나리오 2에서 Attribute를 5개로 늘려줘"
AI: USER_SCENARIO_TEST.md 업데이트
   → 2-1 단계에 Attribute 5개 추가
   → 체크리스트 업데이트
   → 스크린샷 가이드 업데이트
```

---

## 📊 테스트 진행 상황

### 테스트 단계
- [ ] **1단계**: 환경 설정 및 로그인
- [ ] **2단계**: Policy 및 State 설정
- [ ] **3단계**: Type 및 Attribute 정의
- [ ] **4단계**: 권한 설정
- [ ] **5단계**: BusinessObject 생성
- [ ] **6단계**: UI 테스트 (다크모드, 반응형)
- [ ] **7단계**: 삭제 제약 테스트
- [ ] **8단계**: 스크린샷 정리

### 완료 여부
- [ ] USER_SCENARIO_TEST.md 완료
- [ ] TEST_CHECKLIST.md 완료
- [ ] 42개 스크린샷 캡처
- [ ] 테스트 결과 기록
- [ ] 이슈 문서화
- [ ] 개선 제안 작성

---

## 🎯 주요 테스트 포인트

### 핵심 기능
1. **Policy-Type Many-to-Many**
   - Type 검색 (2글자 이상)
   - 선택된 Type Badge 표시
   - PolicyType 연결 저장

2. **리비전 자동 할당**
   - Policy의 revisionSequence 기반
   - 동일 Name, 다른 Revision
   - 순환 할당 (A → B → C → A)

3. **EAV 패턴 (JSON 방식)**
   - Type/Attribute 스키마 정의
   - BusinessObject.data JSON 저장
   - 동적 속성 관리

4. **ScrollableTable**
   - 헤더 고정, 데이터 스크롤
   - 컬럼 드래그 리사이즈
   - 텍스트 ellipsis + hover 툴팁
   - 중첩 div ellipsis

5. **Drawer UI**
   - Dialog → Drawer 전환
   - 오른쪽 슬라이드
   - 헤더/푸터 고정

6. **삭제 제약**
   - onDelete: Restrict
   - 종속 데이터 확인
   - 버튼 비활성화

---

## 📞 문의 및 피드백

### 이슈 발견 시
1. **이슈 설명**: 어떤 문제인가?
2. **재현 단계**: 어떻게 발생하는가?
3. **예상 결과**: 어떻게 되어야 하는가?
4. **실제 결과**: 실제로는 어떻게 되는가?
5. **스크린샷**: 이슈 화면 캡처

### 개선 제안 시
1. **현재 상태**: 지금은 어떻게 되는가?
2. **개선 방향**: 어떻게 개선하면 좋은가?
3. **기대 효과**: 왜 개선이 필요한가?

---

**문서 담당자**: Development Team  
**검토자**: QA Team  
**승인자**: Product Manager

