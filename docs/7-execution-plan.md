# TodoListApp 실행계획

**문서 버전**: 1.0  
**작성일**: 2026-05-13  
**작성자**: 개발팀  
**참조 문서**: [PRD](./2-prd.md) · [프로젝트 구조](./4-project-structure.md) · [ERD](./6-erd.md)

---

## 변경 이력

| 버전 | 일자       | 작성자 | 변경 내용 |
| ---- | ---------- | ------ | --------- |
| 1.0  | 2026-05-13 | 개발팀 | 최초 작성 |

---

## 개요

MVP 3일 일정 기준. 작업은 **DB → Backend → Frontend** 레이어 순으로 진행하며, 의존성이 없는 작업은 병렬 수행 가능하다.

### Task ID 체계

| 접두사 | 레이어       |
| ------ | ------------ |
| `DB-`  | 데이터베이스 |
| `BE-`  | 백엔드       |
| `FE-`  | 프론트엔드   |

### 의존성 그래프 요약

```
DB-001 → DB-002 → DB-003
           ↓
BE-001 → BE-002 → BE-005 (Auth Repository)
       ↘           BE-006 (User Repository)  → BE-009 (Auth Service) → BE-013 (Controller+Router)
         BE-003 →  BE-007 (Category Repo)    → BE-011 (Cat. Service) → BE-013
         BE-004    BE-008 (Todo Repository)  → BE-012 (Todo Service) → BE-013
                                               BE-010 (User Service) → BE-013
                                                                         ↓
                                                              BE-014 (단위 테스트)
                                                              BE-015 (통합 테스트)

FE-001 → FE-002 → FE-003 → FE-004 → FE-005 → FE-006 → FE-007
                                                          FE-008 (Category)
                                                          FE-009 (Todo 목록)  → FE-010 (Todo 폼)
                                                          FE-011 (User/설정)
          FE-012 (공통 UI, 병렬 가능)
                                               FE-006~FE-011 완료 후 → FE-013 (반응형)
```

---

## Day 1 목표

> DB 스키마 완성 + 인증/사용자 API 완성 + 프론트엔드 로그인·회원가입 화면

---

## 데이터베이스

---

### DB-001: PostgreSQL 환경 구성

**설명**: 개발·테스트 DB 생성 및 연결 확인  
**의존성**: 없음  
**예상 소요**: 30분

**완료 조건**

- [ ] PostgreSQL 17 설치 및 서비스 실행 확인
- [ ] 개발용 DB 생성: `CREATE DATABASE todolistapp_dev;`
- [ ] 테스트용 DB 생성: `CREATE DATABASE todolistapp_test;`
- [ ] `backend/.env`에 DB 접속 정보(`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`) 설정
- [ ] `pg` 패키지로 연결 성공 확인 (`pool.query('SELECT 1')` 통과)

---

### DB-002: 마이그레이션 스크립트 작성

**설명**: `database/schema.sql`을 기반으로 순번 파일로 분리  
**의존성**: DB-001  
**예상 소요**: 30분

**완료 조건**

- [ ] `backend/migrations/001_create_users.sql` 작성 (users 테이블 + `trg_users_updated_at` 트리거)
- [ ] `backend/migrations/002_create_refresh_tokens.sql` 작성
- [ ] `backend/migrations/003_create_categories.sql` 작성
- [ ] `backend/migrations/004_create_todos.sql` 작성 (todos 테이블 + `trg_todos_updated_at` 트리거)
- [ ] `backend/migrations/005_create_indexes.sql` 작성 (7개 인덱스)
- [ ] `001~005` 순서대로 실행 시 `todolistapp_dev`에 스키마 생성 성공 확인
- [ ] `updated_at` 트리거 동작 확인 (UPDATE 후 `updated_at` 갱신 검증)
- [ ] 마이그레이션 실행 npm script 추가 (`npm run migrate`)

---

### DB-003: 테스트 DB 초기화 스크립트 작성

**설명**: 통합 테스트 전후 DB 상태 초기화  
**의존성**: DB-002  
**예상 소요**: 20분

**완료 조건**

- [ ] `backend/tests/helpers/resetDb.js` 작성 (각 테이블 TRUNCATE + RESTART IDENTITY + CASCADE)
- [ ] `backend/tests/helpers/seedDb.js` 작성 (테스트용 기본 사용자·카테고리 시드)
- [ ] `todolistapp_test`에 동일 스키마 적용 확인
- [ ] `jest.config.js`의 `globalSetup`에 테스트 DB 연결 검증 추가

---

## 백엔드

---

### BE-001: 백엔드 프로젝트 초기화

**설명**: Node.js + Express 기반 프로젝트 뼈대 구성 (순수 JavaScript, CommonJS)  
**의존성**: 없음  
**예상 소요**: 45분

**완료 조건**

- [ ] `backend/` 디렉토리 생성 후 `npm init -y` 실행
- [ ] 의존성 패키지 설치: `express`, `pg`, `jsonwebtoken`, `bcrypt`, `cors`, `dotenv`
- [ ] 개발 의존성 설치: `nodemon`, `jest`, `supertest`
- [ ] `src/` 하위 디렉토리 일괄 생성: `config`, `middlewares`, `routes`, `controllers`, `services`, `repositories`, `constants`, `utils`
- [ ] `tests/` 하위 디렉토리 생성: `unit`, `integration`, `helpers`
- [ ] `package.json` scripts 정의: `dev` (nodemon), `start`, `test` (jest)
- [ ] `backend/.env.example` 작성 (PRD 5.1절 환경 변수 전체)
- [ ] `src/index.js` 서버 진입점 및 기본 Express 앱 구성 (JSON 파서, CORS, 에러 핸들러)
- [ ] `npm run dev` 실행 시 서버 정상 기동 확인

---

### BE-002: DB 연결 풀 및 환경 변수 설정

**설명**: `pg.Pool` 생성 및 필수 환경 변수 검증  
**의존성**: BE-001, DB-001  
**예상 소요**: 30분

**완료 조건**

- [ ] `src/config/db.ts`: `pg.Pool` 인스턴스 생성 및 `export`
- [ ] `src/config/env.ts`: 필수 환경 변수 존재 여부 검증 (없으면 프로세스 종료)
- [ ] 서버 시작 시 DB 연결 테스트 실행 (`pool.query('SELECT 1')`)
- [ ] 연결 실패 시 명확한 에러 메시지 출력

---

### BE-003: 공통 유틸리티 및 상수 구현

**설명**: 에러 코드 상수, 비밀번호·JWT 유틸 구현  
**의존성**: BE-001  
**예상 소요**: 40분

**완료 조건**

- [ ] `src/constants/errorCodes.js`: PRD 6.2절 에러 코드 14개 전체 상수 정의
- [ ] `src/utils/passwordUtils.js`
  - [ ] `hashPassword(plain)` — bcrypt 해싱 (salt rounds: 12)
  - [ ] `comparePassword(plain, hash)` — bcrypt 비교
- [ ] `src/utils/jwtUtils.js`
  - [ ] `signAccessToken(userId)` — 1시간 만료
  - [ ] `signRefreshToken(userId)` — 7일 만료
  - [ ] `verifyToken(token)` — 검증 및 페이로드 반환

---

### BE-004: 공통 미들웨어 구현

**설명**: JWT 인증 미들웨어 및 전역 에러 핸들러  
**의존성**: BE-003  
**예상 소요**: 40분

**완료 조건**

- [ ] `src/middlewares/authMiddleware.js`
  - [ ] `Authorization: Bearer <token>` 헤더 추출
  - [ ] 헤더 없으면 `AUTH_001` (401) 반환
  - [ ] 토큰 만료 시 `AUTH_002` (401) 반환
  - [ ] 유효하지 않은 토큰 시 `AUTH_003` (401) 반환
  - [ ] 검증 성공 시 `req.userId` 주입
- [ ] `src/middlewares/errorHandler.js`
  - [ ] PRD 에러 응답 형식 `{ "error": { "code": "...", "message": "..." } }` 적용
  - [ ] 예상치 못한 에러 시 `SERVER_001` (500) 반환
- [ ] `src/index.js`에 CORS (`process.env.CORS_ORIGIN`), JSON 파서, 에러 핸들러 미들웨어 등록

---

### BE-005: Auth Repository 구현

**설명**: `refresh_tokens` 테이블 CRUD  
**의존성**: BE-002  
**예상 소요**: 30분

**완료 조건**

- [ ] `src/repositories/refreshTokenRepository.js`
  - [ ] `create(userId, token, expiresAt)`: 토큰 저장
  - [ ] `findByToken(token)`: 토큰 단건 조회 (만료 포함)
  - [ ] `deleteByToken(token)`: 특정 토큰 삭제 (로그아웃)
  - [ ] `deleteByUserId(userId)`: 사용자 전체 토큰 삭제
- [ ] 모든 쿼리에 `$1`, `$2` Parameterized Query 사용 확인 (문자열 보간 없음)
- [ ] DB 컬럼(`snake_case`) → 반환값(`camelCase`) 변환 적용

---

### BE-006: User Repository 구현

**설명**: `users` 테이블 CRUD  
**의존성**: BE-002  
**예상 소요**: 30분

**완료 조건**

- [ ] `src/repositories/userRepository.js`
  - [ ] `create(email, hashedPassword, name)`: 사용자 생성, 생성된 행 반환
  - [ ] `findByEmail(email)`: 이메일로 조회 (로그인 시 사용)
  - [ ] `findById(id)`: ID로 조회
  - [ ] `update(id, data)`: 이름·비밀번호 수정
  - [ ] `deleteById(id)`: 삭제 (CASCADE로 연관 데이터 자동 삭제)
- [ ] 모든 쿼리 Parameterized Query 사용 확인
- [ ] 반환값에 `password` 필드 제외 (내 정보 조회 응답용 별도 처리)

---

### BE-007: Category Repository 구현

**설명**: `categories` 테이블 CRUD  
**의존성**: BE-002  
**예상 소요**: 40분

**완료 조건**

- [ ] `src/repositories/categoryRepository.js`
  - [ ] `findAllByUserId(userId)`: 사용자 카테고리 목록 전체 조회
  - [ ] `findById(id)`: ID로 단건 조회
  - [ ] `findDefaultCategoryId(userId)`: `is_default = TRUE` AND `name = '일반'` 카테고리 ID 조회
  - [ ] `create(userId, name, color, isDefault)`: 카테고리 생성
  - [ ] `update(id, data)`: 이름·색상 수정
  - [ ] `deleteById(id)`: 카테고리 삭제
  - [ ] `countByUserId(userId)`: 사용자 카테고리 총 개수
- [ ] 모든 쿼리 Parameterized Query 사용 확인
- [ ] DB 컬럼 → camelCase 변환 적용

---

### BE-008: Todo Repository 구현

**설명**: `todos` 테이블 CRUD + 필터링·페이지네이션  
**의존성**: BE-002  
**예상 소요**: 60분

**완료 조건**

- [ ] `src/repositories/todoRepository.js`
  - [ ] `findAllByUserId(userId, filters, pagination)`: 필터링 + 정렬 + 오프셋 페이지네이션 조회
    - [ ] `category_id` 필터 (선택)
    - [ ] `status` 필터: `all` / `done` (is_completed=true) / `undone` (is_completed=false)
    - [ ] `period` 필터: `today` / `overdue` / `upcoming` / `all`
    - [ ] `sort`: `due_date` / `created_at`, `order`: `asc` / `desc`
    - [ ] `page`, `limit` (최대 100) 오프셋 계산
  - [ ] `countByUserId(userId, filters)`: 전체 개수 조회 (totalPages 계산용)
  - [ ] `findById(id)`: ID로 단건 조회
  - [ ] `create(userId, categoryId, title, description, dueDate)`: 할일 생성
  - [ ] `update(id, data)`: 수정
  - [ ] `deleteById(id)`: 삭제
  - [ ] `toggleComplete(id)`: `is_completed = NOT is_completed` 토글
  - [ ] `updateCategoryIdBulk(fromCategoryId, toCategoryId, userId)`: 카테고리 일괄 변경 (트랜잭션 내에서 사용)
- [ ] 모든 쿼리 Parameterized Query 사용 확인
- [ ] DB 컬럼 → camelCase 변환 적용

---

### BE-009: Auth Service 구현

**설명**: 회원가입·로그인·토큰 재발급·로그아웃 비즈니스 로직  
**의존성**: BE-005, BE-006, BE-007, BE-003  
**예상 소요**: 60분

**완료 조건**

- [ ] `src/services/authService.js`
  - [ ] `register(email, password, name)`
    - [ ] 이메일 중복 확인 → 중복 시 `USER_001` 오류
    - [ ] 비밀번호 bcrypt 해싱 (salt rounds: 12)
    - [ ] 사용자 생성
    - [ ] 기본 카테고리 3개 자동 생성 (`일반`, `업무`, `개인`, is_default=true)
    - [ ] Access Token + Refresh Token 발급 후 Refresh Token DB 저장
    - [ ] 생성된 사용자 정보 및 토큰 반환
  - [ ] `login(email, password)`
    - [ ] 이메일로 사용자 조회 → 없으면 `USER_002` 오류
    - [ ] bcrypt 비교 → 불일치 시 `USER_002` 오류
    - [ ] Access Token + Refresh Token 발급 후 Refresh Token DB 저장
    - [ ] 토큰 반환
  - [ ] `refresh(refreshToken)`
    - [ ] DB에서 토큰 조회 → 없거나 만료 시 `AUTH_005` 오류
    - [ ] 새 Access Token 발급하여 반환
  - [ ] `logout(refreshToken)`
    - [ ] DB에서 Refresh Token 삭제

---

### BE-010: User Service 구현

**설명**: 내 정보 조회·수정·회원탈퇴 비즈니스 로직  
**의존성**: BE-006, BE-003  
**예상 소요**: 30분

**완료 조건**

- [ ] `src/services/userService.js`
  - [ ] `getMe(userId)`: 사용자 정보 조회 (password 필드 제외)
  - [ ] `updateMe(userId, data)`
    - [ ] 이름 변경 (선택)
    - [ ] 비밀번호 변경 시: `currentPassword` 필수 확인 → bcrypt로 현재 비밀번호 검증 → 일치하면 새 비밀번호 bcrypt 재해싱
  - [ ] `deleteMe(userId)`: 사용자 삭제 (DB CASCADE로 할일·카테고리·토큰 전체 삭제, 비밀번호 재확인 없음)

---

### BE-011: Category Service 구현

**설명**: 카테고리 CRUD + 삭제 시 할일 이전 트랜잭션  
**의존성**: BE-007, BE-008, BE-003  
**예상 소요**: 60분

**완료 조건**

- [ ] `src/services/categoryService.ts`
  - [ ] `getAll(userId)`: 사용자 카테고리 목록 반환
  - [ ] `create(userId, name, color)`
    - [ ] 카테고리 수 20개 초과 시 `CAT_003` 오류
    - [ ] color 기본값 `#6B7280` 적용
    - [ ] 카테고리 생성
  - [ ] `update(userId, categoryId, data)`
    - [ ] 카테고리 존재 확인 → 없으면 `CAT_001` 오류
    - [ ] 소유권 확인 → 타인 소유 시 `AUTH_004` 오류
    - [ ] 수정 (is_default 여부와 무관하게 이름·색상 변경 가능)
  - [ ] `delete(userId, categoryId)` — 단일 트랜잭션 내 실행
    - [ ] 카테고리 존재 확인 → 없으면 `CAT_001` 오류
    - [ ] 소유권 확인 → 타인 소유 시 `AUTH_004` 오류
    - [ ] `is_default = true`이면 `CAT_002` 오류 반환
    - [ ] 사용자의 `일반` 기본 카테고리 ID 조회
    - [ ] 삭제 대상 카테고리 소속 할일 → `일반` 카테고리로 일괄 UPDATE
    - [ ] 카테고리 DELETE
    - [ ] 트랜잭션 커밋 (실패 시 롤백)

---

### BE-012: Todo Service 구현

**설명**: 할일 CRUD + 필터링 + 완료 토글 비즈니스 로직  
**의존성**: BE-008, BE-007, BE-003  
**예상 소요**: 60분

**완료 조건**

- [ ] `src/services/todoService.ts`
  - [ ] `getAll(userId, filters, pagination)`
    - [ ] `status` 파라미터 유효값 확인 (`all`/`done`/`undone`) → 아니면 `TODO_002`
    - [ ] `period` 파라미터 유효값 확인 (`all`/`today`/`overdue`/`upcoming`) → 아니면 `TODO_002`
    - [ ] `limit` 최대 100 제한
    - [ ] Repository 호출 및 페이지네이션 응답 구성 (`total`, `page`, `limit`, `totalPages`)
  - [ ] `getById(userId, todoId)`
    - [ ] 할일 존재 확인 → 없으면 `TODO_001` 오류
    - [ ] 소유권 확인 → 타인 소유 시 `AUTH_004` 오류
    - [ ] 할일 반환
  - [ ] `create(userId, data)`
    - [ ] 카테고리 존재 및 소유권 확인 → 없거나 타인 것이면 `CAT_001` 오류
    - [ ] 할일 생성
  - [ ] `update(userId, todoId, data)`
    - [ ] 소유권 확인 → 타인 소유 시 `AUTH_004`
    - [ ] 수정
  - [ ] `delete(userId, todoId)`
    - [ ] 소유권 확인 후 삭제
  - [ ] `toggleComplete(userId, todoId)`
    - [ ] 소유권 확인 후 완료 토글

---

### BE-013: Controller 및 Router 구현

**설명**: HTTP 요청/응답 처리 레이어 및 라우트 연결  
**의존성**: BE-009, BE-010, BE-011, BE-012, BE-004  
**예상 소요**: 60분

**완료 조건**

- [ ] **Auth** (`authController.ts` + `authRouter.ts`)
  - [ ] `POST /api/v1/auth/register` — 회원가입
  - [ ] `POST /api/v1/auth/login` — 로그인
  - [ ] `POST /api/v1/auth/refresh` — Access Token 재발급
  - [ ] `POST /api/v1/auth/logout` — 로그아웃 (authMiddleware 적용)
- [ ] **User** (`userController.ts` + `userRouter.ts`) — 전체 authMiddleware 적용
  - [ ] `GET /api/v1/users/me`
  - [ ] `PATCH /api/v1/users/me`
  - [ ] `DELETE /api/v1/users/me`
- [ ] **Category** (`categoryController.ts` + `categoryRouter.ts`) — 전체 authMiddleware 적용
  - [ ] `GET /api/v1/categories`
  - [ ] `POST /api/v1/categories`
  - [ ] `PATCH /api/v1/categories/:id`
  - [ ] `DELETE /api/v1/categories/:id`
- [ ] **Todo** (`todoController.ts` + `todoRouter.ts`) — 전체 authMiddleware 적용
  - [ ] `GET /api/v1/todos`
  - [ ] `POST /api/v1/todos`
  - [ ] `GET /api/v1/todos/:id`
  - [ ] `PATCH /api/v1/todos/:id`
  - [ ] `DELETE /api/v1/todos/:id`
  - [ ] `PATCH /api/v1/todos/:id/done`
- [ ] `src/routes/index.ts`: 모든 라우터를 `/api/v1`에 마운트
- [ ] Controller는 `req`/`res` 파싱만 수행, 비즈니스 로직 없음 확인
- [ ] Postman 또는 curl로 각 엔드포인트 수동 확인

---

### BE-014: 백엔드 단위 테스트

**설명**: Service 레이어 비즈니스 규칙 검증 (Repository mock 사용)  
**의존성**: BE-009, BE-010, BE-011, BE-012  
**예상 소요**: 90분

**완료 조건**

- [ ] `tests/unit/authService.test.ts`
  - [ ] 중복 이메일 회원가입 시 `USER_001` 오류 반환 확인
  - [ ] 잘못된 비밀번호 로그인 시 `USER_002` 오류 반환 확인
  - [ ] 만료된 Refresh Token으로 재발급 시 `AUTH_005` 오류 반환 확인
  - [ ] 회원가입 성공 시 기본 카테고리 3개 생성 호출 확인
- [ ] `tests/unit/categoryService.test.ts`
  - [ ] 카테고리 20개 초과 시 `CAT_003` 오류 반환 확인
  - [ ] `is_default = true` 카테고리 삭제 시 `CAT_002` 오류 반환 확인
  - [ ] 카테고리 삭제 시 할일 이전 후 삭제 순서 확인 (호출 순서 mock 검증)
  - [ ] 타인 카테고리 접근 시 `AUTH_004` 오류 반환 확인
- [ ] `tests/unit/todoService.test.ts`
  - [ ] 유효하지 않은 `status` 파라미터 시 `TODO_002` 오류 반환 확인
  - [ ] 유효하지 않은 `period` 파라미터 시 `TODO_002` 오류 반환 확인
  - [ ] 타인 할일 접근 시 `AUTH_004` 오류 반환 확인
  - [ ] `limit` 100 초과 시 100으로 제한 확인
- [ ] `npm test -- --coverage` 실행 시 Service 레이어 커버리지 80% 이상

---

### BE-015: 백엔드 통합 테스트

**설명**: API 전체 흐름 검증 (실제 테스트 DB 사용)  
**의존성**: BE-013, DB-003  
**예상 소요**: 90분

**완료 조건**

- [ ] `tests/integration/auth.test.ts`
  - [ ] 회원가입 → 로그인 → Access Token으로 API 호출 전체 흐름
  - [ ] Refresh Token으로 Access Token 재발급 흐름
  - [ ] 로그아웃 후 해당 Refresh Token 무효화 확인
- [ ] `tests/integration/categories.test.ts`
  - [ ] 카테고리 CRUD 전체 흐름
  - [ ] 카테고리 삭제 시 소속 할일이 `일반` 카테고리로 이전되는지 DB 확인
  - [ ] 기본 카테고리 삭제 시도 시 `CAT_002` 응답 확인
- [ ] `tests/integration/todos.test.ts`
  - [ ] 할일 CRUD 전체 흐름
  - [ ] 카테고리 필터, 완료 필터, 기간 필터 각각 동작 확인
  - [ ] 페이지네이션 응답 형식 (`total`, `page`, `limit`, `totalPages`) 확인
  - [ ] 완료 토글 (`PATCH /todos/:id/done`) 동작 확인
- [ ] 각 테스트 실행 전 `resetDb()` 호출로 DB 격리 확인
- [ ] `npm test -- tests/integration` 전체 통과

---

## 프론트엔드

---

### FE-001: 프론트엔드 프로젝트 초기화

**설명**: Vite + React 19 + TypeScript 기반 프로젝트 구성  
**의존성**: 없음 (BE-001과 병렬 진행 가능)  
**예상 소요**: 45분

**완료 조건**

- [x] `frontend/` 디렉토리: `npm create vite@latest` (React + TypeScript 템플릿) 초기화
- [x] 패키지 설치: `@tanstack/react-query` v5, `zustand`, `react-router-dom`
- [x] `tsconfig.json` strict mode 활성화
- [x] `vite.config.ts` 개발 서버 프록시 설정 (`/api` → `http://localhost:3000`)
- [x] `frontend/.env.example` 작성: `VITE_API_BASE_URL=http://localhost:3000/api/v1`
- [x] `src/` 하위 디렉토리 생성: `assets`, `components/common`, `components/todo`, `components/category`, `pages`, `hooks`, `stores`, `api`, `types`, `utils`, `constants`
- [ ] `npm run dev` 실행 시 브라우저에서 기본 화면 확인

---

### FE-002: TypeScript 타입 정의

**설명**: 도메인 엔티티 및 공통 타입 정의  
**의존성**: FE-001  
**예상 소요**: 30분

**완료 조건**

- [x] `src/types/todo.ts`
  - [x] `TodoItem`: id, userId, categoryId, title, description, dueDate, isCompleted, createdAt, updatedAt
  - [x] `CreateTodoRequest`: title, categoryId, dueDate, description(optional)
  - [x] `UpdateTodoRequest`: Partial\<CreateTodoRequest\>
  - [x] `TodoFilter`: categoryId, status, period, sort, order, page, limit
- [x] `src/types/category.ts`
  - [x] `Category`: id, userId, name, color, isDefault, createdAt
  - [x] `CreateCategoryRequest`: name, color(optional)
  - [x] `UpdateCategoryRequest`: name(optional), color(optional)
- [x] `src/types/auth.ts`
  - [x] `LoginRequest`: email, password
  - [x] `RegisterRequest`: email, password, name
  - [x] `LoginResponse`: accessToken, refreshToken, user
  - [x] `AuthState`: accessToken, refreshToken, user, isAuthenticated
- [x] `src/types/common.ts`
  - [x] `PaginationInfo`: total, page, limit, totalPages
  - [x] `ApiError`: code, message
  - [x] `PaginatedResponse<T>`: data, pagination

---

### FE-003: Zustand Auth Store 구현

**설명**: JWT 토큰 메모리 저장 전역 상태  
**의존성**: FE-002  
**예상 소요**: 30분

**완료 조건**

- [x] `src/stores/authStore.ts` 작성
  - [x] 상태: `accessToken: string | null`, `refreshToken: string | null`, `user: UserInfo | null`, `isAuthenticated: boolean`
  - [x] 액션 `setAuth(accessToken, refreshToken, user)`: 토큰 및 사용자 정보 저장
  - [x] 액션 `clearAuth()`: 상태 전체 초기화
  - [x] 액션 `setAccessToken(token)`: Access Token만 갱신 (무음 재발급용)
- [x] `localStorage`, `sessionStorage`, Cookie 사용 없음 확인 (메모리 전용)
- [x] 페이지 새로고침 시 상태가 초기화됨을 확인 (의도된 동작)

---

### FE-004: API 클라이언트 기반 설정

**설명**: fetch 래퍼, Authorization 헤더 주입, 401 인터셉터  
**의존성**: FE-002, FE-003  
**예상 소요**: 60분

**완료 조건**

- [x] `src/api/client.ts`
  - [x] 기본 URL: `import.meta.env.VITE_API_BASE_URL` 사용
  - [x] 모든 요청에 `Authorization: Bearer <accessToken>` 헤더 자동 주입
  - [x] 401 응답 시 Refresh Token으로 `/auth/refresh` 호출하여 Access Token 재발급
  - [x] 재발급 성공 시 `authStore.setAccessToken()` 갱신 후 원래 요청 재시도
  - [x] 재발급 실패 시 `authStore.clearAuth()` 호출 후 `/login`으로 리다이렉트
  - [x] `snake_case → camelCase` 키 변환 유틸 함수 작성 (또는 각 API 함수에서 처리)
- [x] `Content-Type: application/json` 헤더 자동 설정
- [x] 에러 응답 시 `ApiError` 타입으로 파싱하여 throw

---

### FE-005: Auth API 및 훅

**설명**: 로그인·회원가입·로그아웃 API 함수 및 TanStack Query 훅  
**의존성**: FE-003, FE-004  
**예상 소요**: 40분

**완료 조건**

- [x] `src/api/authApi.ts`
  - [x] `register(data: RegisterRequest): Promise<LoginResponse>`
  - [x] `login(data: LoginRequest): Promise<LoginResponse>`
  - [x] `logout(refreshToken: string): Promise<void>`
  - [x] `refresh(refreshToken: string): Promise<{ accessToken: string }>`
- [x] `src/hooks/useAuth.ts` (TanStack Query Mutation 기반)
  - [x] `useLogin()`: mutation, 성공 시 `authStore.setAuth()` 호출
  - [x] `useRegister()`: mutation, 성공 시 `authStore.setAuth()` 호출
  - [x] `useLogout()`: mutation, 성공 시 `authStore.clearAuth()` 호출

---

### FE-006: 로그인 / 회원가입 페이지

**설명**: 인증 화면 UI 구현  
**의존성**: FE-005  
**예상 소요**: 60분

**완료 조건**

- [x] `src/pages/LoginPage.tsx`
  - [x] 이메일, 비밀번호 입력 폼
  - [x] 에러 메시지 표시 (`USER_002` 등)
  - [x] 로그인 성공 시 `/todos`로 리다이렉트
  - [x] 회원가입 페이지 링크
- [x] `src/pages/RegisterPage.tsx`
  - [x] 이름, 이메일, 비밀번호 입력 폼
  - [x] 이메일 RFC 5322 형식 프론트엔드 유효성 검사
  - [x] 비밀번호 최소 8자 + 영문+숫자 조합 유효성 검사
  - [x] 가입 성공 시 자동 로그인 후 `/todos`로 리다이렉트
  - [x] 중복 이메일 시 에러 메시지 (`USER_001`) 표시
- [x] `src/utils/validationUtils.ts`: 이메일·비밀번호 검증 함수 작성

---

### FE-007: 라우팅 및 인증 가드

**설명**: React Router DOM 라우팅 설정 및 인증 보호 라우트  
**의존성**: FE-003, FE-006  
**예상 소요**: 40분

**완료 조건**

- [x] `src/constants/routes.ts`: 라우트 경로 상수 정의 (`/login`, `/register`, `/todos`, 등)
- [x] `src/App.tsx` 라우팅 설정 (6개 페이지 경로)
- [x] `PrivateRoute` 컴포넌트: 비인증 사용자 접근 시 `/login`으로 리다이렉트
- [x] `PublicOnlyRoute` 컴포넌트: 인증 사용자가 `/login`, `/register` 접근 시 `/todos`로 리다이렉트
- [x] TanStack Query `QueryClientProvider` 루트에 설정
- [ ] 전체 라우트 동작 수동 확인

---

### FE-008: Category API, 훅, 관리 페이지

**설명**: 카테고리 CRUD UI 구현  
**의존성**: FE-004, FE-007  
**예상 소요**: 60분

**완료 조건**

- [x] `src/api/categoryApi.ts`
  - [x] `getCategories(): Promise<Category[]>`
  - [x] `createCategory(data): Promise<Category>`
  - [x] `updateCategory(id, data): Promise<Category>`
  - [x] `deleteCategory(id): Promise<void>`
- [x] `src/hooks/useCategories.ts`
  - [x] `useCategories()`: 목록 조회 Query
  - [x] `useCreateCategory()`, `useUpdateCategory()`, `useDeleteCategory()`: Mutation
  - [x] 뮤테이션 성공 시 `categories` Query 캐시 무효화
- [x] `src/pages/CategoryPage.tsx`
  - [x] 카테고리 목록 표시 (이름, 색상 배지, is_default 여부)
  - [x] 카테고리 추가 폼 (이름, 색상 선택)
  - [x] 인라인 수정 또는 모달 수정
  - [x] 기본 카테고리 삭제 버튼 비활성화 처리
  - [x] 카테고리 20개 도달 시 추가 버튼 비활성화 처리
  - [x] 삭제 전 확인 다이얼로그 표시
- [x] `src/components/category/CategoryBadge.tsx`: 색상 배지 컴포넌트

---

### FE-009: Todo API, 훅, 목록 페이지

**설명**: 할일 목록 조회 + 필터링 + 완료 토글 UI  
**의존성**: FE-004, FE-008  
**예상 소요**: 90분

**완료 조건**

- [x] `src/api/todoApi.ts`
  - [x] `getTodos(filters, pagination): Promise<PaginatedResponse<TodoItem>>`
  - [x] `getTodoById(id): Promise<TodoItem>`
  - [x] `createTodo(data): Promise<TodoItem>`
  - [x] `updateTodo(id, data): Promise<TodoItem>`
  - [x] `deleteTodo(id): Promise<void>`
  - [x] `toggleTodoComplete(id): Promise<TodoItem>`
- [x] `src/hooks/useTodos.ts`
  - [x] `useTodos(filters, pagination)`: 목록 Query (필터 변경 시 자동 재조회)
  - [x] `useCreateTodo()`, `useUpdateTodo()`, `useDeleteTodo()`, `useToggleTodo()`: Mutation
  - [x] 뮤테이션 성공 시 `todos` Query 캐시 무효화
- [x] `src/pages/TodoListPage.tsx`
  - [x] 필터바: 카테고리 선택, 완료 여부(`all`/`done`/`undone`), 기간(`all`/`today`/`overdue`/`upcoming`)
  - [x] 필터 AND 조합 동작 확인
  - [x] 할일 카드 리스트 (`TodoCard.tsx`)
  - [x] 완료 체크박스 토글 즉시 반영
  - [x] 페이지네이션 UI (`Pagination.tsx`)
  - [x] 로딩·에러 상태 처리
- [x] `src/components/todo/TodoCard.tsx`: 제목, 카테고리 배지, 종료 예정일, 완료 체크박스
- [x] `src/components/todo/FilterBar.tsx`: 필터 선택 UI

- [x] `src/constants/filterOptions.ts`: status, period 필터 옵션 목록

---

### FE-010: Todo 등록/수정 페이지

**설명**: 할일 등록·수정 폼 UI  
**의존성**: FE-009  
**예상 소요**: 60분

**완료 조건**

- [x] `src/pages/TodoFormPage.tsx`
  - [x] `/todos/new`: 등록 모드 (빈 폼)
  - [x] `/todos/:id/edit`: 수정 모드 (기존 데이터 불러와서 폼 초기화)
  - [x] 입력 필드: 제목(필수, max 200자), 설명(선택, max 2000자), 카테고리(필수), 종료 예정일(필수)
  - [x] 카테고리 선택: `useCategories()`로 목록 로드
  - [x] 제목 200자, 설명 2000자 초과 시 에러 메시지 표시
  - [x] 등록·수정 성공 시 `/todos`로 리다이렉트
  - [x] 취소 버튼: 이전 페이지로 이동

---

### FE-011: User API, 훅, 설정 페이지

**설명**: 내 정보 조회·수정·회원탈퇴 UI  
**의존성**: FE-004, FE-007  
**예상 소요**: 60분

**완료 조건**

- [x] `src/api/userApi.ts`
  - [x] `getMe(): Promise<UserInfo>`
  - [x] `updateMe(data): Promise<UserInfo>`
  - [x] `deleteMe(): Promise<void>`
- [x] `src/hooks/useUser.ts`
  - [x] `useMe()`: 내 정보 조회 Query
  - [x] `useUpdateMe()`, `useDeleteMe()`: Mutation
- [x] `src/pages/SettingsPage.tsx`
  - [x] 이름 수정 섹션
  - [x] 비밀번호 변경 섹션 (현재 비밀번호 + 새 비밀번호)
  - [x] 회원탈퇴 섹션: 확인 다이얼로그 ("모든 데이터가 즉시 삭제됩니다") 표시
  - [x] 탈퇴 성공 시 `authStore.clearAuth()` + `/login` 리다이렉트

---

### FE-012: 공통 UI 컴포넌트

**설명**: 재사용 기본 컴포넌트 구현 (다른 FE 태스크와 병렬 진행 가능)  
**의존성**: FE-001  
**예상 소요**: 60분

**완료 조건**

- [x] `src/components/common/Button.tsx`: variant(primary/secondary/danger), disabled, loading 상태
- [x] `src/components/common/Input.tsx`: label, errorMessage, required 표시
- [x] `src/components/common/Modal.tsx`: 확인 다이얼로그용 (제목, 내용, 확인/취소 버튼)
- [x] `src/components/common/Pagination.tsx`: page, totalPages, onPageChange prop
- [x] `src/constants/errorMessages.ts`: 에러 코드 → 사용자 표시 메시지 매핑

---

### FE-013: 반응형 UI 적용

**설명**: 모바일·태블릿·데스크탑 반응형 레이아웃  
**의존성**: FE-006, FE-008, FE-009, FE-010, FE-011, FE-012  
**예상 소요**: 90분

**완료 조건**

- [x] **Mobile (< 768px)**
  - [x] 단일 컬럼 레이아웃 적용
  - [x] 하단 탭 내비게이션 (할일, 카테고리, 설정)
  - [ ] 터치 인터랙션 동작 확인
- [x] **Tablet (768px ~ 1024px)**
  - [x] 2컬럼 레이아웃 (축소 사이드바 + 컨텐츠)
- [x] **Desktop (> 1024px)**
  - [x] 고정 사이드바 + 컨텐츠 레이아웃
- [ ] 실제 모바일 브라우저 또는 DevTools 모바일 뷰에서 주요 기능 동작 확인
  - [ ] 로그인/회원가입
  - [ ] 할일 목록 조회 및 필터링
  - [ ] 할일 등록
  - [ ] 카테고리 관리

---

## Day별 진행 계획

| Day       | 병렬 진행 가능 작업 세트                                                                                                                                                                               |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Day 1** | `{DB-001, DB-002, BE-001, FE-001}` → `{DB-003, BE-002, BE-003, FE-002}` → `{BE-004, BE-005, BE-006, FE-003, FE-012}` → `{BE-009, BE-010, FE-004}` → `{BE-013(Auth+User), FE-005}` → `{FE-006, FE-007}` |
| **Day 2** | `{BE-007, BE-008}` → `{BE-011, BE-012}` → `{BE-013(Category+Todo)}` → `{FE-008, FE-011}` → `{FE-009}` → `{FE-010}`                                                                                     |
| **Day 3** | `{BE-014, BE-015, FE-013}` 병렬 → 통합 테스트 버그 수정 → 배포 환경 설정 → README 작성                                                                                                                 |

---

## 전체 태스크 현황판

### 데이터베이스 (3개)

| ID     | 태스크                     | 상태    | 의존성 |
| ------ | -------------------------- | ------- | ------ |
| DB-001 | PostgreSQL 환경 구성       | ✅ 완료 | —      |
| DB-002 | 마이그레이션 스크립트 작성 | ✅ 완료 | DB-001 |
| DB-003 | 테스트 DB 초기화 스크립트  | ✅ 완료 | DB-002 |

### 백엔드 (15개)

| ID     | 태스크                  | 상태    | 의존성                         |
| ------ | ----------------------- | ------- | ------------------------------ |
| BE-001 | 백엔드 프로젝트 초기화  | ✅ 완료 | —                              |
| BE-002 | DB 연결 풀 및 환경 변수 | ✅ 완료 | BE-001, DB-001                 |
| BE-003 | 공통 유틸리티 및 상수   | ✅ 완료 | BE-001                         |
| BE-004 | 공통 미들웨어           | ✅ 완료 | BE-003                         |
| BE-005 | Auth Repository         | ✅ 완료 | BE-002                         |
| BE-006 | User Repository         | ✅ 완료 | BE-002                         |
| BE-007 | Category Repository     | ✅ 완료 | BE-002                         |
| BE-008 | Todo Repository         | ✅ 완료 | BE-002                         |
| BE-009 | Auth Service            | ✅ 완료 | BE-005, BE-006, BE-007, BE-003 |
| BE-010 | User Service            | ✅ 완료 | BE-006, BE-003                 |
| BE-011 | Category Service        | ✅ 완료 | BE-007, BE-008, BE-003         |
| BE-012 | Todo Service            | ✅ 완료 | BE-008, BE-007, BE-003         |
| BE-013 | Controller 및 Router    | ✅ 완료 | BE-009~012, BE-004             |
| BE-014 | 백엔드 단위 테스트      | ✅ 완료 | BE-009~012                     |
| BE-015 | 백엔드 통합 테스트      | ✅ 완료 | BE-013, DB-003                 |

### 프론트엔드 (13개)

| ID     | 태스크                      | 상태    | 의존성         |
| ------ | --------------------------- | ------- | -------------- |
| FE-001 | 프론트엔드 프로젝트 초기화  | ✅ 완료 | —              |
| FE-002 | TypeScript 타입 정의        | ✅ 완료 | FE-001         |
| FE-003 | Zustand Auth Store          | ✅ 완료 | FE-002         |
| FE-004 | API 클라이언트 기반 설정    | ✅ 완료 | FE-002, FE-003 |
| FE-005 | Auth API 및 훅              | ✅ 완료 | FE-003, FE-004 |
| FE-006 | 로그인/회원가입 페이지      | ✅ 완료 | FE-005         |
| FE-007 | 라우팅 및 인증 가드         | ✅ 완료 | FE-003, FE-006 |
| FE-008 | Category API·훅·관리 페이지 | ✅ 완료 | FE-004, FE-007 |
| FE-009 | Todo API·훅·목록 페이지     | ✅ 완료 | FE-004, FE-008 |
| FE-010 | Todo 등록/수정 페이지       | ✅ 완료 | FE-009         |
| FE-011 | User API·훅·설정 페이지     | ✅ 완료 | FE-004, FE-007 |
| FE-012 | 공통 UI 컴포넌트            | ✅ 완료 | FE-001         |
| FE-013 | 반응형 UI 적용              | ✅ 완료 | FE-006~012     |

> **상태 범례**: ⬜ 대기 · 🔄 진행 중 · ✅ 완료 · ❌ 블로킹
