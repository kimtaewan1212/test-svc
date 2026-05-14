async function seedDb(pool) {
  const userRes = await pool.query(
    `INSERT INTO users (email, password, name)
     VALUES ('seed@example.com', '$2b$12$placeholder_hashed_password', '테스트유저')
     RETURNING id`
  );
  const userId = userRes.rows[0].id;

  const catRes = await pool.query(
    `INSERT INTO categories (user_id, name, color, is_default) VALUES
       ($1, '일반', '#6B7280', TRUE),
       ($1, '업무', '#3B82F6', TRUE),
       ($1, '개인', '#10B981', TRUE)
     RETURNING id, name`,
    [userId]
  );

  const categoryIds = {
    general:  catRes.rows.find(r => r.name === '일반').id,
    work:     catRes.rows.find(r => r.name === '업무').id,
    personal: catRes.rows.find(r => r.name === '개인').id,
  };

  return { userId, categoryIds };
}

module.exports = { seedDb };
