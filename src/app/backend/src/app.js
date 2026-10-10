const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { env } = require('./config/env');
const { pool } = require('./database/db');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());

const corsOrigin = (origin, callback) => {
  if (!origin) return callback(null, true);
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) {
    return callback(null, true);
  }
  if (origin.endsWith('.vercel.app') || origin === env.frontendUrl) {
    return callback(null, true);
  }
  return callback(null, true);
};

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

const healthHandler = async (req, res) => {
  try {
    await pool.query('select 1');
    res.json({
      status: 'OK',
      message: 'Workzy API Server is running',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      message: 'Workzy API is running, but the database is not connected',
      database: 'disconnected',
      error: env.nodeEnv === 'production' ? 'Database connection failed' : error.message,
      timestamp: new Date().toISOString()
    });
  }
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/proposals', require('./routes/proposals'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/notifications', require('./routes/notifications'));

app.use((req, res) => res.status(404).json({ message: 'Route not found', path: req.originalUrl }));
app.use(errorHandler);

module.exports = { app };
