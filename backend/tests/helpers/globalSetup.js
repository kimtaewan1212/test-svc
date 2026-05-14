require('dotenv').config({ path: '.env.test' });
const { Pool } = require('pg');

module.exports = async function globalSetup() {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    console.log(`[globalSetup] Test DB connected: ${process.env.DB_NAME}`);
  } finally {
    client.release();
    await pool.end();
  }
};
