# TodoListApp PRD (Product Requirements Document)

**문서 버전**: 1.0  
**작성일**: 2026-05-13  
**작성자**: 개발팀  
**참조 문서**: [도메인 정의서](./1-domain-definition.md)

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| 1.0 | 2026-05-13 | 개발팀 | 최초 작성 |
| 1.1 | 2026-05-13 | 개발팀 | 사용자 페르소나 3종 추가 (2.2절) |
| 1.2 | 2026-05-13 | 개발팀 | 카테고리 삭제 처리 흐름 명확화 (7절), 에러 코드 목록 추가 (6절), 페이지네이션 정책 추가 (3.2.2, 6.2절), 용어 정의 섹션 추가 (11절) |
| 1.3 | 2026-05-13 | 개발팀 | 토큰 저장 방식 변경 — localStorage → Zustand 메모리 저장으로 전환 (5.2절) |
| 1.4 | 2026-05-14 | 개발팀 | 실제 구현 기준으로 문서 보정 — 회원가입 즉시 토큰 발급, 기본 카테고리 색상 명시, 카테고리 삭제 응답 204 No Content (3.2.1, 3.2.3절) |

---

## 1. 제품 개요

### 1.1 목적
20대~50대 직장인이 일상적인 업무와 개인 일정을 카테고리별로 체계적으로 관리할 수 있는 인증 기반 할일 관리 서비스를 제공한다.

### 1.2 제품 비전
> "로그인 하나로 어디서든, 내 할일을 깔끔하게"

브라우저와 모바일 웹 어디서나 동일한 경험을 제공하며, 개인 데이터는 철저히 격리된 환경에서 안전하게 관리된다.

### 1.3 범위
- **1차 릴리즈 (MVP)**: 사용자 인증 + 할일 CRUD + 카테고리 관리 + 필터링
- **2차 릴리즈**: 다크 모드, 다국어(i18n), OAuth 소셜 로그인 (Google, Facebook 등)

---

## 2. 타겟 사용자

### 2.1 주요 사용자군
| 구분 | 설명 |
|------|------|
| **연령** | 20대 ~ 50대 |
| **직군** | 직장인 (사무직, 전문직, 재택근무자 포함) |
| **디바이스** | PC 브라우저, 스마트폰 모바일 웹 |
| **기술 수준** | 일반 웹 서비스 사용에 익숙한 수준 |

### 2.2 사용자 페르소나

#### 페르소나 A — 바쁜 중간 관리자 "김지수" (38세, 팀장)
| 항목 | 내용 |
|------|------|
| **직군** | IT 기업 개발팀 팀장 |
| **디바이스** | 업무 중 PC, 이동 중 스마트폰 |
| **특징** | 하루에 10건 이상 업무 요청을 받으며 회의, 코드 리뷰, 보고서 작성이 혼재 |
| **목표** | 업무·개인 할일을 한 곳에서 카테고리별로 구분해 놓치지 않고 싶다 |
| **불편함** | 메모앱, 캘린더, 메신저에 할일이 흩어져 있어 누락이 잦다 |
| **사용 패턴** | 아침 출근 직후 PC로 오늘 할일 전체 확인 → 완료 시 즉시 체크 → 퇴근 전 모바일로 마무리 확인 |

#### 페르소나 B — 자기 관리형 신입사원 "박서연" (26세, 마케터)
| 항목 | 내용 |
|------|------|
| **직군** | 스타트업 마케팅 담당 |
| **디바이스** | 주로 스마트폰, 가끔 노트북 |
| **특징** | 업무와 자기계발(독서, 운동 등) 목표를 함께 관리하고 싶어 함 |
| **목표** | 업무/개인 카테고리를 분리해 일-생활 균형을 눈으로 확인하고 싶다 |
| **불편함** | 기존 메모앱은 완료 여부 추적이 안 되고 종료일 관리가 불편하다 |
| **사용 패턴** | 점심시간·퇴근 후 모바일로 새 할일 등록 → 주말에 한 주 할일 리뷰 |

#### 페르소나 C — 재택근무 프리랜서 "이민호" (44세, 디자이너)
| 항목 | 내용 |
|------|------|
| **직군** | 프리랜서 UI/UX 디자이너 |
| **디바이스** | PC(데스크탑) 중심, 외출 시 스마트폰 |
| **특징** | 복수 클라이언트 프로젝트를 동시 진행, 납기일 관리가 핵심 |
| **목표** | 클라이언트별 카테고리로 할일을 분리하고 종료 예정일 기준으로 우선순위 파악 |
| **불편함** | 복잡한 프로젝트 관리 도구는 과하고, 단순 메모는 납기 추적이 안 된다 |
| **사용 패턴** | 아침에 PC로 오늘 마감 건 확인 → 작업 완료 시 즉시 토글 → 신규 의뢰 들어오면 즉시 등록 |

### 2.3 핵심 사용자 시나리오
- 출근 전 오늘 할일 목록 확인 (모바일)
- 업무 중 새 할일 추가 및 완료 처리 (PC)
- 주간 리뷰 시 카테고리별 완료/미완료 현황 파악

---

## 3. 기능 요구사항

### 3.1 릴리즈별 기능 범위

| 기능 영역 | 세부 기능 | 1차 MVP | 2차 |
|-----------|-----------|:-------:|:---:|
| **사용자 인증** | 회원가입 (이메일 + 비밀번호) | ✅ | |
| | 로그인 / 로그아웃 | ✅ | |
| | 개인 정보 수정 (이름, 비밀번호) | ✅ | |
| | 회원 탈퇴 (데이터 즉시 삭제) | ✅ | |
| | OAuth 소셜 로그인 (Google, Facebook) | | ✅ |
| **할일 관리** | 할일 등록 (제목, 설명, 카테고리, 종료 예정일) | ✅ | |
| | 할일 목록 조회 | ✅ | |
| | 할일 상세 조회 | ✅ | |
| | 할일 수정 | ✅ | |
| | 할일 삭제 | ✅ | |
| | 완료 여부 토글 | ✅ | |
| | 카테고리 / 완료 여부 / 종료 예정일 필터링 | ✅ | |
| **카테고리 관리** | 기본 카테고리 자동 생성 (가입 시) | ✅ | |
| | 카테고리 목록 조회 | ✅ | |
| | 카테고리 추가 (이름, 색상) | ✅ | |
| | 카테고리 수정 | ✅ | |
| | 카테고리 삭제 (기본 카테고리 삭제 불가) | ✅ | |
| **UX/UI** | 반응형 웹 UI (PC + 모바일 웹) | ✅ | |
| | 다크 모드 | | ✅ |
| | 다국어 지원 (i18n) | | ✅ |

### 3.2 기능 상세 요구사항

#### 3.2.1 사용자 인증
- 이메일은 RFC 5322 형식 검증 필수
- 비밀번호는 최소 8자, 영문 + 숫자 조합 필수
- 회원가입 성공 시 기본 카테고리 3개 자동 생성: `일반`, `업무`, `개인`
- 회원가입 성공 시 Access Token + Refresh Token이 즉시 발급되어 응답에 포함됨 (로그인 과정 없이 바로 서비스 사용 가능)
- JWT Access Token 만료 시간: **1시간**
- JWT Refresh Token 만료 시간: **7일**
- Refresh Token은 DB에 저장하여 강제 로그아웃(토큰 무효화) 지원
- 회원 탈퇴 시 해당 사용자의 모든 데이터(할일, 카테고리, 토큰) **즉시 삭제**

#### 3.2.2 할일 관리
- 필수 입력 항목: 제목, 카테고리, 종료 예정일
- 선택 입력 항목: 설명(Description)
- 제목은 최대 200자
- 설명은 최대 2000자
- 필터링 조건 (AND 조합 가능):
  - 카테고리 ID
  - 완료 여부 (`all` / `done` / `undone`)
  - 기간 (`today` / `overdue` / `upcoming` / `all`)
- 목록 기본 정렬: 종료 예정일 오름차순, 생성일 내림차순
- **페이지네이션**: 오프셋 기반 (`page`, `limit` 파라미터)
  - 기본값: `page=1`, `limit=20`
  - 최대 `limit`: 100
  - 응답에 `total`, `page`, `limit`, `totalPages` 포함

#### 3.2.3 카테고리 관리
- `IsDefault = true`인 카테고리는 수정(이름 변경)만 가능, 삭제 불가
- 카테고리 색상: Hex 코드 형식 (`#RRGGBB`), 미입력 시 기본값 `#6B7280`
- 회원가입 시 자동 생성되는 기본 카테고리의 초기 색상:
  - `일반`: `#6B7280` (회색)
  - `업무`: `#3B82F6` (파란색)
  - `개인`: `#10B981` (초록색)
- 사용자당 카테고리 최대 개수: **20개**
- 카테고리 삭제 시 해당 카테고리 소속 할일은 `일반` 기본 카테고리로 이전
- 카테고리 삭제 API 응답: **204 No Content** (응답 본문 없음)

---

## 4. 비기능 요구사항

### 4.1 성능
| 항목 | 목표 |
|------|------|
| 동시 접속 사용자 | 최대 **300명** |
| API 응답 시간 (p95) | **500ms 이하** |
| 할일 목록 조회 | **200ms 이하** |

### 4.2 보안
- 모든 API 엔드포인트(인증 제외)는 JWT Bearer Token 필수
- 비밀번호는 **bcrypt** (salt rounds: 12) 해싱 저장, 평문 저장 금지
- 사용자는 자신의 데이터에만 접근 가능 (서버에서 UserId 검증)
- SQL Injection 방지: Parameterized Query 필수 (`pg` 라이브러리 기본 지원)
- CORS: 허용 오리진 환경 변수로 관리

### 4.3 데이터 정책
- 회원 탈퇴 시 관련 데이터 **즉시 물리 삭제** (소프트 삭제 미적용)
- 개인 정보(이메일, 이름)는 서비스 외 목적으로 활용 금지

### 4.4 가용성 및 운영
- 서버 다운 시 사용자에게 명확한 오류 메시지 반환 (HTTP 상태 코드 준수)
- 환경 변수(`.env`)로 민감 정보 관리, 코드에 하드코딩 금지

---

## 5. 기술 스택

### 5.1 아키텍처 개요
```
[Client: React SPA]  ←→  [REST API: Express]  ←→  [PostgreSQL 17]
```

### 5.2 기술 스택 명세

| 레이어 | 기술 | 버전 | 비고 |
|--------|------|------|------|
| **프론트엔드** | React | 19 | |
| | TypeScript | 5.x | |
| | Zustand | 최신 | 전역 상태 관리 — JWT 토큰을 메모리에만 저장 (localStorage 미사용) |
| | TanStack Query | v5 | 서버 상태 캐싱 및 비동기 처리 |
| | Vite | 최신 | 빌드 도구 |
| **백엔드** | Node.js | ≥22 | TypeScript 미사용, 순수 JavaScript |
| | Express | 5.x | REST API 서버 |
| | pg | 최신 | **PostgreSQL 연동 필수 라이브러리** |
| | jsonwebtoken | 최신 | JWT 발급/검증 |
| | bcrypt | 최신 | 비밀번호 해싱 |
| **데이터베이스** | PostgreSQL | 17 | |
| **인증 (1차)** | JWT | - | Access + Refresh Token |
| **인증 (2차)** | OAuth 2.0 | - | Google, Facebook |

> **pg 라이브러리 필수 사용**: PostgreSQL 연동 시 반드시 `pg` 패키지를 사용한다. ORM(Prisma, TypeORM 등) 사용 금지.

---

## 6. API 설계 (REST)

### 6.1 공통 규칙
- Base URL: `/api/v1`
- 인증이 필요한 API: `Authorization: Bearer <access_token>` 헤더 필수
- 응답 형식: `application/json`
- 에러 응답 형식:
  ```json
  { "error": { "code": "ERROR_CODE", "message": "설명" } }
  ```

### 6.2 에러 코드 목록

| 코드 | HTTP 상태 | 설명 |
|------|:---------:|------|
| `AUTH_001` | 401 | Authorization 헤더 없음 |
| `AUTH_002` | 401 | Access Token 만료 |
| `AUTH_003` | 401 | 유효하지 않은 토큰 |
| `AUTH_004` | 403 | 타인의 리소스에 접근 시도 |
| `AUTH_005` | 401 | Refresh Token 만료 또는 무효 |
| `USER_001` | 409 | 이미 사용 중인 이메일 |
| `USER_002` | 401 | 이메일 또는 비밀번호 불일치 |
| `TODO_001` | 404 | 존재하지 않는 할일 |
| `TODO_002` | 400 | 잘못된 필터 파라미터 값 |
| `CAT_001` | 404 | 존재하지 않는 카테고리 |
| `CAT_002` | 400 | 기본 카테고리는 삭제 불가 |
| `CAT_003` | 400 | 카테고리 최대 개수(20개) 초과 |
| `VALID_001` | 400 | 필수 입력 항목 누락 또는 형식 오류 |
| `SERVER_001` | 500 | 내부 서버 오류 |

### 6.3 엔드포인트 목록

#### 인증 (Auth)
| Method | URL | 인증 필요 | 설명 |
|--------|-----|:---------:|------|
| POST | `/api/v1/auth/register` | ❌ | 회원가입 |
| POST | `/api/v1/auth/login` | ❌ | 로그인 |
| POST | `/api/v1/auth/refresh` | ❌ | Access Token 재발급 |
| POST | `/api/v1/auth/logout` | ✅ | 로그아웃 (Refresh Token 무효화) |

#### 사용자 (Users)
| Method | URL | 인증 필요 | 설명 |
|--------|-----|:---------:|------|
| GET | `/api/v1/users/me` | ✅ | 내 정보 조회 |
| PATCH | `/api/v1/users/me` | ✅ | 내 정보 수정 (이름, 비밀번호) |
| DELETE | `/api/v1/users/me` | ✅ | 회원 탈퇴 |

#### 카테고리 (Categories)
| Method | URL | 인증 필요 | 설명 |
|--------|-----|:---------:|------|
| GET | `/api/v1/categories` | ✅ | 카테고리 목록 조회 |
| POST | `/api/v1/categories` | ✅ | 카테고리 추가 |
| PATCH | `/api/v1/categories/:id` | ✅ | 카테고리 수정 |
| DELETE | `/api/v1/categories/:id` | ✅ | 카테고리 삭제 |

#### 할일 (Todos)
| Method | URL | 인증 필요 | 설명 |
|--------|-----|:---------:|------|
| GET | `/api/v1/todos` | ✅ | 할일 목록 조회 (필터링 지원) |
| POST | `/api/v1/todos` | ✅ | 할일 등록 |
| GET | `/api/v1/todos/:id` | ✅ | 할일 상세 조회 |
| PATCH | `/api/v1/todos/:id` | ✅ | 할일 수정 |
| DELETE | `/api/v1/todos/:id` | ✅ | 할일 삭제 |
| PATCH | `/api/v1/todos/:id/done` | ✅ | 완료 여부 토글 |

#### 할일 목록 쿼리 파라미터
```
GET /api/v1/todos?category_id=1&status=undone&period=today&sort=due_date&order=asc&page=1&limit=20
```
| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| `category_id` | number | - | 카테고리 필터 |
| `status` | `all\|done\|undone` | `all` | 완료 여부 필터 |
| `period` | `all\|today\|overdue\|upcoming` | `all` | 기간 필터 |
| `sort` | `due_date\|created_at` | `due_date` | 정렬 기준 |
| `order` | `asc\|desc` | `asc` | 정렬 방향 |
| `page` | number | `1` | 페이지 번호 |
| `limit` | number | `20` | 페이지당 항목 수 (최대 100) |

#### 할일 목록 응답 형식
```json
{
  "data": [ /* TodoItem 배열 */ ],
  "pagination": {
    "total": 57,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

## 7. 데이터 모델 (PostgreSQL)

### 7.1 ERD 개요
```
users (1) ──── (N) categories
users (1) ──── (N) todos
categories (1) ──── (N) todos
users (1) ──── (N) refresh_tokens
```

### 7.2 테이블 정의

```sql
-- 사용자
CREATE TABLE users (
  id          SERIAL PRIMARY KEY,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,  -- bcrypt hash
  name        VARCHAR(100) NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Refresh Token 저장
CREATE TABLE refresh_tokens (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       TEXT UNIQUE NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 카테고리
CREATE TABLE categories (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  color       CHAR(7) DEFAULT '#6B7280',  -- Hex color
  is_default  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 할일
-- category_id: ON DELETE 없음 (RESTRICT 기본값).
-- 카테고리 삭제는 반드시 애플리케이션에서 할일 이전 후 삭제 처리 (7.3 참고).
CREATE TABLE todos (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id  INTEGER NOT NULL REFERENCES categories(id),
  title        VARCHAR(200) NOT NULL,
  description  TEXT,
  due_date     DATE NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
```

### 7.3 카테고리 삭제 처리 흐름

카테고리 삭제 API(`DELETE /api/v1/categories/:id`) 호출 시 아래 순서를 **단일 트랜잭션** 내에서 실행한다.

```
1. 요청한 category_id가 현재 사용자 소유인지 확인 → 아니면 AUTH_004
2. is_default = true 이면 삭제 거부 → CAT_002
3. 해당 사용자의 '일반' 기본 카테고리 ID 조회
4. todos.category_id = 삭제 대상 ID → '일반' 카테고리 ID로 일괄 UPDATE
5. categories 레코드 DELETE
6. 트랜잭션 커밋
```

> DB 외래키(`category_id`)에 `ON DELETE` 정책을 두지 않는 이유: 단순 CASCADE 삭제 시 소속 할일까지 삭제되어 데이터 손실이 발생하기 때문이다. 이전(migrate) 후 삭제하는 순서를 애플리케이션이 보장한다.

### 7.4 인덱스
```sql
CREATE INDEX idx_todos_user_id        ON todos(user_id);
CREATE INDEX idx_todos_category_id    ON todos(category_id);
CREATE INDEX idx_todos_due_date       ON todos(due_date);
CREATE INDEX idx_categories_user_id   ON categories(user_id);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
```

---

## 8. UX/UI 요구사항

### 8.1 반응형 브레이크포인트
| 구간 | 너비 | 레이아웃 |
|------|------|----------|
| Mobile | < 768px | 단일 컬럼, 하단 탭 내비게이션 |
| Tablet | 768px ~ 1024px | 2컬럼 (사이드바 + 컨텐츠) |
| Desktop | > 1024px | 2컬럼 (고정 사이드바 + 컨텐츠) |

### 8.2 주요 화면 목록
| 화면 | 경로 | 설명 |
|------|------|------|
| 로그인 | `/login` | 이메일/비밀번호 입력 |
| 회원가입 | `/register` | 이름/이메일/비밀번호 입력 |
| 할일 목록 | `/todos` | 필터바 + 할일 카드 리스트 |
| 할일 등록/수정 | `/todos/new`, `/todos/:id/edit` | 폼 화면 |
| 카테고리 관리 | `/categories` | 카테고리 목록 + CRUD |
| 내 정보 수정 | `/settings` | 이름/비밀번호 변경, 회원탈퇴 |

### 8.3 1차 제외 항목
- 다크 모드 (2차 릴리즈)
- 다국어(i18n) 지원 (2차 릴리즈) → 1차는 한국어 전용

---

## 9. 릴리즈 계획 (MVP 3일)

### 9.1 개발 일정

| Day | 작업 항목 |
|-----|-----------|
| **Day 1** | DB 스키마 생성 / 마이그레이션 스크립트 작성 |
| | 백엔드: 인증 API (회원가입, 로그인, 토큰 재발급, 로그아웃) |
| | 백엔드: 사용자 API (내 정보 조회/수정, 회원탈퇴) |
| | 프론트엔드: 로그인/회원가입 화면, JWT 토큰 관리 (Zustand) |
| **Day 2** | 백엔드: 카테고리 API 전체 |
| | 백엔드: 할일 API 전체 (CRUD + 완료 토글 + 필터링) |
| | 프론트엔드: 할일 목록/등록/수정 화면 (TanStack Query 연동) |
| | 프론트엔드: 카테고리 관리 화면 |
| **Day 3** | 프론트엔드: 반응형 UI 적용 (모바일 웹) |
| | 통합 테스트 및 버그 수정 |
| | 배포 환경 설정 및 README 작성 |

### 9.2 2차 릴리즈 항목
- OAuth 소셜 로그인 (Google, Facebook)
- 다크 모드
- 다국어 지원 (한국어 / 영어)

---

## 10. 제약사항 및 가정

| 항목 | 내용 |
|------|------|
| **DB 라이브러리** | PostgreSQL 연동 시 반드시 `pg` 패키지 사용 (ORM 금지) |
| **인증** | 1차는 JWT만 구현, OAuth는 2차에서 확장 |
| **데이터 삭제** | 회원 탈퇴 시 CASCADE 삭제로 즉시 물리 삭제 |
| **다크 모드/i18n** | 1차 제외, 컴포넌트 설계 시 확장 고려 |
| **운영 규모** | 소규모 개인 프로젝트 (동시 접속 최대 300명) |
| **이메일 인증** | 1차에서는 이메일 인증 없이 가입 즉시 사용 가능 |
| **파일 첨부** | 할일에 파일 첨부 기능 미지원 |

---

## 11. 용어 정의 (Ubiquitous Language)

> 도메인 정의서의 용어를 그대로 준용한다. 코드, API, UI 전반에서 아래 용어를 일관되게 사용한다.

| 용어 | 코드/API 표현 | 정의 |
|------|--------------|------|
| **사용자 (User)** | `user`, `userId` | 시스템에 가입하고 할일을 관리하는 주체 |
| **인증 (Authentication)** | `auth`, `token` | 사용자가 자신의 신원을 증명하는 프로세스 (로그인) |
| **할일 (TodoItem)** | `todo`, `todoId` | 사용자가 수행해야 할 업무 또는 작업의 단위 |
| **카테고리 (Category)** | `category`, `categoryId` | 할일을 논리적으로 분류하기 위한 그룹 |
| **기본 카테고리** | `isDefault: true` | 시스템에서 모든 사용자에게 자동으로 제공하는 초기 카테고리 |
| **종료 예정일 (DueDate)** | `dueDate`, `due_date` | 할일이 완료되어야 할 목표 날짜 |
| **완료 여부 (IsCompleted)** | `isCompleted`, `is_completed` | 할일의 진행 상태를 나타내는 Boolean 값 |
| **데이터 격리 (Data Isolation)** | JWT `userId` 검증 | 각 사용자의 데이터가 다른 사용자와 완전히 분리된 상태 |
| **필터링 (Filtering)** | `status`, `period`, `category_id` | 특정 조건에 따라 할일 목록을 선택적으로 조회하는 기능 |
