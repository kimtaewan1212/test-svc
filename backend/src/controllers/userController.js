'use strict';

const userService = require('../services/userService');

async function getMe(req, res, next) {
  try {
    const user = await userService.getMe(req.userId);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function updateMe(req, res, next) {
  try {
    const { name, password, currentPassword } = req.body;
    const user = await userService.updateMe(req.userId, { name, password, currentPassword });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function deleteMe(req, res, next) {
  try {
    await userService.deleteMe(req.userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getMe, updateMe, deleteMe };
