const { createServer } = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');
const { app } = require('./app');
const { env } = require('./config/env');
const { pool } = require('./database/db');
const { setupSocketHandlers } = require('./sockets/socketHandlers');

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const server = createServer(app);
const socketCorsOrigin =
  env.nodeEnv === 'development'
    ? (origin, callback) => {
        if (!origin || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) {
          callback(null, true);
        } else if (origin === env.frontendUrl) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      }
    : env.frontendUrl;

const io = new Server(server, {
  cors: { origin: socketCorsOrigin, methods: ['GET', 'POST'], credentials: true }
});

app.set('io', io);
setupSocketHandlers(io);

server.listen(env.port, async () => {
  await pool.query('select 1');
  console.log(`Workzy API Server running on http://localhost:${env.port}`);
  console.log(`Health check: http://localhost:${env.port}/health`);
});
