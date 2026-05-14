CREATE TABLE IF NOT EXISTS todos (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id  INTEGER      NOT NULL REFERENCES categories(id),
  title        VARCHAR(200) NOT NULL,
  description  TEXT,
  due_date     DATE         NOT NULL,
  is_completed BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_todos_updated_at
  BEFORE UPDATE ON todos
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
