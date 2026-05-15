'use strict';

const { Pool } = require('pg');
const env = require('./env');

const isLocal = env.db.host === 'localhost' || env.db.host === '127.0.0.1';

const pool = new Pool({
  host: env.db.host,
  port: env.db.port,
  database: env.db.name,
  user: env.db.user,
  password: env.db.password,
  ...(isLocal ? {} : { ssl: { rejectUnauthorized: false } }),
});

pool.on('error', (err) => {
  console.error('[db] 연결 풀 오류:', err.message);
});

module.exports = pool;
