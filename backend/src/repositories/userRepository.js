'use strict';

const pool = require('../config/db');

function toUser(row, includePassword = false) {
  const user = {
    id: row.id,
    email: row.email,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  if (includePassword) user.password = row.password;
  return user;
}

async function create(email, hashedPassword, name) {
  const { rows } = await pool.query(
    'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING *',
    [email, hashedPassword, name]
  );
  return toUser(rows[0]);
}

async function findByEmail(email) {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return rows[0] ? toUser(rows[0], true) : null;
}

async function findById(id) {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );
  return rows[0] ? toUser(rows[0]) : null;
}

async function findByIdWithPassword(id) {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );
  return rows[0] ? toUser(rows[0], true) : null;
}

async function update(id, data) {
  const fields = [];
  const values = [];
  let idx = 1;

  if (data.name !== undefined) {
    fields.push(`name = $${idx++}`);
    values.push(data.name);
  }
  if (data.password !== undefined) {
    fields.push(`password = $${idx++}`);
    values.push(data.password);
  }

  if (fields.length === 0) return findById(id);

  values.push(id);
  const { rows } = await pool.query(
    `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
    values
  );
  return rows[0] ? toUser(rows[0]) : null;
}

async function deleteById(id) {
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
}

module.exports = { create, findByEmail, findById, findByIdWithPassword, update, deleteById };
