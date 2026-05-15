'use strict';

const env = require('./config/env');
const pool = require('./config/db');
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');
const mountRoutes = require('./routes/index');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

mountRoutes(app);
app.use(errorHandler);

async function start() {
  try {
    await pool.query('SELECT 1');
    console.log('[db] DB 연결 성공');
  } catch (err) {
    console.error('[db] DB 연결 실패:', err.message);
    process.exit(1);
  }
  app.listen(env.port, () => {
    console.log(`[server] ${env.port}번 포트 실행 중`);
  });
}

if (require.main === module) {
  start();
}

module.exports = app;
