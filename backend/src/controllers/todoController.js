'use strict';

const todoService = require('../services/todoService');

async function getAll(req, res, next) {
  try {
    const { category_id, status, period, sort, order, page, limit } = req.query;
    const filters = { categoryId: category_id ? parseInt(category_id) : undefined, status, period, sort, order };
    const pagination = { page, limit };
    const result = await todoService.getAll(req.userId, filters, pagination);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const todo = await todoService.getById(req.userId, parseInt(req.params.id));
    res.json(todo);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { title, description, categoryId, dueDate } = req.body;
    const todo = await todoService.create(req.userId, { title, description, categoryId, dueDate });
    res.status(201).json(todo);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { title, description, categoryId, dueDate, isCompleted } = req.body;
    const todo = await todoService.update(req.userId, parseInt(req.params.id), { title, description, categoryId, dueDate, isCompleted });
    res.json(todo);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await todoService.delete(req.userId, parseInt(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function toggleDone(req, res, next) {
  try {
    const todo = await todoService.toggleComplete(req.userId, parseInt(req.params.id));
    res.json(todo);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, remove, toggleDone };
