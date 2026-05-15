-- =============================================================
-- TodoListApp Database Schema
-- Database  : PostgreSQL 17
-- Reference : docs/6-erd.md, docs/2-prd.md (7.2절)
-- =============================================================

-- -------------------------------------------------------------
-- 확장 모듈
-- -------------------------------------------------------------
-- SERIAL 대신 gen_random_uuid() 사용 시 필요 (현재는 SERIAL 사용)
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- =============================================================
-- 테이블 생성
-- 생성 순서: 참조 대상 테이블 먼저 (외래키 의존성 순)
--   1. users
--   2. refresh_tokens
--   3. categories
--   4. todos
-- =============================================================

-- -------------------------------------------------------------
-- 1. users (사용자)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id         SERIAL        PRIMARY KEY,
  email      VARCHAR(255)  NOT NULL,
  password   VARCHAR(255)  NOT NULL,          -- bcrypt hash (salt rounds: 12)
  name       VARCHAR(100)  NOT NULL,
  created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_users_email UNIQUE (email)
);

COMMENT ON TABLE  users           IS '서비스 사용자';
COMMENT ON COLUMN users.email     IS '로그인 이메일 (RFC 5322, 고유)';
COMMENT ON COLUMN users.password  IS 'bcrypt 해시 비밀번호 (평문 저장 금지)';


-- -------------------------------------------------------------
-- 2. refresh_tokens (JWT Refresh Token)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         SERIAL        PRIMARY KEY,
  user_id    INTEGER       NOT NULL,
  token      TEXT          NOT NULL,
  expires_at TIMESTAMPTZ   NOT NULL,
  created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_refresh_tokens_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

  CONSTRAINT uq_refresh_tokens_token UNIQUE (token)
);

COMMENT ON TABLE  refresh_tokens            IS 'JWT Refresh Token 저장 (다중 디바이스 지원)';
COMMENT ON COLUMN refresh_tokens.token      IS 'JWT Refresh Token 값 (고유)';
COMMENT ON COLUMN refresh_tokens.expires_at IS '토큰 만료 일시 (7일)';


-- -------------------------------------------------------------
-- 3. categories (카테고리)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id         SERIAL        PRIMARY KEY,
  user_id    INTEGER       NOT NULL,
  name       VARCHAR(100)  NOT NULL,
  color      CHAR(7)       NOT NULL DEFAULT '#6B7280', -- Hex: #RRGGBB
  is_default BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_categories_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

COMMENT ON TABLE  categories            IS '할일 분류 카테고리 (사용자별 독립)';
COMMENT ON COLUMN categories.color      IS '카테고리 색상 (#RRGGBB 형식)';
COMMENT ON COLUMN categories.is_default IS 'TRUE이면 삭제 불가 (일반·업무·개인)';


-- -------------------------------------------------------------
-- 4. todos (할일)
-- 주의: category_id에 ON DELETE를 지정하지 않음 (기본 RESTRICT).
--       카테고리 삭제 전 애플리케이션이 반드시 할일을 다른 카테고리로
--       이전한 뒤 삭제해야 한다. (docs/2-prd.md 7.3절 참고)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS todos (
  id           SERIAL        PRIMARY KEY,
  user_id      INTEGER       NOT NULL,
  category_id  INTEGER       NOT NULL,
  title        VARCHAR(200)  NOT NULL,
  description  TEXT,
  due_date     DATE          NOT NULL,
  is_completed BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_todos_user
    FOREIGN KEY (user_id)     REFERENCES users(id)      ON DELETE CASCADE,

  CONSTRAINT fk_todos_category
    FOREIGN KEY (category_id) REFERENCES categories(id) -- RESTRICT (기본값)
);

COMMENT ON TABLE  todos             IS '사용자 할일 목록';
COMMENT ON COLUMN todos.title       IS '할일 제목 (필수, 최대 200자)';
COMMENT ON COLUMN todos.description IS '할일 상세 설명 (선택, 최대 2000자)';
COMMENT ON COLUMN todos.due_date    IS '종료 예정일 (필수)';
COMMENT ON COLUMN todos.is_completed IS '완료 여부 (기본값: FALSE)';


-- =============================================================
-- 인덱스
-- =============================================================

-- refresh_tokens
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id   ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- categories
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);

-- todos
CREATE INDEX IF NOT EXISTS idx_todos_user_id      ON todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_category_id  ON todos(category_id);
CREATE INDEX IF NOT EXISTS idx_todos_due_date     ON todos(due_date);
CREATE INDEX IF NOT EXISTS idx_todos_is_completed ON todos(is_completed);


-- =============================================================
-- updated_at 자동 갱신 트리거 (users, todos)
-- =============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_todos_updated_at
  BEFORE UPDATE ON todos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
