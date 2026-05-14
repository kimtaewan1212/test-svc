'use strict';

const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');
const env = require('../config/env');

function signAccessToken(userId) {
  return jwt.sign({ userId }, env.jwt.secret, { expiresIn: env.jwt.accessExpiresIn });
}

function signRefreshToken(userId) {
  return jwt.sign({ userId, jti: randomUUID() }, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpiresIn });
}

function verifyToken(token, isRefresh = false) {
  const secret = isRefresh ? env.jwt.refreshSecret : env.jwt.secret;
  return jwt.verify(token, secret);
}

module.exports = { signAccessToken, signRefreshToken, verifyToken };
