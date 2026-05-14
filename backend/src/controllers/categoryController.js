'use strict';

const categoryService = require('../services/categoryService');

async function getAll(req, res, next) {
  try {
    const categories = await categoryService.getAll(req.userId);
    res.json(categories);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, color } = req.body;
    const category = await categoryService.create(req.userId, name, color);
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { name, color } = req.body;
    const category = await categoryService.update(req.userId, parseInt(id), { name, color });
    res.json(category);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    await categoryService.delete(req.userId, parseInt(id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, create, update, remove };
