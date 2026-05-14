async function resetDb(pool) {
  await pool.query(`
    TRUNCATE TABLE todos, categories, refresh_tokens, users
    RESTART IDENTITY CASCADE
  `);
}

module.exports = { resetDb };
