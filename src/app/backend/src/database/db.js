const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { env } = require('../config/env');

const isRemoteDb =
  /neon\.tech|supabase\.co|render\.com|railway\.app|aivencloud\.com|amazonaws\.com|sslmode=require/i.test(
    env.databaseUrl || ''
  ) || process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: isRemoteDb ? { rejectUnauthorized: false } : undefined,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error', error.message || error);
});

let schemaChecked = false;
async function ensureSchema() {
  if (schemaChecked) return;
  schemaChecked = true;
  try {
    const res = await pool.query(
      `select 1 from information_schema.tables where table_name = 'users' limit 1`
    );
    if (!res.rowCount) {
      console.log('Workzy: users table not found. Initializing database schema...');
      const schemaPath = path.resolve(__dirname, 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await pool.query(schemaSql);
        console.log('Workzy: database schema initialized successfully.');
      }
    }
  } catch (err) {
    console.error('Workzy: schema auto-check note:', err.message);
  }
}

const query = async (text, params) => {
  if (!schemaChecked) {
    await ensureSchema();
  }
  return pool.query(text, params);
};

async function withTransaction(callback) {
  if (!schemaChecked) {
    await ensureSchema();
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { pool, query, withTransaction, ensureSchema };
