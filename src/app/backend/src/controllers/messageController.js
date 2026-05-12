const { query, withTransaction } = require('../database/db');
const { createError } = require('../utils/errors');

function normalizeName(s) {
  return String(s || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

async function getOrCreateConversation(userA, userB) {
  const existing = await query(
    `select cp1.conversation_id id from conversation_participants cp1
     join conversation_participants cp2 on cp2.conversation_id = cp1.conversation_id
     where cp1.user_id = $1 and cp2.user_id = $2 limit 1`,
    [userA, userB]
  );
  if (existing.rowCount) return existing.rows[0].id;
  return withTransaction(async (tx) => {
    const convo = await tx.query('insert into conversations default values returning id');
    await tx.query('insert into conversation_participants (conversation_id, user_id) values ($1,$2),($1,$3)', [convo.rows[0].id, userA, userB]);
    return convo.rows[0].id;
  });
}

async function sendMessage(req, res) {
  let receiverId = req.body.receiverId;

  if (req.body.receiverEmail) {
    const email = String(req.body.receiverEmail).trim();
    const found = await query(
      `select id, name, email from users where lower(email) = lower($1)`,
      [email]
    );
    if (!found.rowCount) throw createError('No account exists with this email address', 404);
    const recipient = found.rows[0];
    if (recipient.id === req.user.id) throw createError('Cannot send message to yourself', 400);
    const given = normalizeName(req.body.recipientName);
    const registered = normalizeName(recipient.name);
    if (!given || given !== registered) {
      throw createError(
        'Recipient name does not match this email account. Use the full name on their Workzy profile.',
        400
      );
    }
    receiverId = recipient.id;
  }

  if (!receiverId) throw createError('Receiver is required', 400);
  if (req.user.id === receiverId) throw createError('Cannot send message to yourself', 400);

  const receiver = await query('select id from users where id = $1', [receiverId]);
  if (!receiver.rowCount) throw createError('Receiver not found', 404);
  const conversationId = await getOrCreateConversation(req.user.id, receiverId);
  const result = await query(
    `insert into messages (conversation_id, sender_id, receiver_id, content) values ($1,$2,$3,$4) returning *`,
    [conversationId, req.user.id, receiverId, req.body.content]
  );
  await query(`update conversations set last_message = $1, last_message_at = now() where id = $2`, [req.body.content, conversationId]);
  req.app.get('io')?.to(`user_${receiverId}`).emit('message_received', result.rows[0]);
  res.status(201).json({ message: 'Message sent successfully', data: result.rows[0] });
}

async function conversations(req, res) {
  const result = await query(
    `select c.*, json_agg(json_build_object('id', u.id, 'name', u.name, 'avatar', u.avatar, 'role', u.role, 'email', u.email)) filter (where u.id <> $1) as participants,
      count(m.id) filter (where m.receiver_id = $1 and m.status <> 'READ')::int as unread_count
     from conversations c
     join conversation_participants mine on mine.conversation_id = c.id and mine.user_id = $1
     join conversation_participants cp on cp.conversation_id = c.id
     join users u on u.id = cp.user_id
     left join messages m on m.conversation_id = c.id
     group by c.id order by c.last_message_at desc nulls last`,
    [req.user.id]
  );
  res.json({ conversations: result.rows });
}

async function conversationMessages(req, res) {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 50);
  const access = await query('select 1 from conversation_participants where conversation_id = $1 and user_id = $2', [req.params.conversationId, req.user.id]);
  if (!access.rowCount) throw createError('Conversation not found', 404);
  const result = await query(
    `select m.*, u.name sender_name, u.avatar sender_avatar from messages m join users u on u.id = m.sender_id
     where m.conversation_id = $1 order by m.created_at desc limit $2 offset $3`,
    [req.params.conversationId, limit, (page - 1) * limit]
  );
  await query(`update messages set status = 'READ', read_at = now() where conversation_id = $1 and receiver_id = $2 and status <> 'READ'`, [req.params.conversationId, req.user.id]);
  res.json({ messages: result.rows.reverse(), pagination: { page, limit } });
}

async function unreadCount(req, res) {
  const result = await query(`select count(*)::int count from messages where receiver_id = $1 and status <> 'READ'`, [req.user.id]);
  res.json({ unreadCount: result.rows[0].count });
}

module.exports = { sendMessage, conversations, conversationMessages, unreadCount };
