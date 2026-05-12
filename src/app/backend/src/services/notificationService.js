const { query } = require('../database/db');

async function createNotification(client, { userId, title, message, type, data = {} }) {
  const runner = client || { query };
  const result = await runner.query(
    `insert into notifications (user_id, title, message, type, data) values ($1,$2,$3,$4,$5) returning *`,
    [userId, title, message, type, data]
  );
  return result.rows[0];
}

module.exports = { createNotification };
