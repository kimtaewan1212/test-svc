'use strict';

const pool = require('../config/db');

function toCategory(row) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    color: row.color,
    isDefault: row.is_default,
    createdAt: row.created_at,
  };
}

async function findAllByUserId(userId) {
  const { rows } = await pool.query(
    'SELECT * FROM categories WHERE user_id = $1 ORDER BY created_at ASC',
    [userId]
  );
  return rows.map(toCategory);
}

async function findById(id) {
  const { rows } = await pool.query(
    'SELECT * FROM categories WHERE id = $1',
    [id]
  );
  return rows[0] ? toCategory(rows[0]) : null;
}

async function findDefaultCategoryId(userId) {
  const { rows } = await pool.query(
    "SELECT id FROM categories WHERE user_id = $1 AND is_default = TRUE AND name = '일반' LIMIT 1",
    [userId]
  );
  return rows[0] ? rows[0].id : null;
}

async function create(userId, name, color, isDefault = false) {
  const { rows } = await pool.query(
    'INSERT INTO categories (user_id, name, color, is_default) VALUES ($1, $2, $3, $4) RETURNING *',
    [userId, name, color || '#6B7280', isDefault]
  );
  return toCategory(rows[0]);
}

async function update(id, data) {
  const fields = [];
  const values = [];
  let idx = 1;

  if (data.name !== undefined) {
    fields.push(`name = $${idx++}`);
    values.push(data.name);
  }
  if (data.color !== undefined) {
    fields.push(`color = $${idx++}`);
    values.push(data.color);
  }

  if (fields.length === 0) return findById(id);

  values.push(id);
  const { rows } = await pool.query(
    `UPDATE categories SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return rows[0] ? toCategory(rows[0]) : null;
}

async function deleteById(id) {
  await pool.query('DELETE FROM categories WHERE id = $1', [id]);
}

async function countByUserId(userId) {
  const { rows } = await pool.query(
    'SELECT COUNT(*)::int AS count FROM categories WHERE user_id = $1',
    [userId]
  );
  return rows[0].count;
}

module.exports = {
  findAllByUserId,
  findById,
  findDefaultCategoryId,
  create,
  update,
  deleteById,
  countByUserId,
};
