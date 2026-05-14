'use strict';

const pool = require('../config/db');

function toTodo(row) {
  return {
    id: row.id,
    userId: row.user_id,
    categoryId: row.category_id,
    title: row.title,
    description: row.description,
    dueDate: row.due_date,
    isCompleted: row.is_completed,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function buildWhereClause(userId, filters) {
  const conditions = ['user_id = $1'];
  const values = [userId];
  let idx = 2;

  if (filters.categoryId) {
    conditions.push(`category_id = $${idx++}`);
    values.push(filters.categoryId);
  }

  if (filters.status === 'done') {
    conditions.push('is_completed = TRUE');
  } else if (filters.status === 'undone') {
    conditions.push('is_completed = FALSE');
  }

  if (filters.period === 'today') {
    conditions.push('due_date = CURRENT_DATE');
  } else if (filters.period === 'overdue') {
    conditions.push('due_date < CURRENT_DATE AND is_completed = FALSE');
  } else if (filters.period === 'upcoming') {
    conditions.push('due_date > CURRENT_DATE');
  }

  return { where: conditions.join(' AND '), values, nextIdx: idx };
}

async function findAllByUserId(userId, filters = {}, pagination = {}) {
  const { where, values, nextIdx } = buildWhereClause(userId, filters);

  const sortCol = filters.sort === 'created_at' ? 'created_at' : 'due_date';
  const sortDir = filters.order === 'desc' ? 'DESC' : 'ASC';

  const limit = Math.min(parseInt(pagination.limit) || 20, 100);
  const page = Math.max(parseInt(pagination.page) || 1, 1);
  const offset = (page - 1) * limit;

  const query = `
    SELECT * FROM todos
    WHERE ${where}
    ORDER BY ${sortCol} ${sortDir}, created_at DESC
    LIMIT $${nextIdx} OFFSET $${nextIdx + 1}
  `;
  const { rows } = await pool.query(query, [...values, limit, offset]);
  return rows.map(toTodo);
}

async function countByUserId(userId, filters = {}) {
  const { where, values } = buildWhereClause(userId, filters);
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS count FROM todos WHERE ${where}`,
    values
  );
  return rows[0].count;
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM todos WHERE id = $1', [id]);
  return rows[0] ? toTodo(rows[0]) : null;
}

async function create(userId, categoryId, title, description, dueDate) {
  const { rows } = await pool.query(
    'INSERT INTO todos (user_id, category_id, title, description, due_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [userId, categoryId, title, description || null, dueDate]
  );
  return toTodo(rows[0]);
}

async function update(id, data) {
  const fields = [];
  const values = [];
  let idx = 1;

  const allowed = { title: 'title', description: 'description', dueDate: 'due_date', categoryId: 'category_id', isCompleted: 'is_completed' };
  for (const [key, col] of Object.entries(allowed)) {
    if (data[key] !== undefined) {
      fields.push(`${col} = $${idx++}`);
      values.push(data[key]);
    }
  }

  if (fields.length === 0) return findById(id);

  values.push(id);
  const { rows } = await pool.query(
    `UPDATE todos SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
    values
  );
  return rows[0] ? toTodo(rows[0]) : null;
}

async function deleteById(id) {
  await pool.query('DELETE FROM todos WHERE id = $1', [id]);
}

async function toggleComplete(id) {
  const { rows } = await pool.query(
    'UPDATE todos SET is_completed = NOT is_completed, updated_at = NOW() WHERE id = $1 RETURNING *',
    [id]
  );
  return rows[0] ? toTodo(rows[0]) : null;
}

async function updateCategoryIdBulk(fromCategoryId, toCategoryId, userId) {
  await pool.query(
    'UPDATE todos SET category_id = $1 WHERE category_id = $2 AND user_id = $3',
    [toCategoryId, fromCategoryId, userId]
  );
}

module.exports = {
  findAllByUserId,
  countByUserId,
  findById,
  create,
  update,
  deleteById,
  toggleComplete,
  updateCategoryIdBulk,
};
