const { query } = require('../database/db');
const { stripe } = require('../config/stripe');
const { env } = require('../config/env');
const { createError } = require('../utils/errors');

async function createPaymentIntent(req, res) {
  const project = await query('select * from projects where id = $1 and client_id = $2', [req.body.projectId, req.user.id]);
  if (!project.rowCount) throw createError('Project not found', 404);
  const fee = Math.round(Number(req.body.amount) * env.platformFeeBps) / 10000;
  let intent = { id: `manual_${Date.now()}`, client_secret: null };
  if (stripe) {
    intent = await stripe.paymentIntents.create({
      amount: Math.round(Number(req.body.amount) * 100),
      currency: req.body.currency || 'usd',
      metadata: { projectId: req.body.projectId, platform: 'workzy' }
    });
  }
  const payment = await query(
    `insert into payments (project_id, payer_id, payee_id, stripe_payment_intent_id, amount, currency, platform_fee_bps, platform_fee_amount, status)
     values ($1,$2,$3,$4,$5,$6,$7,$8,'CREATED') returning *`,
    [req.body.projectId, req.user.id, project.rows[0].freelancer_id, intent.id, req.body.amount, req.body.currency || 'usd', env.platformFeeBps, fee]
  );
  res.status(201).json({ clientSecret: intent.client_secret, payment: payment.rows[0], platformFeeBps: env.platformFeeBps });
}

async function confirmPayment(req, res) {
  const result = await query(
    `update payments set status = 'HELD' where stripe_payment_intent_id = $1 and project_id = $2 and payer_id = $3 returning *`,
    [req.body.paymentIntentId, req.body.projectId, req.user.id]
  );
  if (!result.rowCount) throw createError('Payment not found', 404);
  res.json({ message: 'Payment confirmed and held in escrow', payment: result.rows[0] });
}

async function releaseEscrow(req, res) {
  const result = await query(
    `update payments p set status = 'RELEASED', released_at = now()
     from projects pr where p.project_id = pr.id and p.project_id = $1 and pr.client_id = $2 and p.status = 'HELD'
     returning p.*`,
    [req.params.id || req.body.projectId, req.user.id]
  );
  if (!result.rowCount) throw createError('No held payment found for this project', 404);
  res.json({ message: 'Payment released', payment: result.rows[0] });
}

async function history(req, res) {
  const result = await query(`select * from payments where payer_id = $1 or payee_id = $1 order by created_at desc`, [req.user.id]);
  res.json({ payments: result.rows });
}

async function stats(req, res) {
  const result = await query(
    `select coalesce(sum(amount) filter (where payee_id = $1 and status = 'RELEASED'), 0)::numeric as earned,
      coalesce(sum(amount) filter (where payer_id = $1), 0)::numeric as spent from payments`,
    [req.user.id]
  );
  res.json({ stats: { earned: Number(result.rows[0].earned), spent: Number(result.rows[0].spent), platformFeeBps: env.platformFeeBps } });
}

module.exports = { createPaymentIntent, confirmPayment, releaseEscrow, history, stats };
