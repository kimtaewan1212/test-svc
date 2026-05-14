'use strict';

const pool = require('../config/db');

function toToken(row) {
  return {
    id: row.id,
    userId: row.user_id,
    token: row.token,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  };
}

async function create(userId, token, expiresAt) {
  const { rows } = await pool.query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3) RETURNING *',
    [userId, token, expiresAt]
  );
  return toToken(rows[0]);
}

async function findByToken(token) {
  const { rows } = await pool.query(
    'SELECT * FROM refresh_tokens WHERE token = $1',
    [token]
  );
  return rows[0] ? toToken(rows[0]) : null;
}

async function deleteByToken(token) {
  await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
}

async function deleteByUserId(userId) {
  await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
}

module.exports = { create, findByToken, deleteByToken, deleteByUserId };
