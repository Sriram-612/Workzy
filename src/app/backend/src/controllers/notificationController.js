const { query } = require('../database/db');
const { createError } = require('../utils/errors');

async function list(req, res) {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);
  const isRead = req.query.isRead;
  const result = await query(
    `select * from notifications where user_id = $1 and ($2::boolean is null or is_read = $2)
     order by created_at desc limit $3 offset $4`,
    [req.user.id, isRead === undefined ? null : isRead === 'true', limit, (page - 1) * limit]
  );
  res.json({ notifications: result.rows, pagination: { page, limit } });
}

async function unreadCount(req, res) {
  const result = await query(`select count(*)::int count from notifications where user_id = $1 and is_read = false`, [req.user.id]);
  res.json({ unreadCount: result.rows[0].count });
}

async function markRead(req, res) {
  const result = await query(`update notifications set is_read = true where id = $1 and user_id = $2 returning *`, [req.params.id, req.user.id]);
  if (!result.rowCount) throw createError('Notification not found', 404);
  res.json({ notification: result.rows[0] });
}

async function markAllRead(req, res) {
  await query(`update notifications set is_read = true where user_id = $1`, [req.user.id]);
  res.json({ message: 'All notifications marked as read' });
}

async function remove(req, res) {
  await query(`delete from notifications where id = $1 and user_id = $2`, [req.params.id, req.user.id]);
  res.json({ message: 'Notification deleted' });
}

module.exports = { list, unreadCount, markRead, markAllRead, remove };
