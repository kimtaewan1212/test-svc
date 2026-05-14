'use strict';

const ERROR = require('../constants/errorCodes');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  console.error('[error]', err);

  if (err.code && err.status) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message } });
  }

  res.status(500).json({ error: ERROR.SERVER_001 });
}

module.exports = errorHandler;
