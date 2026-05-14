'use strict';

const userRepo = require('../repositories/userRepository');
const tokenRepo = require('../repositories/refreshTokenRepository');
const categoryRepo = require('../repositories/categoryRepository');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');
const { signAccessToken, signRefreshToken, verifyToken } = require('../utils/jwtUtils');
const ERROR = require('../constants/errorCodes');

const DEFAULT_CATEGORIES = [
  { name: '일반', color: '#6B7280', isDefault: true },
  { name: '업무', color: '#3B82F6', isDefault: true },
  { name: '개인', color: '#10B981', isDefault: true },
];

function makeAppError(errorDef) {
  const err = new Error(errorDef.message);
  err.code = errorDef.code;
  err.status = errorDef.status;
  return err;
}

function refreshExpiresAt() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d;
}

async function register(email, password, name) {
  const existing = await userRepo.findByEmail(email);
  if (existing) throw makeAppError(ERROR.USER_001);

  const hashed = await hashPassword(password);
  const user = await userRepo.create(email, hashed, name);

  await Promise.all(
    DEFAULT_CATEGORIES.map((c) => categoryRepo.create(user.id, c.name, c.color, c.isDefault))
  );

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);
  await tokenRepo.create(user.id, refreshToken, refreshExpiresAt());

  return { user, accessToken, refreshToken };
}

async function login(email, password) {
  const user = await userRepo.findByEmail(email);
  if (!user) throw makeAppError(ERROR.USER_002);

  const match = await comparePassword(password, user.password);
  if (!match) throw makeAppError(ERROR.USER_002);

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);
  await tokenRepo.create(user.id, refreshToken, refreshExpiresAt());

  const { password: _, ...safeUser } = user;
  return { user: safeUser, accessToken, refreshToken };
}

async function refresh(refreshToken) {
  const stored = await tokenRepo.findByToken(refreshToken);
  if (!stored || new Date(stored.expiresAt) < new Date()) {
    throw makeAppError(ERROR.AUTH_005);
  }

  try {
    const payload = verifyToken(refreshToken, true);
    const accessToken = signAccessToken(payload.userId);
    return { accessToken };
  } catch {
    throw makeAppError(ERROR.AUTH_005);
  }
}

async function logout(refreshToken) {
  await tokenRepo.deleteByToken(refreshToken);
}

module.exports = { register, login, refresh, logout };
