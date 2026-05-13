const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

async function main() {
  const file = process.argv[2];
  if (!file) throw new Error('Usage: node src/database/runSql.js <sql-file>');
  const sqlPath = path.resolve(process.cwd(), file);
  const sql = fs.readFileSync(sqlPath, 'utf8');
  const statements = splitSqlStatements(sql);
  for (const statement of statements) {
    await pool.query(statement);
  }
  await pool.end();
  console.log(`Applied ${file}`);
}

function splitSqlStatements(sql) {
  const statements = [];
  let current = '';
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let dollarTag = null;

  for (let i = 0; i < sql.length; i += 1) {
    const char = sql[i];
    const next = sql[i + 1];

    if (!inSingleQuote && !inDoubleQuote && !dollarTag && char === '-' && next === '-') {
      while (i < sql.length && sql[i] !== '\n') {
        current += sql[i];
        i += 1;
      }
      if (i < sql.length) current += sql[i];
      continue;
    }

    if (!inSingleQuote && !inDoubleQuote && char === '$') {
      const match = sql.slice(i).match(/^\$[A-Za-z0-9_]*\$/);
      if (match) {
        const tag = match[0];
        current += tag;
        i += tag.length - 1;
        dollarTag = dollarTag === tag ? null : tag;
        continue;
      }
    }

    if (!dollarTag && !inDoubleQuote && char === "'" && next !== "'") {
      inSingleQuote = !inSingleQuote;
    } else if (!dollarTag && !inSingleQuote && char === '"') {
      inDoubleQuote = !inDoubleQuote;
    }

    if (!inSingleQuote && !inDoubleQuote && !dollarTag && char === ';') {
      const statement = current.trim();
      if (statement) statements.push(statement);
      current = '';
      continue;
    }

    current += char;
  }

  const finalStatement = current.trim();
  if (finalStatement) statements.push(finalStatement);
  return statements;
}

main().catch(async (error) => {
  console.error(error.message);
  await pool.end();
  process.exit(1);
});
