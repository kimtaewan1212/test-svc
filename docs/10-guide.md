# 프론트엔드 앱 스타일 가이드

## 1. 레이아웃 구조

### 전체 레이아웃
- **최상단 헤더**: 전체 너비, 높이 48px, 중앙 아이콘 네비게이션 + 우측 사용자 영역
- **좌측 사이드바**: 너비 220px, 고정(fixed), 미니 캘린더 + 캘린더 목록
- **메인 콘텐츠**: 나머지 영역 전체, 상단 툴바 + 그리드/뷰 영역
- **구분선**: 사이드바와 메인 사이 1px solid #e0e0e0

```
┌─────────────────────────────────────────────┐
│                  상단 헤더                    │
├──────────┬──────────────────────────────────┤
│          │  메인 툴바                         │
│  사이드바 │────────────────────────────────── │
│          │                                   │
│  미니     │         캘린더 그리드              │
│  캘린더   │                                   │
│          │                                   │
│  캘린더   │                                   │
│  목록     │                                   │
└──────────┴──────────────────────────────────┘
```

---

## 2. 색상 시스템 (CSS 변수 기반)

모든 색상은 하드코딩 대신 CSS 커스텀 프로퍼티(변수)를 사용한다. `src/index.css`에서 `:root`(라이트)와 `[data-theme="dark"]`(다크) 두 세트를 정의하며, 컴포넌트는 항상 변수를 참조한다.

### 2.1 CSS 변수 정의

```css
:root {
  --bg-page:        #FFFFFF;   /* 페이지 전체 배경 */
  --bg-surface:     #FFFFFF;   /* 카드, 입력창, 헤더 배경 */
  --bg-subtle:      #F7F7F7;   /* 사이드바, 로그인 컨테이너 배경 */
  --border:         #E0E0E0;   /* 기본 구분선, 입력창 테두리 */
  --border-subtle:  #CCCCCC;   /* 보조 버튼 테두리 */
  --text-primary:   #1A1A1A;   /* 본문, 레이블 */
  --text-secondary: #555555;   /* 보조 텍스트, 사용자명 */
  --text-muted:     #AAAAAA;   /* 비활성, 카운터, 기한 없음 */
  --accent:         #6236FF;   /* 주요 버튼, 활성 탭, 로고 */
  --accent-light:   #EDE9FF;   /* 활성 내비 항목 배경 */
  --danger:         #FF4545;   /* 에러 메시지, 회원탈퇴 */
  --success:        #03C75A;   /* 성공 메시지 */
}

[data-theme="dark"] {
  --bg-page:        #111111;
  --bg-surface:     #1C1C1C;
  --bg-subtle:      #161616;
  --border:         #2A2A2A;
  --border-subtle:  #383838;
  --text-primary:   #EEEEEE;
  --text-secondary: #999999;
  --text-muted:     #606060;
  --accent:         #7C55FF;
  --accent-light:   #1E1540;
  --danger:         #FF6B6B;
  --success:        #2ECC71;
}
```

### 2.2 변수 사용 원칙

- 컴포넌트 인라인 스타일에서 `var(--변수명)` 형태로 참조한다.
- 하드코딩된 색상 값(`#1A1A1A`, `#FFFFFF` 등)을 컴포넌트 코드에 직접 쓰는 것을 금지한다.
- 단, 흰색 텍스트를 강제해야 하는 경우(accent 배경 위 버튼 텍스트)는 `#FFFFFF`를 직접 사용할 수 있다.

```tsx
// 올바른 예
const styles = {
  card: { background: 'var(--bg-surface)', border: '1px solid var(--border)' },
  title: { color: 'var(--text-primary)' },
}

// 금지: 하드코딩
const styles = {
  card: { background: '#FFFFFF', border: '1px solid #E0E0E0' },
}
```

### 2.3 다크 모드 전환 메커니즘

| 구성 요소 | 위치 | 역할 |
|-----------|------|------|
| CSS 변수 | `src/index.css` | 라이트/다크 토큰 정의 |
| Zustand 스토어 | `src/stores/themeStore.ts` | `isDark` 상태, `toggle()`, `localStorage` 영속 |
| 토글 버튼 | `AppLayout` 헤더 우측 | "다크" / "라이트" 전환 |
| 적용 방식 | `document.documentElement.setAttribute('data-theme', ...)` | CSS 변수 세트 전환 |

다크 모드 설정은 `localStorage`에 저장되어 새로고침 후에도 유지된다. 모듈 초기화 시 즉시 적용되므로 화면 깜빡임(FOUC)이 없다.

---

## 3. 타이포그래피

### 폰트 패밀리
```css
font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### 크기 체계
| 이름 | 크기 | 굵기 | 용도 |
|------|------|------|------|
| Logo | 20px | 700 | 'N 캘린더' 로고 |
| Title | 16px | 600 | 연/월 표시(2026.06) |
| Body | 14px | 400 | 일반 텍스트, 메뉴 항목 |
| Date | 13px | 400 | 그리드 날짜 숫자 |
| Small | 12px | 400 | 음력, 보조 정보 |
| Caption | 11px | 400 | 안내 텍스트 |

---

## 4. 컴포넌트

### 4.1 상단 헤더

- 높이: 48px
- 배경: `#FFFFFF`
- 하단 border: `1px solid #E0E0E0`
- **좌측**: 서비스 로고 (N + 서비스명)
- **중앙**: 네비게이션 아이콘 그룹 (메일, 캘린더, 메모 등), 아이콘 크기 24px
- **우측**: 사용자 정보, 알림 아이콘, 앱 그리드 아이콘

**활성 아이콘 스타일**
```css
.nav-icon.active {
  background-color: #6236FF;
  color: #FFFFFF;
  border-radius: 4px;
  padding: 4px 8px;
}
```

### 4.2 사이드바

- 너비: 220px
- 배경: `#F7F7F7`
- 우측 border: `1px solid #E0E0E0`
- padding: 12px

**미니 캘린더**
- 월 이동 버튼: `<`, `>` 화살표, 크기 16px
- 요일 헤더: 12px, `#888888`
- 날짜 셀: 24x24px, 중앙 정렬
- 오늘 날짜: 보라색 원형 배경 `#6236FF`, 흰색 텍스트
- 일요일: `#FF4545`

**액션 버튼 그룹 (일정 쓰기 / 기념일 관리)**
```css
.btn-primary {
  background-color: #6236FF;
  color: #FFFFFF;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  border: none;
}

.btn-secondary {
  background-color: transparent;
  color: #1A1A1A;
  border: 1px solid #CCCCCC;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
}
```

**캘린더 목록 섹션**
- 섹션 제목: 12px, `#888888`, 대문자, 앞에 `∧` 토글 아이콘
- 항목: 14px, 앞에 16x16px 색상 사각형 또는 체크박스
- hover: 배경 `#EEEEEE`, border-radius 4px

### 4.3 메인 툴바

- 높이: 48px
- 배경: `#FFFFFF`
- 하단 border: `1px solid #E0E0E0`
- padding: 0 16px

**왼쪽 영역**
- 햄버거 메뉴 버튼 (24px)
- 검색 입력창: border-radius 4px, border `1px solid #E0E0E0`, 높이 32px
- 상세 드롭다운 버튼
- 전체 일정 버튼 + 새로고침 아이콘

**오른쪽 영역**
- 뷰 전환 탭: `일간 | 주간 | 월간 | 목록 | 평일`

```css
.view-tab {
  padding: 4px 12px;
  font-size: 13px;
  border: 1px solid #E0E0E0;
  background: #FFFFFF;
  cursor: pointer;
}

.view-tab.active {
  background-color: #6236FF;
  color: #FFFFFF;
  border-color: #6236FF;
}
```

### 4.4 캘린더 그리드 (월간 뷰)

**날짜 헤더 행**
- 요일 이름: 14px, `#555555`
- 일요일 컬럼: `#FF4545`
- 높이: 36px
- 하단 border: `1px solid #E0E0E0`

**날짜 셀**
- 최소 높이: 100px
- border: `1px solid #E0E0E0` (우측, 하단만)
- padding: 4px

**날짜 숫자**
- 현재 달: 13px, `#1A1A1A`
- 전/다음 달: 13px, `#AAAAAA`
- 일요일: `#FF4545`
- 오늘 날짜: 보라색 원형 배경, 흰색 텍스트

**공휴일 표시**
```css
.holiday-label {
  font-size: 11px;
  color: #FF4545;
  margin-left: 4px;
}
```

**음력 표시**
```css
.lunar-date {
  font-size: 11px;
  color: #888888;
  float: right;
}
```

### 4.5 검색 입력창

```css
.search-input {
  height: 32px;
  border: 1px solid #E0E0E0;
  border-radius: 4px;
  padding: 0 32px 0 10px; /* 우측 돋보기 아이콘 공간 */
  font-size: 13px;
  background: #FFFFFF;
  width: 200px;
}

.search-input:focus {
  border-color: #6236FF;
  outline: none;
}
```

### 4.6 아이콘

- 라이브러리: Material Icons 또는 동일 계열 아웃라인 스타일
- 기본 크기: 20px
- 색상: `#555555` (기본), `#FFFFFF` (활성/배경 있음)
- 사이드바 메뉴 아이콘: 별(★), 카테고리(▦), 사람(👤), 삭제(🗑) 등 16px

---

## 5. 인터랙션 & 상태

### Hover
- 날짜 셀: 배경 `#F5F3FF` (연보라)
- 사이드바 메뉴 항목: 배경 `#EEEEEE`
- 버튼: 10% 밝기 감소 또는 배경색 변경

### Focus
- 입력창: border-color `#6236FF`, box-shadow `0 0 0 2px rgba(98, 54, 255, 0.15)`

### Active (선택됨)
- 뷰 탭: 배경 `#6236FF`, 텍스트 `#FFFFFF`
- 오늘 날짜: 원형 보라 배경

### Disabled
- 이전/다음 달 날짜: 텍스트 `#AAAAAA`
- 비활성 버튼: `opacity: 0.4`

---

## 6. 간격 & 크기 시스템

| 토큰 | 값 | 용도 |
|------|----|------|
| space-xs | 4px | 인접 요소 간 최소 간격 |
| space-sm | 8px | 버튼 내부 padding |
| space-md | 12px | 섹션 내 여백 |
| space-lg | 16px | 주요 구역 padding |
| space-xl | 24px | 섹션 간 여백 |

---

## 7. 반응형 기준점

| 구간 | 너비 | 변화 |
|------|------|------|
| Desktop | 1280px 이상 | 기본 레이아웃 (사이드바 220px 고정) |
| Tablet | 768px ~ 1279px | 사이드바 아이콘만 표시 (60px) |
| Mobile | 767px 이하 | 사이드바 숨김, 하단 탭바로 대체 |

---

## 8. z-index 체계

```
헤더:         100
사이드바:      50
드롭다운/팝업: 200
모달:         300
토스트 알림:  400
```
