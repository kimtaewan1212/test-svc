require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const DB_NAME = process.env.DB_NAME || 'todolistapp_dev';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function migrate() {
  const migrationsDir = path.join(__dirname, '..', 'migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

  const client = await pool.connect();
  try {
    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      console.log(`Running: ${file}`);
      await client.query(sql);
      console.log(`  Done: ${file}`);
    }
    console.log(`\nMigration complete on [${DB_NAME}]`);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(err => { console.error('Migration failed:', err.message); process.exit(1); });
