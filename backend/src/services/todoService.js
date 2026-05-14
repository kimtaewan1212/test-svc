'use strict';

const todoRepo = require('../repositories/todoRepository');
const categoryRepo = require('../repositories/categoryRepository');
const ERROR = require('../constants/errorCodes');

const VALID_STATUS = ['all', 'done', 'undone'];
const VALID_PERIOD = ['all', 'today', 'overdue', 'upcoming'];
const MAX_LIMIT = 100;

function makeAppError(errorDef) {
  const err = new Error(errorDef.message);
  err.code = errorDef.code;
  err.status = errorDef.status;
  return err;
}

async function getAll(userId, filters = {}, pagination = {}) {
  if (filters.status && !VALID_STATUS.includes(filters.status)) throw makeAppError(ERROR.TODO_002);
  if (filters.period && !VALID_PERIOD.includes(filters.period)) throw makeAppError(ERROR.TODO_002);

  const limit = Math.min(parseInt(pagination.limit) || 20, MAX_LIMIT);
  const page = Math.max(parseInt(pagination.page) || 1, 1);

  const [data, total] = await Promise.all([
    todoRepo.findAllByUserId(userId, filters, { limit, page }),
    todoRepo.countByUserId(userId, filters),
  ]);

  return { data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}

async function getById(userId, todoId) {
  const todo = await todoRepo.findById(todoId);
  if (!todo) throw makeAppError(ERROR.TODO_001);
  if (todo.userId !== userId) throw makeAppError(ERROR.AUTH_004);
  return todo;
}

async function create(userId, data) {
  const cat = await categoryRepo.findById(data.categoryId);
  if (!cat || cat.userId !== userId) throw makeAppError(ERROR.CAT_001);

  return todoRepo.create(userId, data.categoryId, data.title, data.description, data.dueDate);
}

async function update(userId, todoId, data) {
  const todo = await todoRepo.findById(todoId);
  if (!todo) throw makeAppError(ERROR.TODO_001);
  if (todo.userId !== userId) throw makeAppError(ERROR.AUTH_004);
  return todoRepo.update(todoId, data);
}

async function deleteTodo(userId, todoId) {
  const todo = await todoRepo.findById(todoId);
  if (!todo) throw makeAppError(ERROR.TODO_001);
  if (todo.userId !== userId) throw makeAppError(ERROR.AUTH_004);
  await todoRepo.deleteById(todoId);
}

async function toggleComplete(userId, todoId) {
  const todo = await todoRepo.findById(todoId);
  if (!todo) throw makeAppError(ERROR.TODO_001);
  if (todo.userId !== userId) throw makeAppError(ERROR.AUTH_004);
  return todoRepo.toggleComplete(todoId);
}

module.exports = { getAll, getById, create, update, delete: deleteTodo, toggleComplete };
