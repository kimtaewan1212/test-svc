# TodoListApp 프로젝트 구조 설계 원칙

**문서 버전**: 1.0
**작성일**: 2026-05-13
**작성자**: 개발팀
**참조 문서**: [PRD](./2-prd.md) · [도메인 정의서](./1-domain-definition.md)

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| 1.0 | 2026-05-13 | 개발팀 | 최초 작성 |
| 1.1 | 2026-05-14 | 개발팀 | 실제 구현 기준으로 문서 보정 — Express 5.x, 3.4절 API 응답 camelCase 직접 반환, categoryService 트랜잭션 예외 명시 (2.2절) |
| 1.2 | 2026-05-14 | 개발팀 | 다크 모드 추가 — `themeStore.ts` 스토어, CSS 변수 기반 색상 시스템 도입 (6절 stores 디렉토리 갱신) |

---

## 1. 공통 최상위 원칙

### 1.1 관심사 분리(SoC) 및 단일 책임(SRP)

**Why**: 각 모듈이 하나의 책임만 가질 때 변경 범위가 최소화되고, 테스트와 유지보수가 수월해진다. 관심사가 뒤섞이면 한 기능의 수정이 무관한 모듈에 영향을 미쳐 예측 불가능한 버그를 유발한다.

**How**:
- 프론트엔드는 UI 렌더링, 서버 상태 관리, 클라이언트 상태 관리를 각각 컴포넌트 · TanStack Query v5 훅 · Zustand 스토어로 분리한다.
- 백엔드는 라우팅(Router), 요청/응답 처리(Controller), 비즈니스 로직(Service), DB 접근(Repository)을 별도 레이어로 분리한다.
- 하나의 파일/함수가 두 가지 이상의 역할을 담당하는 경우 분리를 검토한다.

**위반 시 문제**: Controller에 SQL 쿼리가 섞이면 테스트 시 DB 없이 로직 검증이 불가능해진다. 컴포넌트 내부에서 직접 fetch를 호출하면 UI와 API 호출 로직이 결합되어 재사용이 어려워진다.

---

### 1.2 Ubiquitous Language를 코드 네이밍에 반영

**Why**: 도메인 정의서의 용어와 코드 네이밍이 일치하면 기획-개발 간 커뮤니케이션 비용이 줄고, 새 팀원이 코드베이스를 이해하는 시간이 단축된다.

**How**: 아래 도메인 용어를 코드 전반에서 그대로 사용한다. 임의로 축약하거나 동의어로 대체하지 않는다.

| 도메인 용어 | 코드/변수 표현 | 사용 위치 |
|-------------|---------------|-----------|
| 사용자 (User) | `user`, `userId` | 전 레이어 |
| 할일 (TodoItem) | `todo`, `todoId` | 전 레이어 |
| 카테고리 (Category) | `category`, `categoryId` | 전 레이어 |
| 종료 예정일 (DueDate) | `dueDate` (JS), `due_date` (DB) | 전 레이어 |
| 완료 여부 (IsCompleted) | `isCompleted` (JS), `is_completed` (DB) | 전 레이어 |
| 기본 카테고리 | `isDefault` (JS), `is_default` (DB) | 전 레이어 |
| 필터링 (Filtering) | `status`, `period`, `categoryId` | API 파라미터 |
| 인증 (Authentication) | `auth`, `token` | 인증 레이어 |

**위반 시 문제**: `task`, `item`, `tag` 등 유사어를 혼용하면 어떤 엔티티를 지칭하는지 혼동이 발생하고, 리뷰 과정에서 불필요한 논쟁이 생긴다.

---

### 1.3 환경 변수 관리 및 하드코딩 금지

**Why**: DB 접속 정보, JWT 시크릿, CORS 허용 오리진 등 민감 정보가 코드에 노출되면 보안 사고로 이어진다. 환경별(개발/스테이징/운영) 설정이 다를 경우 코드 수정 없이 환경 변수만 교체할 수 있어야 한다.

**How**:
- 모든 민감 값과 환경별 설정은 `.env` 파일에 정의한다.
- 코드에서는 `process.env.VARIABLE_NAME` 형태로만 참조한다.
- `.env` 파일은 `.gitignore`에 포함하고, `.env.example`만 저장소에 커밋한다.

```ts
// 올바른 예
const secret = process.env.JWT_SECRET;

// 금지: 하드코딩
const secret = "my-hard-coded-secret";
```

**위반 시 문제**: 시크릿이 Git 히스토리에 노출되어 영구적인 보안 취약점이 된다.

---

## 2. 의존성 / 레이어 원칙

### 2.1 프론트엔드 레이어 의존 방향

```
Pages / Components  (UI 렌더링)
        ↓
Hooks               (TanStack Query v5 기반 서버 상태 관리)
        ↓
API 클라이언트      (fetch 래퍼, 헤더/에러 처리)
        ↓
[외부: REST API 서버]
```

**Why**: UI 컴포넌트가 API 호출 세부 사항을 알 필요가 없다. 훅이 중간 계층으로 작동하면 컴포넌트는 데이터 출처를 신경 쓰지 않고 렌더링에만 집중할 수 있다.

**How**:
- 컴포넌트는 `useXxx` 훅을 호출하고, 훅이 TanStack Query로 데이터를 가져온다.
- 훅은 `src/api/` 아래의 API 클라이언트 함수를 호출한다.
- 컴포넌트에서 `fetch`나 `axios`를 직접 호출하는 것을 금지한다.

**역방향 참조 금지**: API 클라이언트는 훅이나 컴포넌트를 import하지 않는다. 훅은 컴포넌트를 import하지 않는다.

**위반 시 문제**: 컴포넌트에서 직접 API를 호출하면 동일한 엔드포인트를 여러 컴포넌트에서 중복 구현하게 되어, 엔드포인트 변경 시 모든 컴포넌트를 수정해야 한다.

---

### 2.2 백엔드 레이어 의존 방향

> **런타임**: Node.js ≥22, Express 5.x

```
Router          (라우팅 정의)
    ↓
Controller      (요청/응답 처리)
    ↓
Service         (비즈니스 로직)
    ↓
Repository      (DB 접근, pg 쿼리)
    ↓
[외부: PostgreSQL 17]
```

**Why**: 각 레이어의 역할이 명확하면 비즈니스 로직 변경이 DB 쿼리에 영향을 주지 않고, DB 스키마 변경이 Controller에 영향을 주지 않는다.

**How**:
- **Router**: URL 패턴과 미들웨어를 연결하고, Controller 함수를 호출한다.
- **Controller**: `req`/`res` 객체를 다루며 입력을 파싱하고 Service를 호출한 후 HTTP 응답을 반환한다. 비즈니스 로직을 포함하지 않는다.
- **Service**: 비즈니스 규칙(예: 기본 카테고리 삭제 불가, 카테고리 최대 20개 제한)을 구현한다. DB 접근은 Repository에 위임한다.
- **Repository**: `pg` 라이브러리를 사용하는 유일한 레이어. SQL 쿼리를 작성하고 실행한다.

**역방향 참조 금지**: Repository는 Service를 import하지 않는다. Service는 Router나 Controller를 import하지 않는다.

**`pg` 라이브러리 사용 위치**: `src/repositories/` 디렉토리 내 파일에만 한정한다. Controller나 Service에서 직접 `pool.query()`를 호출하는 것을 금지한다.

> **예외**: `categoryService.js`의 카테고리 삭제(`deleteCategoryWithMigration`) 함수는 할일 이전과 카테고리 삭제를 단일 트랜잭션으로 묶어야 하므로, `pool.connect()`를 직접 사용하여 트랜잭션 클라이언트를 획득한다. 이 예외는 트랜잭션 범위를 Repository 레이어로 분산시킬 수 없는 불가피한 경우에만 허용한다.

**위반 시 문제**: Service에서 직접 SQL을 작성하면 DB 스키마 변경 시 비즈니스 로직 파일까지 수정해야 하며, Service 단위 테스트 시 실제 DB가 필요해진다.

---

## 3. 코드 / 네이밍 원칙

### 3.1 파일명 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| 프론트엔드 React 컴포넌트 | PascalCase | `TodoCard.tsx`, `CategoryBadge.tsx` |
| 프론트엔드 훅 | camelCase, `use` 접두사 | `useTodos.ts`, `useCategories.ts` |
| 프론트엔드 유틸/API 클라이언트 | camelCase | `todoApi.ts`, `dateUtils.ts` |
| 프론트엔드 Zustand 스토어 | camelCase, `Store` 접미사 | `authStore.ts` |
| 백엔드 모든 파일 | camelCase | `todoController.js`, `todoService.js`, `todoRepository.js` |
| 백엔드 라우터 | camelCase, `Router` 접미사 | `todoRouter.js`, `authRouter.js` |

---

### 3.2 변수 / 함수 / 상수 네이밍

| 대상 | 규칙 | 예시 |
|------|------|------|
| 변수, 함수 | camelCase | `todoList`, `getTodoById`, `isCompleted` |
| 전역 상수 (변하지 않는 값) | UPPER_SNAKE_CASE | `MAX_CATEGORY_COUNT`, `ACCESS_TOKEN_EXPIRES_IN` |
| TypeScript 타입/인터페이스 (프론트엔드) | PascalCase | `TodoItem`, `CategoryResponse`, `AuthState` |
| React 컴포넌트 | PascalCase | `TodoList`, `FilterBar` |

---

### 3.3 DB 컬럼과 JS/TS 코드 매핑

**원칙**: DB 컬럼명은 `snake_case`를 사용하고, JS 코드에서는 `camelCase`를 사용한다.

**Why**: PostgreSQL 컨벤션은 `snake_case`이며, JavaScript 컨벤션은 `camelCase`다. 각 환경의 관례를 따르면 코드 가독성이 향상된다.

**변환 위치**: **Repository 레이어**에서 DB 결과를 반환할 때 `camelCase`로 변환한다.

```js
// todoRepository.js — Repository에서 변환
const result = await pool.query(
  'SELECT is_completed, due_date FROM todos WHERE id = $1', [id]
);
return {
  isCompleted: result.rows[0].is_completed,
  dueDate: result.rows[0].due_date,
};
```

---

### 3.4 API 응답과 프론트엔드 타입 매핑

**원칙**: 서버(백엔드)는 `camelCase` JSON을 반환한다. snake_case → camelCase 변환은 Repository 레이어에서 이미 수행하므로(3.3절 참고), 프론트엔드 API 클라이언트에서 별도 변환이 필요 없다.

**Why**: DB 컬럼명(`snake_case`)과 JS 코드(`camelCase`)의 변환 책임을 Repository 레이어 한 곳에 집중시켜, 프론트엔드는 서버 응답을 그대로 사용할 수 있다.

**변환 위치**: `backend/src/repositories/` 내 Repository 함수. 프론트엔드 API 클라이언트는 별도 변환 없이 응답 필드를 그대로 사용한다.

```js
// 서버 응답 예시 (이미 camelCase)
{
  "id": 1,
  "userId": 123,
  "categoryId": 2,
  "isCompleted": false,
  "dueDate": "2026-05-31",
  "createdAt": "2026-05-13T09:00:00Z"
}
```

---

### 3.5 에러 코드 상수화

**원칙**: PRD 6.2절의 에러 코드를 `constants/` 디렉토리에 상수로 정의하고, 하드코딩된 문자열을 직접 사용하지 않는다.

**Why**: 에러 코드 문자열을 코드 곳곳에 흩어 놓으면 오타 발생 시 런타임에서야 발견된다. 상수로 관리하면 IDE 자동완성 지원을 받을 수 있다.

```js
// backend/src/constants/errorCodes.js
const ERROR_CODES = {
  AUTH_001: 'AUTH_001',   // Authorization 헤더 없음
  AUTH_002: 'AUTH_002',   // Access Token 만료
  AUTH_003: 'AUTH_003',   // 유효하지 않은 토큰
  AUTH_004: 'AUTH_004',   // 타인 리소스 접근 시도
  AUTH_005: 'AUTH_005',   // Refresh Token 만료 또는 무효
  USER_001: 'USER_001',   // 이미 사용 중인 이메일
  USER_002: 'USER_002',   // 이메일 또는 비밀번호 불일치
  TODO_001: 'TODO_001',   // 존재하지 않는 할일
  TODO_002: 'TODO_002',   // 잘못된 필터 파라미터 값
  CAT_001:  'CAT_001',    // 존재하지 않는 카테고리
  CAT_002:  'CAT_002',    // 기본 카테고리 삭제 불가
  CAT_003:  'CAT_003',    // 카테고리 최대 개수 초과
  VALID_001: 'VALID_001', // 필수 항목 누락 또는 형식 오류
  SERVER_001: 'SERVER_001', // 내부 서버 오류
};

module.exports = { ERROR_CODES };
```

---

## 4. 테스트 / 품질 원칙

### 4.1 백엔드 테스트 전략

**단위 테스트 (Service 레이어 중심)**

**Why**: Service는 비즈니스 로직을 담당하므로 가장 중요한 테스트 대상이다. Repository를 테스트 더블로 대체하면 DB 없이 비즈니스 규칙을 빠르게 검증할 수 있다.

**How**:
- `tests/unit/` 디렉토리에 Service 단위 테스트를 작성한다.
- Repository는 stub/mock으로 대체하여 DB 없이 비즈니스 규칙을 검증한다.
- 테스트 대상: 카테고리 최대 개수 제한, 기본 카테고리 삭제 불가, 비밀번호 정책 검증 등.

**통합 테스트 (API 엔드포인트)**

**Why**: 실제 HTTP 요청부터 DB 저장까지 전체 흐름이 올바르게 동작하는지 검증해야 한다.

**How**:
- `tests/integration/` 디렉토리에 API 엔드포인트 통합 테스트를 작성한다.
- **실제 테스트용 PostgreSQL DB에 연결하여 테스트한다 (Mock DB 금지).**
- 각 테스트 전후에 DB 상태를 초기화(truncate/seed)한다.

**Mock DB 금지 이유**: `pg` 라이브러리를 직접 사용하므로 쿼리 로직이 SQL 레벨에 있다. Mock으로는 실제 SQL 실행, 트랜잭션, 인덱스 동작을 검증할 수 없다.

---

### 4.2 프론트엔드 테스트 전략

**컴포넌트 단위 테스트**:
- 각 UI 컴포넌트의 렌더링, 사용자 인터랙션(클릭, 입력)을 테스트한다.
- TanStack Query Provider와 Router를 포함한 테스트 래퍼를 구성한다.

**훅 테스트**:
- `renderHook`을 사용하여 커스텀 훅의 상태 변화와 API 호출 동작을 테스트한다.
- API 클라이언트는 MSW(Mock Service Worker) 또는 Jest mock으로 대체한다.

---

### 4.3 커버리지 목표

| 레이어 | 커버리지 목표 |
|--------|--------------|
| 백엔드 Service | 80% 이상 |
| 백엔드 Repository (통합 테스트) | 핵심 쿼리 100% |
| 프론트엔드 컴포넌트 | 70% 이상 |
| 프론트엔드 훅 | 80% 이상 |

---

## 5. 설정 / 보안 / 운영 원칙

### 5.1 .env 파일 구조 및 필수 환경 변수

`backend/.env.example`에 아래 변수들을 정의한다. 실제 값은 `.env`에 설정하며, `.env`는 Git에 커밋하지 않는다.

```dotenv
# 서버
NODE_ENV=development
PORT=3000

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=todolistapp
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret_key_min_32_chars
JWT_ACCESS_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# bcrypt
BCRYPT_SALT_ROUNDS=12
```

프론트엔드 환경 변수는 Vite의 `VITE_` 접두사 규칙을 따른다.

```dotenv
# frontend/.env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

---

### 5.2 JWT 토큰 관리 원칙

**프론트엔드 (Zustand 메모리 저장)**:
- Access Token과 Refresh Token은 `src/stores/authStore.ts`의 Zustand 스토어 **메모리**에서만 관리한다.
- `localStorage`, `sessionStorage`, Cookie 등 브라우저 영구 저장소에 토큰을 저장하지 않는다 (XSS 공격에 의한 토큰 탈취 방지).
- 페이지 새로고침 시 토큰이 초기화되므로 사용자는 재로그인이 필요하다. 이는 의도된 보안 정책이다.
- 로그아웃 및 회원 탈퇴 시 Zustand 스토어 상태를 초기화한다.

**백엔드 (미들웨어 검증 위치)**:
- JWT 검증은 `src/middlewares/authMiddleware.js`에서 수행한다.
- 인증이 필요한 모든 라우터에 이 미들웨어를 적용한다.
- 미들웨어는 `Authorization: Bearer <token>` 헤더에서 토큰을 추출하고, 검증 성공 시 `req.userId`에 사용자 ID를 주입한다.
- Controller와 Service는 `req.userId`를 사용하며, 토큰 검증 로직을 포함하지 않는다.

```js
// src/middlewares/authMiddleware.js (핵심 흐름)
const token = req.headers.authorization?.split(' ')[1];
if (!token) return res.status(401).json({ error: { code: ERROR_CODES.AUTH_001 } });
const payload = jwt.verify(token, process.env.JWT_SECRET);
req.userId = payload.userId;
next();
```

---

### 5.3 SQL Injection 방지: Parameterized Query 강제

**Why**: 사용자 입력값을 SQL 문자열에 직접 삽입하면 SQL Injection 공격에 취약해진다. `pg` 라이브러리의 Parameterized Query는 입력값을 데이터로만 취급하여 이를 방지한다.

**How**: Repository의 모든 쿼리는 반드시 `$1`, `$2` 등의 파라미터 플레이스홀더를 사용한다.

```js
// 올바른 예: Parameterized Query
await pool.query(
  'SELECT * FROM todos WHERE user_id = $1 AND id = $2', [userId, todoId]
);

// 금지: 문자열 보간
await pool.query(`SELECT * FROM todos WHERE user_id = ${userId}`);
```

**위반 시 문제**: `userId` 자리에 악의적인 SQL 코드를 주입하여 전체 데이터를 탈취하거나 삭제할 수 있다.

---

### 5.4 CORS 설정 원칙

**Why**: 허용되지 않은 오리진에서의 API 요청을 차단하여 CSRF 등의 공격을 방지한다.

**How**:
- 허용 오리진은 환경 변수 `CORS_ORIGIN`으로 관리한다. 코드에 URL을 하드코딩하지 않는다.
- 개발 환경에서는 `http://localhost:5173`, 운영 환경에서는 실제 프론트엔드 도메인을 설정한다.

```js
// src/app.js
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));
```

---

## 6. 프론트엔드 디렉토리 구조

```
frontend/
├── src/
│   ├── assets/              # 정적 파일 (이미지, 폰트, 아이콘 SVG)
│   ├── components/          # 재사용 UI 컴포넌트 (도메인별 하위 디렉토리)
│   │   ├── common/          # 범용 UI (Button, Input, Modal, Pagination 등)
│   │   ├── todo/            # 할일 도메인 컴포넌트 (TodoCard, TodoForm 등)
│   │   └── category/        # 카테고리 도메인 컴포넌트
│   ├── pages/               # 라우트 단위 페이지 컴포넌트
│   │   ├── LoginPage.tsx        # /login
│   │   ├── RegisterPage.tsx     # /register
│   │   ├── TodoListPage.tsx     # /todos
│   │   ├── TodoFormPage.tsx     # /todos/new, /todos/:id/edit
│   │   ├── CategoryPage.tsx     # /categories
│   │   └── SettingsPage.tsx     # /settings
│   ├── hooks/               # TanStack Query 기반 커스텀 훅
│   │   ├── useTodos.ts          # 할일 CRUD, 완료 토글, 필터 조회
│   │   ├── useCategories.ts     # 카테고리 CRUD
│   │   ├── useAuth.ts           # 로그인, 로그아웃, 회원가입 mutation
│   │   └── useUser.ts           # 내 정보 조회/수정, 회원탈퇴
│   ├── stores/              # Zustand 전역 클라이언트 상태
│   │   ├── authStore.ts         # 인증 상태 (토큰, 사용자 정보, isAuthenticated) — 메모리 한정
│   │   └── themeStore.ts        # 테마 상태 (isDark, toggle) — localStorage 영속
│   ├── api/                 # API 클라이언트 (fetch 래퍼 + snake→camelCase 변환)
│   │   ├── client.ts            # 기본 URL, 헤더, 401 토큰 재발급 인터셉터
│   │   ├── authApi.ts           # 회원가입, 로그인, 로그아웃, 토큰 재발급
│   │   ├── todoApi.ts           # 할일 CRUD, 완료 토글, 필터 조회
│   │   ├── categoryApi.ts       # 카테고리 CRUD
│   │   └── userApi.ts           # 내 정보 조회/수정, 회원탈퇴
│   ├── types/               # TypeScript 타입 및 인터페이스 정의
│   │   ├── todo.ts              # TodoItem, CreateTodoRequest, UpdateTodoRequest
│   │   ├── category.ts          # Category, CreateCategoryRequest
│   │   ├── auth.ts              # LoginRequest, LoginResponse, AuthState
│   │   └── common.ts            # PaginationInfo, ApiError, FilterParams
│   ├── utils/               # 순수 유틸 함수 (사이드 이펙트 없음)
│   │   ├── dateUtils.ts         # 날짜 포맷 변환, 기간 계산
│   │   └── validationUtils.ts   # 이메일·비밀번호 정책 검증
│   └── constants/           # 변경되지 않는 상수
│       ├── errorMessages.ts     # 에러 코드 → 사용자 표시 메시지 매핑
│       ├── routes.ts            # 라우트 경로 상수
│       └── filterOptions.ts     # status, period 필터 옵션 목록
├── public/                  # Vite가 그대로 복사하는 정적 파일
├── index.html               # Vite 진입점 HTML
├── vite.config.ts           # Vite 빌드/개발 서버 설정
└── tsconfig.json            # TypeScript 컴파일러 설정
```

### 레이어별 핵심 역할 요약

| 디렉토리 | 역할 | import 가능 대상 |
|----------|------|-----------------|
| `pages/` | 레이아웃 조합, 라우팅 | `components/`, `hooks/`, `stores/` |
| `components/` | UI 렌더링, 사용자 이벤트 | `hooks/`, `stores/`, `utils/`, `constants/` |
| `hooks/` | 서버 상태 관리 (TanStack Query) | `api/`, `types/` |
| `stores/` | 클라이언트 전역 상태 (Zustand) — `authStore`(메모리), `themeStore`(localStorage) | `types/` |
| `api/` | HTTP 요청, 응답 변환 | `types/`, `constants/` |
| `utils/` | 순수 함수 | 없음 |
| `constants/` | 상수 정의 | 없음 |

---

## 7. 백엔드 디렉토리 구조

```
backend/
├── src/
│   ├── config/              # DB 연결 풀 초기화, 환경 변수 로드 및 검증
│   │   ├── db.js                # pg Pool 생성 및 module.exports
│   │   └── env.js               # 필수 환경 변수 존재 여부 검증
│   ├── middlewares/         # Express 미들웨어
│   │   ├── authMiddleware.js    # JWT 검증, req.userId 주입
│   │   └── errorHandler.js     # 전역 에러 → PRD 에러 응답 형식 변환
│   ├── routes/              # Express 라우터 (URL 패턴 + 미들웨어 연결만)
│   │   ├── index.js             # 모든 라우터를 /api/v1에 마운트
│   │   ├── authRouter.js        # /api/v1/auth/*
│   │   ├── userRouter.js        # /api/v1/users/*
│   │   ├── todoRouter.js        # /api/v1/todos/*
│   │   └── categoryRouter.js    # /api/v1/categories/*
│   ├── controllers/         # HTTP 요청/응답 처리 (req 파싱 → Service 호출 → res 반환)
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── todoController.js
│   │   └── categoryController.js
│   ├── services/            # 비즈니스 로직 (PRD 비즈니스 규칙 집중)
│   │   ├── authService.js       # 회원가입, 로그인, 토큰 재발급, 로그아웃
│   │   ├── userService.js       # 내 정보 조회/수정, 회원탈퇴
│   │   ├── todoService.js       # 할일 CRUD, 완료 토글, 필터 파라미터 조합
│   │   └── categoryService.js   # 최대 20개 제한, 기본 카테고리 보호, 삭제 시 할일 이전 트랜잭션
│   ├── repositories/        # pg 쿼리 (DB 접근 유일 레이어, Parameterized Query 필수)
│   │   ├── userRepository.js
│   │   ├── todoRepository.js
│   │   ├── categoryRepository.js
│   │   └── refreshTokenRepository.js
│   ├── constants/           # 공유 상수
│   │   └── errorCodes.js        # PRD 6.2절 에러 코드 상수 (3.5절 참고)
│   └── utils/               # 공통 유틸 (레이어 비종속)
│       ├── passwordUtils.js     # bcrypt 해싱·비교
│       └── jwtUtils.js          # JWT 발급·검증 (미들웨어 외 재사용용)
├── tests/
│   ├── unit/                # Service 레이어 단위 테스트 (Repository는 mock)
│   │   ├── authService.test.js
│   │   ├── todoService.test.js
│   │   └── categoryService.test.js
│   └── integration/         # API 전체 흐름 테스트 (실제 테스트 DB 사용)
│       ├── auth.test.js
│       ├── todos.test.js
│       └── categories.test.js
├── migrations/              # DB 마이그레이션 SQL (순번 접두사로 실행 순서 보장)
│   ├── 001_create_users.sql
│   ├── 002_create_refresh_tokens.sql
│   ├── 003_create_categories.sql
│   ├── 004_create_todos.sql
│   └── 005_create_indexes.sql
├── .env.example             # 환경 변수 템플릿 (Git 커밋 대상)
└── package.json
```

### 레이어별 핵심 역할 요약

| 디렉토리 | 역할 | import 가능 대상 | pg 사용 |
|----------|------|-----------------|:-------:|
| `routes/` | URL·미들웨어 연결 | `controllers/`, `middlewares/` | ❌ |
| `controllers/` | req 파싱, res 반환 | `services/`, `constants/` | ❌ |
| `services/` | 비즈니스 규칙 | `repositories/`, `utils/`, `constants/` | ❌ |
| `repositories/` | SQL 쿼리 실행 | `config/db`, `utils/` | ✅ 유일 |
| `middlewares/` | 인증 검증, 에러 포맷 | `utils/`, `constants/` | ❌ |
| `config/` | DB 풀, 환경 변수 | 없음 | ✅ Pool 생성 |

---

## 부록: 레이어 원칙 위반 체크리스트

구현 전후 아래 항목을 확인한다.

- [ ] Repository 외 레이어에서 `pool.query()`를 직접 호출하고 있지 않은가?
- [ ] Controller에서 비즈니스 규칙 판단을 하고 있지 않은가?
- [ ] Service가 `req`, `res` 객체를 참조하고 있지 않은가?
- [ ] SQL 쿼리에 템플릿 리터럴로 사용자 입력값을 직접 삽입하고 있지 않은가?
- [ ] 컴포넌트에서 `fetch`나 `axios`를 직접 호출하고 있지 않은가?
- [ ] 훅이 컴포넌트를 import하고 있지 않은가?
- [ ] API 클라이언트(`src/api/`)가 Zustand 스토어를 직접 참조하고 있지 않은가?
- [ ] `.env`에 있어야 할 값이 코드에 하드코딩되어 있지 않은가?
- [ ] 도메인 용어와 다른 네이밍(`task`, `item`, `tag` 등)을 사용하고 있지 않은가?
- [ ] 에러 코드 문자열을 상수 없이 직접 사용하고 있지 않은가?
