# TodoListApp 프론트엔드 통합 가이드

**문서 버전**: 1.0  
**작성일**: 2026-05-14  
**참조 문서**: [PRD](./2-prd.md) · [프로젝트 구조](./4-project-structure.md)

---

## 1. 기본 설정

### 1.1 Base URL

| 환경 | URL |
|------|-----|
| 개발 | `http://localhost:3000/api/v1` |
| 환경 변수 | `VITE_API_BASE_URL=http://localhost:3000/api/v1` |

CORS 허용 오리진: `http://localhost:5173` (개발 환경 기준)

### 1.2 공통 요청 헤더

```
Content-Type: application/json
Authorization: Bearer <accessToken>   // 인증이 필요한 API에만
```

### 1.3 네이밍 규칙 — 중요

| 위치 | 규칙 | 예시 |
|------|------|------|
| 요청 **body** 필드 | camelCase | `categoryId`, `dueDate`, `isCompleted` |
| 요청 **query 파라미터** | snake_case | `category_id`, `sort`, `order` |
| 응답 JSON 필드 | camelCase | `userId`, `createdAt`, `isCompleted` |

---

## 2. 인증 흐름

### 2.1 회원가입

```
POST /auth/register
```

**Request body**
```json
{
  "email": "user@example.com",
  "password": "Password1",
  "name": "홍길동"
}
```

**Response `201 Created`**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "홍길동",
    "createdAt": "2026-05-14T09:00:00.000Z",
    "updatedAt": "2026-05-14T09:00:00.000Z"
  },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

> 회원가입 성공 시 토큰이 즉시 발급된다. 별도 로그인 불필요 — 응답의 토큰을 그대로 저장하고 `/todos`로 리다이렉트한다.
> 
> 기본 카테고리 3개(일반·업무·개인)가 자동 생성된다.

---

### 2.2 로그인

```
POST /auth/login
```

**Request body**
```json
{
  "email": "user@example.com",
  "password": "Password1"
}
```

**Response `200 OK`**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "홍길동",
    "createdAt": "2026-05-14T09:00:00.000Z",
    "updatedAt": "2026-05-14T09:00:00.000Z"
  },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

---

### 2.3 Access Token 재발급

```
POST /auth/refresh
```

**Request body**
```json
{
  "refreshToken": "eyJ..."
}
```

**Response `200 OK`**
```json
{
  "accessToken": "eyJ..."
}
```

> Refresh Token이 만료되었거나 DB에 없으면 `AUTH_005` (401)을 반환한다. 이 경우 로그인 페이지로 리다이렉트한다.

---

### 2.4 로그아웃

```
POST /auth/logout
Authorization: Bearer <accessToken>
```

**Request body**
```json
{
  "refreshToken": "eyJ..."
}
```

**Response `200 OK`**
```json
{
  "message": "로그아웃 성공"
}
```

---

### 2.5 토큰 관리 정책

- **저장 위치**: Zustand 메모리 스토어에만 저장. `localStorage` / `sessionStorage` 사용 금지.
- **Access Token 만료**: 1시간
- **Refresh Token 만료**: 7일 (DB 저장)
- **페이지 새로고침**: 메모리 초기화 → 재로그인 필요 (의도된 정책)

---

### 2.6 401 자동 갱신 인터셉터 패턴

API 클라이언트에서 아래 흐름으로 토큰 자동 갱신을 구현한다.

```
1. API 요청 → 401 응답 수신
2. 에러 코드가 AUTH_002(토큰 만료)인지 확인
3. Zustand 스토어에 refreshToken이 있으면:
   POST /auth/refresh → 새 accessToken 획득
   Zustand 스토어 업데이트
   원래 요청을 새 accessToken으로 재시도
4. refreshToken이 없거나 갱신 실패(AUTH_005):
   Zustand 스토어 초기화
   /login으로 리다이렉트
```

---

## 3. 사용자 API

모든 엔드포인트에 `Authorization: Bearer <accessToken>` 필요.

### 3.1 내 정보 조회

```
GET /users/me
```

**Response `200 OK`**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "홍길동",
  "createdAt": "2026-05-14T09:00:00.000Z",
  "updatedAt": "2026-05-14T09:00:00.000Z"
}
```

---

### 3.2 내 정보 수정

```
PATCH /users/me
```

**Request body** (변경할 필드만 포함)
```json
{
  "name": "새이름"
}
```

비밀번호 변경 시 `currentPassword` 필수:
```json
{
  "password": "NewPassword1",
  "currentPassword": "OldPassword1"
}
```

**Response `200 OK`** — 수정된 사용자 객체 (3.1과 동일한 형태)

---

### 3.3 회원 탈퇴

```
DELETE /users/me
```

**Response `204 No Content`** (응답 본문 없음)

> 탈퇴 처리 후 Zustand 스토어 초기화 및 `/login` 리다이렉트.

---

## 4. 카테고리 API

모든 엔드포인트에 `Authorization: Bearer <accessToken>` 필요.

### 4.1 카테고리 목록 조회

```
GET /categories
```

**Response `200 OK`**
```json
[
  {
    "id": 1,
    "userId": 1,
    "name": "일반",
    "color": "#6B7280",
    "isDefault": true,
    "createdAt": "2026-05-14T09:00:00.000Z"
  },
  {
    "id": 2,
    "userId": 1,
    "name": "업무",
    "color": "#3B82F6",
    "isDefault": true,
    "createdAt": "2026-05-14T09:00:00.000Z"
  },
  {
    "id": 3,
    "userId": 1,
    "name": "개인",
    "color": "#10B981",
    "isDefault": true,
    "createdAt": "2026-05-14T09:00:00.000Z"
  }
]
```

> 생성일 오름차순 정렬. 기본 카테고리 3개가 맨 위에 위치한다.

---

### 4.2 카테고리 추가

```
POST /categories
```

**Request body**
```json
{
  "name": "클라이언트A",
  "color": "#EF4444"
}
```

`color` 생략 시 기본값 `#6B7280` 적용.

**Response `201 Created`**
```json
{
  "id": 4,
  "userId": 1,
  "name": "클라이언트A",
  "color": "#EF4444",
  "isDefault": false,
  "createdAt": "2026-05-14T10:00:00.000Z"
}
```

---

### 4.3 카테고리 수정

```
PATCH /categories/:id
```

**Request body** (변경할 필드만 포함)
```json
{
  "name": "새이름",
  "color": "#8B5CF6"
}
```

**Response `200 OK`** — 수정된 카테고리 객체 (4.1 배열 원소와 동일한 형태)

> `isDefault: true`인 카테고리도 이름·색상 수정은 가능하다.

---

### 4.4 카테고리 삭제

```
DELETE /categories/:id
```

**Response `204 No Content`** (응답 본문 없음)

> - 삭제 대상 카테고리의 할일은 자동으로 "일반" 카테고리로 이전된다.
> - `isDefault: true`인 카테고리는 `CAT_002` (400) 오류.

---

## 5. 할일 API

모든 엔드포인트에 `Authorization: Bearer <accessToken>` 필요.

### 5.1 할일 목록 조회

```
GET /todos
```

**Query 파라미터** (모두 선택)

| 파라미터 | 타입 | 기본값 | 허용값 |
|----------|------|--------|--------|
| `category_id` | number | - | 카테고리 ID |
| `status` | string | `all` | `all` \| `done` \| `undone` |
| `period` | string | `all` | `all` \| `today` \| `overdue` \| `upcoming` |
| `sort` | string | `due_date` | `due_date` \| `created_at` |
| `order` | string | `asc` | `asc` \| `desc` |
| `page` | number | `1` | 1 이상 |
| `limit` | number | `20` | 1 ~ 100 |

**예시**
```
GET /todos?category_id=2&status=undone&period=upcoming&page=1&limit=20
```

**Response `200 OK`**
```json
{
  "data": [
    {
      "id": 1,
      "userId": 1,
      "categoryId": 2,
      "title": "보고서 작성",
      "description": "분기별 성과 보고서",
      "dueDate": "2026-05-20",
      "isCompleted": false,
      "createdAt": "2026-05-14T09:00:00.000Z",
      "updatedAt": "2026-05-14T09:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 7,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

### 5.2 할일 등록

```
POST /todos
```

**Request body**
```json
{
  "title": "보고서 작성",
  "description": "분기별 성과 보고서",
  "categoryId": 2,
  "dueDate": "2026-05-20"
}
```

`description` 선택. `title`, `categoryId`, `dueDate` 필수.

**Response `201 Created`** — 생성된 할일 객체 (5.1 배열 원소와 동일한 형태)

---

### 5.3 할일 상세 조회

```
GET /todos/:id
```

**Response `200 OK`** — 할일 객체 (5.1 배열 원소와 동일한 형태)

---

### 5.4 할일 수정

```
PATCH /todos/:id
```

**Request body** (변경할 필드만 포함)
```json
{
  "title": "새 제목",
  "categoryId": 3,
  "dueDate": "2026-05-25",
  "description": "새 설명",
  "isCompleted": true
}
```

**Response `200 OK`** — 수정된 할일 객체

---

### 5.5 할일 삭제

```
DELETE /todos/:id
```

**Response `204 No Content`** (응답 본문 없음)

---

### 5.6 완료 여부 토글

```
PATCH /todos/:id/done
```

요청 본문 불필요.

**Response `200 OK`** — 토글된 할일 객체 (`isCompleted` 값이 반전됨)

---

## 6. 에러 응답 형식

모든 오류 응답은 아래 형태를 따른다.

```json
{
  "error": {
    "code": "AUTH_002",
    "message": "Access Token 만료"
  }
}
```

### 에러 코드 목록

| 코드 | HTTP | 설명 | 처리 방법 |
|------|:----:|------|-----------|
| `AUTH_001` | 401 | Authorization 헤더 없음 | 로그인 페이지로 이동 |
| `AUTH_002` | 401 | Access Token 만료 | 토큰 갱신 후 재요청 |
| `AUTH_003` | 401 | 유효하지 않은 토큰 | 로그인 페이지로 이동 |
| `AUTH_004` | 403 | 타인의 리소스 접근 시도 | 403 오류 메시지 표시 |
| `AUTH_005` | 401 | Refresh Token 만료 또는 무효 | 로그인 페이지로 이동 |
| `USER_001` | 409 | 이미 사용 중인 이메일 | "이미 가입된 이메일입니다" 안내 |
| `USER_002` | 401 | 이메일 또는 비밀번호 불일치 | "이메일 또는 비밀번호 오류" 안내 |
| `TODO_001` | 404 | 존재하지 않는 할일 | 404 오류 메시지 표시 |
| `TODO_002` | 400 | 잘못된 필터 파라미터 값 | 파라미터 검증 후 재요청 |
| `CAT_001`  | 404 | 존재하지 않는 카테고리 | 카테고리 목록 새로고침 |
| `CAT_002`  | 400 | 기본 카테고리 삭제 불가 | "기본 카테고리는 삭제할 수 없습니다" 안내 |
| `CAT_003`  | 400 | 카테고리 최대 개수(20개) 초과 | "카테고리는 최대 20개" 안내 |
| `VALID_001`| 400 | 필수 입력 항목 누락 또는 형식 오류 | 입력 폼 오류 표시 |
| `SERVER_001`| 500 | 내부 서버 오류 | "잠시 후 다시 시도해주세요" 안내 |

---

## 7. HTTP 상태 코드 요약

| 상황 | 코드 |
|------|:----:|
| 조회 성공 | 200 |
| 생성 성공 (register, login, create) | 201 또는 200 |
| 삭제 성공 (todo, category, user 탈퇴) | 204 |
| 입력 오류 | 400 |
| 인증 실패 | 401 |
| 권한 없음 | 403 |
| 리소스 없음 | 404 |
| 중복 (이메일) | 409 |
| 서버 오류 | 500 |

> **204 No Content**: 응답 본문이 없다. `response.json()` 호출 금지 — 파싱 오류가 발생한다.

---

## 8. 엔드포인트 빠른 참조

| Method | URL | 인증 | 응답 코드 |
|--------|-----|:----:|:---------:|
| POST | `/auth/register` | ❌ | 201 |
| POST | `/auth/login` | ❌ | 200 |
| POST | `/auth/refresh` | ❌ | 200 |
| POST | `/auth/logout` | ✅ | 200 |
| GET | `/users/me` | ✅ | 200 |
| PATCH | `/users/me` | ✅ | 200 |
| DELETE | `/users/me` | ✅ | 204 |
| GET | `/categories` | ✅ | 200 |
| POST | `/categories` | ✅ | 201 |
| PATCH | `/categories/:id` | ✅ | 200 |
| DELETE | `/categories/:id` | ✅ | 204 |
| GET | `/todos` | ✅ | 200 |
| POST | `/todos` | ✅ | 201 |
| GET | `/todos/:id` | ✅ | 200 |
| PATCH | `/todos/:id` | ✅ | 200 |
| DELETE | `/todos/:id` | ✅ | 204 |
| PATCH | `/todos/:id/done` | ✅ | 200 |
