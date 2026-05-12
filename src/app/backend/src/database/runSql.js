const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

async function main() {
  const file = process.argv[2];
  if (!file) throw new Error('Usage: node src/database/runSql.js <sql-file>');
  const sqlPath = path.resolve(process.cwd(), file);
  const sql = fs.readFileSync(sqlPath, 'utf8');
  await pool.query(sql);
  await pool.end();
  console.log(`Applied ${file}`);
}

main().catch(async (error) => {
  console.error(error.message);
  await pool.end();
  process.exit(1);
});
