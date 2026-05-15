# test-svc (Todo List Service)

Node.js와 Express 기반의 간단하고 가볍운 할일 관리 API 서비스입니다. 인메모리 데이터베이스 LokiJS를 사용하여 빠른 프로토타입 개발 및 테스트에 최적화되어 있습니다.

## 프로젝트 소개

test-svc는 다음과 같은 특징을 가진 Todo 리스트 서비스입니다:

- **빠른 개발**: Express와 LokiJS를 활용한 경량 아키텍처
- **REST API**: 표준 HTTP 메서드를 사용한 직관적인 API 설계
- **다중 사용자 지원**: owner별로 독립적인 할일 목록 관리
- **테스트 용이성**: Jest를 사용한 포괄적인 테스트 환경
- **ES6+ 지원**: Babel을 통한 최신 JavaScript 문법 사용

## 기술 스택

| 항목 | 기술 | 버전 |
|------|------|------|
| **런타임** | Node.js | >=22.0.0 |
| **웹 프레임워크** | Express | 4.21.2 |
| **데이터베이스** | LokiJS | 1.5.12 |
| **템플릿 엔진** | EJS | 3.1.10 |
| **트랜스파일러** | Babel | 7.26.0 |
| **테스트 프레임워크** | Jest | 30.4.2 |
| **개발 도구** | Nodemon | 3.1.7 |

### 주요 라이브러리

- **cors**: CORS 미들웨어
- **morgan**: HTTP 요청 로깅 (선택적)
- **multer**: 파일 업로드 처리 (선택적)
- **shortid**: 고유 ID 생성 (선택적)
- **sleep-promise**: 인위적 지연 처리

## 시작하기

### 필수 요구사항

- Node.js 22.0.0 이상
- npm 10.0.0 이상 (권장)

### 설치

```bash
# 저장소 클론
git clone <repository-url>
cd test-svc

# 의존성 설치
npm install
```

### 개발 서버 실행

Nodemon과 Babel Node를 사용하여 파일 변경 시 자동 재시작됩니다.

```bash
npm run dev
```

서버가 포트 3000에서 시작됩니다.

```
할일 목록 서비스가 3000번 포트에서 시작되었습니다!
```

### 프로덕션 빌드 및 실행

```bash
# Babel로 src를 build 디렉토리로 트랜스파일
npm run build

# 빌드된 파일 실행
npm start
```

또는 한 번에 빌드와 실행:

```bash
npm start
```

## API 문서

### 기본 정보

- **기본 URL**: `http://localhost:3000`
- **응답 형식**: JSON
- **Content-Type**: `application/json`

### 응답 포맷

#### 성공 응답
```json
{
  "status": "success",
  "message": "작업이 성공적으로 완료되었습니다",
  "item": {
    "id": 1715516800123,
    "todo": "ES6 공부",
    "desc": "ES6공부를 해야 합니다",
    "done": true
  }
}
```

#### 실패 응답
```json
{
  "status": "fail",
  "message": "작업 실패 이유"
}
```

### 엔드포인트

#### 1. 홈 페이지

홈페이지를 EJS 템플릿으로 렌더링합니다.

```
GET /
```

**응답**: HTML 페이지 (EJS 렌더링)

**예제**:
```bash
curl http://localhost:3000/
```

---

#### 2. 사용자 정보 조회

사용자 정보를 조회합니다. (3초 지연 포함)

```
GET /users/:id
```

**경로 파라미터**:
- `id` (string): 사용자 ID

**응답**:
```json
{
  "id": "123",
  "userid": "gdhong",
  "username": "홍길동"
}
```

**예제**:
```bash
curl http://localhost:3000/users/123
```

---

#### 3. 새 오너 및 샘플 데이터 생성

새로운 owner를 생성하고 샘플 데이터 3개를 자동으로 생성합니다.

```
GET /todolist/:owner/create
```

**경로 파라미터**:
- `owner` (string): 새로운 소유자 이름

**응답**:
```json
{
  "status": "success",
  "message": "샘플 데이터 생성 성공!"
}
```

**오류 응답**:
```json
{
  "status": "fail",
  "message": "생성 실패 : 이미 존재하는 owner입니다."
}
```

**예제**:
```bash
curl http://localhost:3000/todolist/newuser/create
```

---

#### 4. 할일 목록 조회

특정 owner의 모든 할일을 조회합니다.

```
GET /todolist/:owner
```

**경로 파라미터**:
- `owner` (string): 소유자 이름

**응답**:
```json
[
  {
    "id": 1715516800123,
    "todo": "ES6 공부",
    "desc": "ES6공부를 해야 합니다",
    "done": true
  },
  {
    "id": 1715516800124,
    "todo": "Vue 학습",
    "desc": "Vue 학습을 해야 합니다",
    "done": false
  }
]
```

**예제**:
```bash
curl http://localhost:3000/todolist/gdhong
```

---

#### 5. 할일 항목 단건 조회

특정 할일 항목을 ID로 조회합니다.

```
GET /todolist/:owner/:id
```

**경로 파라미터**:
- `owner` (string): 소유자 이름
- `id` (number): 할일 항목 ID

**응답**:
```json
{
  "id": 1715516800123,
  "todo": "ES6 공부",
  "desc": "ES6공부를 해야 합니다",
  "done": true
}
```

**예제**:
```bash
curl http://localhost:3000/todolist/gdhong/1715516800123
```

---

#### 6. 할일 추가

새로운 할일을 추가합니다.

```
POST /todolist/:owner
```

**경로 파라미터**:
- `owner` (string): 소유자 이름

**요청 바디**:
```json
{
  "todo": "React 학습",
  "desc": "React를 공부해야 합니다"
}
```

**응답**:
```json
{
  "status": "success",
  "message": "추가 성공",
  "item": {
    "id": 1715516800125,
    "todo": "React 학습",
    "desc": "React를 공부해야 합니다"
  }
}
```

**오류 응답**:
```json
{
  "status": "fail",
  "message": "추가 실패 : 할일을 입력하셔야 합니다."
}
```

**예제**:
```bash
curl -X POST http://localhost:3000/todolist/gdhong \
  -H "Content-Type: application/json" \
  -d '{
    "todo": "React 학습",
    "desc": "React를 공부해야 합니다"
  }'
```

---

#### 7. 할일 수정

기존 할일을 수정합니다. 수정할 필드만 전송 가능합니다.

```
PUT /todolist/:owner/:id
```

**경로 파라미터**:
- `owner` (string): 소유자 이름
- `id` (number): 할일 항목 ID

**요청 바디** (선택적):
```json
{
  "todo": "수정된 제목",
  "desc": "수정된 설명",
  "done": true
}
```

**응답**:
```json
{
  "status": "success",
  "message": "할일 변경 성공",
  "item": {
    "id": 1715516800123,
    "todo": "수정된 제목",
    "desc": "수정된 설명",
    "done": true
  }
}
```

**예제**:
```bash
curl -X PUT http://localhost:3000/todolist/gdhong/1715516800123 \
  -H "Content-Type: application/json" \
  -d '{
    "todo": "수정된 제목",
    "done": true
  }'
```

---

#### 8. 완료 상태 토글

할일의 완료 상태를 토글합니다.

```
PUT /todolist/:owner/:id/done
```

**경로 파라미터**:
- `owner` (string): 소유자 이름
- `id` (number): 할일 항목 ID

**응답**:
```json
{
  "status": "success",
  "message": "완료 변경 성공",
  "item": {
    "id": 1715516800123,
    "todo": "ES6 공부",
    "done": false
  }
}
```

**예제**:
```bash
curl -X PUT http://localhost:3000/todolist/gdhong/1715516800123/done
```

---

#### 9. 할일 삭제

할일을 삭제합니다.

```
DELETE /todolist/:owner/:id
```

**경로 파라미터**:
- `owner` (string): 소유자 이름
- `id` (number): 할일 항목 ID

**응답**:
```json
{
  "status": "success",
  "message": "삭제 성공",
  "item": {
    "id": 1715516800123,
    "todo": "ES6 공부"
  }
}
```

**예제**:
```bash
curl -X DELETE http://localhost:3000/todolist/gdhong/1715516800123
```

---

### `_long` 버전 라우트

모든 엔드포인트는 `/todolist_long/` 접두사 버전을 지원하며, 1초의 인위적 지연이 추가됩니다. 네트워크 지연을 시뮬레이션할 때 유용합니다.

**예제**:
```bash
# 1초 지연이 추가됨
curl http://localhost:3000/todolist_long/gdhong
```

## 샘플 데이터

서버 시작 시 다음과 같은 샘플 데이터가 자동으로 생성됩니다:

### gdhong owner
- ES6 공부 (완료)
- Vue 학습 (미완료)
- 놀기 (완료)
- 야구장 (미완료)

### mrlee owner
- 남원구경 (완료)
- 저녁약속(10.11) (미완료)
- AWS 밋업 (미완료)
- AAI 모임 (완료)

## 테스트

Jest를 사용한 자동화된 테스트를 실행합니다.

```bash
npm test
```

### 테스트 실행 예제

```bash
# 모든 테스트 실행
npm test

# 특정 파일만 테스트
npm test -- tododao.test.js

# 감시 모드로 실행
npm test -- --watch
```

### Babel-jest 설정

`package.json`의 jest 설정에서 Babel을 트랜스파일러로 사용합니다.

```json
"jest": {
  "transform": {
    "^.+\\.js$": "babel-jest"
  },
  "moduleNameMapper": {
    "^@/(.*)$": "<rootDir>/src/$1"
  }
}
```

경로 별칭 `@/`를 사용하여 `src/` 디렉토리의 모듈을 import할 수 있습니다.

## 프로젝트 구조

```
test-svc/
├── src/                    # 소스 코드
│   ├── index.js           # Express 애플리케이션 진입점
│   ├── routes.js          # API 라우트 정의
│   └── tododao.js         # 데이터 접근 계층
├── build/                 # Babel 빌드 결과물
│   ├── index.js
│   ├── routes.js
│   └── tododao.js
├── views/                 # EJS 템플릿
│   └── index.ejs          # 홈페이지 템플릿
├── public/                # 정적 리소스
│   ├── css/               # 스타일시트
│   ├── js/                # 클라이언트 JavaScript
│   ├── fonts/             # 폰트 파일
│   ├── font-awesome/      # Font Awesome 아이콘
│   └── img/               # 이미지 파일
├── .babelrc               # Babel 설정
├── .gitignore             # Git 무시 파일
├── package.json           # 프로젝트 메타데이터
└── README.md              # 이 파일
```

## 주의사항

### 인메모리 데이터베이스

**LokiJS는 인메모리 데이터베이스**이므로 다음 사항을 주의하세요:

- **데이터 영속성 없음**: 서버를 재시작하면 데이터가 모두 초기화됩니다.
- **프로토타입 개발용**: 프로덕션 환경에서는 MongoDB, PostgreSQL 등의 영구 데이터베이스 사용을 권장합니다.
- **메모리 제약**: 매우 큰 데이터셋을 다루면 메모리 문제가 발생할 수 있습니다.

### ID 생성

- ID는 `new Date().getTime()`을 기반으로 생성됩니다.
- 시간 단위로는 고유성이 보장되지만, 동일 밀리초 내 여러 항목 생성 시 내부 카운터(`idCounter`)로 구분합니다.

### 환경 변수

포트 설정은 환경 변수로 변경할 수 있습니다:

```bash
# 포트 8000에서 실행
PORT=8000 npm run dev
```

기본 포트는 **3000**입니다.

### CORS 설정

현재 모든 origin에서의 요청을 허용합니다. 프로덕션 환경에서는 다음과 같이 수정하세요:

```javascript
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));
```

### 캐시 제어

모든 응답에 캐시 비활성화 헤더가 추가됩니다:

```
Cache-Control: private, no-cache, no-store, must-revalidate
Expires: -1
Pragma: no-cache
```

## 개발 가이드

### 코드 스타일

- ES6+ 문법 사용
- 모듈은 `import/export` 사용
- Babel로 트랜스파일되므로 최신 문법 자유롭게 사용

### 새로운 라우트 추가

`src/routes.js`에 라우트를 추가하세요:

```javascript
app.get("/your-route", (req, res) => {
  logRequest('GET', '/your-route');
  res.json({ message: "Your message" });
});
```

### 새로운 데이터 함수 추가

`src/tododao.js`에 데이터 접근 함수를 추가하고 export하세요:

```javascript
export const yourFunction = ({ param1, param2 }) => {
  try {
    // 구현
    return { status: "success", message: "..." };
  } catch (ex) {
    return { status: "fail", message: "..." };
  }
};
```

그 후 `src/routes.js`에서 import하여 사용합니다.

## 문제 해결

### 포트 이미 사용 중

```bash
# 다른 포트 사용
PORT=3001 npm run dev
```

### 의존성 설치 오류

```bash
# node_modules 삭제 후 재설치
rm -rf node_modules
npm install
```

### Babel 트랜스파일 오류

```bash
# 빌드 디렉토리 삭제 후 재빌드
rm -rf build
npm run build
```

## 라이선스

ISC

## 기여

프로젝트 개선에 대한 기여를 환영합니다. Pull Request를 제출해 주세요.

## 연락처

개발자: kim tae wan  
이메일: kimtaewan1212@gmail.com
