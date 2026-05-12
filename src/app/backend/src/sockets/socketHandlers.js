const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const { query } = require('../database/db');

function setupSocketHandlers(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
    if (!token) return next();
    try {
      socket.user = jwt.verify(token, env.jwtSecret);
    } catch {}
    next();
  });

  io.on('connection', (socket) => {
    if (socket.user?.userId) socket.join(`user_${socket.user.userId}`);

    socket.on('join_conversation', async ({ conversationId }) => {
      if (!conversationId || !socket.user?.userId) return;
      const allowed = await query(
        'select 1 from conversation_participants where conversation_id = $1 and user_id = $2',
        [conversationId, socket.user.userId]
      );
      if (allowed.rowCount) socket.join(`conversation_${conversationId}`);
    });

    socket.on('send_message', async (payload, ack) => {
      try {
        const { conversationId, receiverId, content } = payload;
        if (!socket.user?.userId || !conversationId || !receiverId || !content) return;
        const message = await query(
          `insert into messages (conversation_id, sender_id, receiver_id, content) values ($1,$2,$3,$4) returning *`,
          [conversationId, socket.user.userId, receiverId, content]
        );
        await query(`update conversations set last_message = $1, last_message_at = now() where id = $2`, [content, conversationId]);
        io.to(`conversation_${conversationId}`).emit('message_received', message.rows[0]);
        io.to(`user_${receiverId}`).emit('message_received', message.rows[0]);
        if (ack) ack({ ok: true, message: message.rows[0] });
      } catch (error) {
        if (ack) ack({ ok: false, message: 'Unable to send message' });
      }
    });

    socket.on('typing', ({ conversationId, isTyping }) => {
      if (!conversationId || !socket.user?.userId) return;
      socket.to(`conversation_${conversationId}`).emit('typing', {
        conversationId,
        userId: socket.user.userId,
        isTyping: Boolean(isTyping)
      });
    });
  });
}

module.exports = { setupSocketHandlers };
