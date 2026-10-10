const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { env } = require('./config/env');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());

const corsOrigin =
  env.nodeEnv === 'development'
    ? (origin, callback) => {
        if (!origin) return callback(null, true);
        if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) {
          return callback(null, true);
        }
        if (origin === env.frontendUrl) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
      }
    : env.frontendUrl;

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Workzy API Server is running', timestamp: new Date().toISOString() });
});

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
