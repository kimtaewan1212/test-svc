'use strict';

const userRepo = require('../repositories/userRepository');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');
const ERROR = require('../constants/errorCodes');

function makeAppError(errorDef) {
  const err = new Error(errorDef.message);
  err.code = errorDef.code;
  err.status = errorDef.status;
  return err;
}

async function getMe(userId) {
  const user = await userRepo.findById(userId);
  if (!user) throw makeAppError(ERROR.AUTH_003);
  return user;
}

async function updateMe(userId, data) {
  const update = {};
  if (data.name !== undefined) update.name = data.name;

  if (data.password !== undefined) {
    if (!data.currentPassword) throw makeAppError(ERROR.USER_002);
    const user = await userRepo.findByIdWithPassword(userId);
    const match = await comparePassword(data.currentPassword, user.password);
    if (!match) throw makeAppError(ERROR.USER_002);
    update.password = await hashPassword(data.password);
  }

  return userRepo.update(userId, update);
}

async function deleteMe(userId) {
  await userRepo.deleteById(userId);
}

module.exports = { getMe, updateMe, deleteMe };
