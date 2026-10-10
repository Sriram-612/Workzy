const dotenv = require('dotenv');

dotenv.config();
dotenv.config({ path: '.env.local', override: false });
dotenv.config({ path: 'src/app/backend/.env', override: false });

const nodeEnv = process.env.NODE_ENV || 'development';
const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  (nodeEnv === 'production' ? '' : 'postgresql://postgres:sriram123@localhost:5432/workzy');

const env = {
  nodeEnv,
  port: Number(process.env.PORT || 3001),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  databaseUrl,
  jwtSecret: process.env.JWT_SECRET || 'dev-only-change-this-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  platformFeeBps: Number(process.env.PLATFORM_FEE_BPS || 0)
};

module.exports = { env };
