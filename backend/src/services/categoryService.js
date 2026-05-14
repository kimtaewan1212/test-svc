'use strict';

const categoryRepo = require('../repositories/categoryRepository');
const todoRepo = require('../repositories/todoRepository');
const pool = require('../config/db');
const ERROR = require('../constants/errorCodes');

const MAX_CATEGORIES = 20;

function makeAppError(errorDef) {
  const err = new Error(errorDef.message);
  err.code = errorDef.code;
  err.status = errorDef.status;
  return err;
}

async function getAll(userId) {
  return categoryRepo.findAllByUserId(userId);
}

async function create(userId, name, color) {
  const count = await categoryRepo.countByUserId(userId);
  if (count >= MAX_CATEGORIES) throw makeAppError(ERROR.CAT_003);
  return categoryRepo.create(userId, name, color || '#6B7280', false);
}

async function update(userId, categoryId, data) {
  const cat = await categoryRepo.findById(categoryId);
  if (!cat) throw makeAppError(ERROR.CAT_001);
  if (cat.userId !== userId) throw makeAppError(ERROR.AUTH_004);
  return categoryRepo.update(categoryId, data);
}

async function deleteCategoryWithMigration(userId, categoryId) {
  const cat = await categoryRepo.findById(categoryId);
  if (!cat) throw makeAppError(ERROR.CAT_001);
  if (cat.userId !== userId) throw makeAppError(ERROR.AUTH_004);
  if (cat.isDefault) throw makeAppError(ERROR.CAT_002);

  const defaultId = await categoryRepo.findDefaultCategoryId(userId);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      'UPDATE todos SET category_id = $1 WHERE category_id = $2 AND user_id = $3',
      [defaultId, categoryId, userId]
    );
    await client.query('DELETE FROM categories WHERE id = $1', [categoryId]);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { getAll, create, update, delete: deleteCategoryWithMigration };
