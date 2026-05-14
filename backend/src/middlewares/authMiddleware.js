'use strict';

const { verifyToken } = require('../utils/jwtUtils');
const ERROR = require('../constants/errorCodes');

function authMiddleware(req, res, next) {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: ERROR.AUTH_001 });
  }

  const token = header.slice(7);
  try {
    const payload = verifyToken(token);
    req.userId = payload.userId;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: ERROR.AUTH_002 });
    }
    return res.status(401).json({ error: ERROR.AUTH_003 });
  }
}

module.exports = authMiddleware;
