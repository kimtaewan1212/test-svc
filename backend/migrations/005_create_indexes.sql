CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id   ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

CREATE INDEX IF NOT EXISTS idx_categories_user_id        ON categories(user_id);

CREATE INDEX IF NOT EXISTS idx_todos_user_id             ON todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_category_id         ON todos(category_id);
CREATE INDEX IF NOT EXISTS idx_todos_due_date            ON todos(due_date);
CREATE INDEX IF NOT EXISTS idx_todos_is_completed        ON todos(is_completed);
