const crypto = require('crypto');
const { query, withTransaction } = require('../database/db');
const { razorpay } = require('../config/razorpay');
const { env } = require('../config/env');
const { createError } = require('../utils/errors');

const DIRECT_PAYMENT_STATUSES = new Set(['pending', 'paid_directly', 'failed', 'cancelled']);

function toPaise(amount) {
  return Math.round(Number(amount) * 100);
}

function normalizePayment(row) {
  if (!row) return row;
  return {
    id: row.id,
    projectId: row.project_id,
    clientId: row.client_id,
    studentId: row.student_id,
    amount: Number(row.amount),
    currency: row.currency,
    paymentMethod: row.payment_method,
    razorpayPaymentId: row.razorpay_payment_id,
    razorpayOrderId: row.razorpay_order_id,
    paymentStatus: row.payment_status,
    paidAt: row.paid_at,
    metadata: row.metadata || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function assertRazorpayConfigured() {
  if (!razorpay || !env.razorpayKeyId || !env.razorpayKeySecret) {
    throw createError('Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.', 503);
  }
}

function verifyCheckoutSignature(orderId, paymentId, signature) {
  const generated = crypto
    .createHmac('sha256', env.razorpayKeySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  if (generated.length !== String(signature).length) return false;
  return crypto.timingSafeEqual(Buffer.from(generated), Buffer.from(signature));
}

async function createPayment(req, res) {
  assertRazorpayConfigured();

  const projectResult = await query(
    `select pr.*, uc.name client_name, uc.email client_email, uf.name student_name, uf.email student_email
     from projects pr
     join users uc on uc.id = pr.client_id
     join users uf on uf.id = pr.freelancer_id
     where pr.id = $1 and pr.client_id = $2`,
    [req.body.projectId, req.user.id]
  );
  const project = projectResult.rows[0];
  if (!project) throw createError('Project not found', 404);
  if (['completed', 'cancelled', 'COMPLETED', 'CANCELLED'].includes(String(project.status))) {
    throw createError('This project cannot accept payment', 400);
  }

  const existing = await query(
    `select * from payments
     where project_id = $1 and payment_status in ('pending', 'paid_directly')
     order by created_at desc limit 1`,
    [project.id]
  );

  if (existing.rowCount) {
    const payment = normalizePayment(existing.rows[0]);
    if (payment.paymentStatus === 'paid_directly') {
      throw createError('This project has already been paid directly', 409);
    }
    return res.json({
      keyId: env.razorpayKeyId,
      order: {
        id: payment.razorpayOrderId,
        amount: toPaise(payment.amount),
        currency: payment.currency,
      },
      payment,
    });
  }

  const amount = Number(req.body.amount || project.budget);
  if (!Number.isFinite(amount) || amount <= 0) throw createError('Invalid payment amount', 400);

  const currency = String(req.body.currency || 'INR').toUpperCase();
  const receipt = `workzy_${project.id}`.slice(0, 40);
  const order = await razorpay.orders.create({
    amount: toPaise(amount),
    currency,
    receipt,
    notes: {
      project_id: project.id,
      client_id: project.client_id,
      student_id: project.freelancer_id,
      platform_fee_bps: '0',
      payment_model: 'direct_mvp',
    },
  });

  const paymentResult = await withTransaction(async (tx) => {
    const inserted = await tx.query(
      `insert into payments (
         project_id, client_id, student_id, amount, currency, payment_method,
         razorpay_order_id, payment_status, metadata
       )
       values ($1,$2,$3,$4,$5,'upi',$6,'pending',$7)
       returning *`,
      [
        project.id,
        project.client_id,
        project.freelancer_id,
        amount,
        currency,
        order.id,
        {
          studentPaymentNote: req.body.studentPaymentNote || null,
          studentUpiId: req.body.studentUpiId || null,
          platformFeeBps: 0,
          directPayment: true,
        },
      ]
    );

    await tx.query(`update projects set status = 'payment_pending' where id = $1`, [project.id]);
    await tx.query(
      `insert into payment_logs (payment_id, event_type, payload)
       values ($1, 'order_created', $2)`,
      [inserted.rows[0].id, { razorpayOrderId: order.id, amount, currency }]
    );
    return inserted;
  });

  res.status(201).json({
    keyId: env.razorpayKeyId,
    order,
    payment: normalizePayment(paymentResult.rows[0]),
    checkout: {
      name: 'Workzy',
      description: `Direct payment for ${project.title}`,
      prefill: {
        name: project.client_name,
        email: project.client_email,
      },
      config: {
        display: {
          blocks: {
            upi: {
              name: 'Pay using UPI',
              instruments: [{ method: 'upi' }],
            },
          },
          sequence: ['block.upi'],
          preferences: { show_default_blocks: true },
        },
      },
    },
  });
}

async function verify(req, res) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw createError('Missing Razorpay verification fields', 400);
  }

  if (!verifyCheckoutSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
    await query(
      `update payments set payment_status = 'failed', metadata = metadata || $1::jsonb
       where razorpay_order_id = $2 and client_id = $3`,
      [JSON.stringify({ signatureFailureAt: new Date().toISOString() }), razorpay_order_id, req.user.id]
    );
    throw createError('Invalid Razorpay signature', 400);
  }

  const result = await withTransaction(async (tx) => {
    const paymentResult = await tx.query(
      `update payments
       set payment_status = 'paid_directly',
           razorpay_payment_id = $1,
           payment_method = coalesce($2, payment_method),
           paid_at = coalesce(paid_at, now())
       where razorpay_order_id = $3
         and client_id = $4
         and ($5::uuid is null or id = $5)
         and payment_status in ('pending', 'paid_directly')
       returning *`,
      [
        razorpay_payment_id,
        req.body.paymentMethod || 'upi',
        razorpay_order_id,
        req.user.id,
        paymentId || null,
      ]
    );
    if (!paymentResult.rowCount) throw createError('Payment not found or already closed', 404);

    const payment = paymentResult.rows[0];
    await tx.query(`update projects set status = 'active' where id = $1`, [payment.project_id]);
    await tx.query(
      `insert into payment_logs (payment_id, event_type, payload)
       values ($1, 'checkout_verified', $2)`,
      [payment.id, { razorpay_order_id, razorpay_payment_id }]
    );
    return paymentResult;
  });

  res.json({ message: 'Payment verified successfully', payment: normalizePayment(result.rows[0]) });
}

async function getProjectPayment(req, res) {
  const result = await query(
    `select p.* from payments p
     join projects pr on pr.id = p.project_id
     where p.project_id = $1 and (pr.client_id = $2 or pr.freelancer_id = $2)
     order by p.created_at desc`,
    [req.params.projectId, req.user.id]
  );
  res.json({ payments: result.rows.map(normalizePayment) });
}

async function getUserPayments(req, res) {
  if (String(req.params.userId) !== String(req.user.id)) throw createError('Unauthorized', 403);
  const result = await query(
    `select * from payments where client_id = $1 or student_id = $1 order by created_at desc`,
    [req.user.id]
  );
  res.json({ payments: result.rows.map(normalizePayment) });
}

async function updateStatus(req, res) {
  const status = String(req.body.paymentStatus || req.body.status || '').toLowerCase();
  if (!DIRECT_PAYMENT_STATUSES.has(status)) throw createError('Invalid payment status', 400);
  if (status === 'paid_directly') {
    throw createError('Use Razorpay verification or webhooks to mark a payment as paid', 400);
  }

  const result = await withTransaction(async (tx) => {
    const paymentResult = await tx.query(
      `update payments p
       set payment_status = $1,
           metadata = metadata || $2::jsonb
       from projects pr
       where p.project_id = pr.id
         and p.id = $3
         and (pr.client_id = $4 or pr.freelancer_id = $4)
       returning p.*`,
      [status, JSON.stringify({ manualStatusUpdateAt: new Date().toISOString() }), req.body.paymentId, req.user.id]
    );
    if (!paymentResult.rowCount) throw createError('Payment not found', 404);
    await tx.query(
      `insert into payment_logs (payment_id, event_type, payload)
       values ($1, 'status_updated', $2)`,
      [paymentResult.rows[0].id, { status, actorId: req.user.id }]
    );
    return paymentResult;
  });
  res.json({ payment: normalizePayment(result.rows[0]) });
}

async function history(req, res) {
  const result = await query(
    `select * from payments where client_id = $1 or student_id = $1 order by created_at desc`,
    [req.user.id]
  );
  res.json({ payments: result.rows.map(normalizePayment) });
}

async function stats(req, res) {
  const result = await query(
    `select
       coalesce(sum(amount) filter (where student_id = $1 and payment_status = 'paid_directly'), 0)::numeric as earned,
       coalesce(sum(amount) filter (where client_id = $1 and payment_status = 'paid_directly'), 0)::numeric as spent
     from payments`,
    [req.user.id]
  );
  res.json({ stats: { earned: Number(result.rows[0].earned), spent: Number(result.rows[0].spent), platformFeeBps: 0 } });
}

async function webhook(req, res) {
  const signature = req.headers['x-razorpay-signature'];
  if (!env.razorpayWebhookSecret || !signature) throw createError('Webhook verification unavailable', 400);

  const rawBody = req.body;
  const expected = crypto.createHmac('sha256', env.razorpayWebhookSecret).update(rawBody).digest('hex');
  if (expected.length !== String(signature).length) {
    throw createError('Invalid webhook signature', 400);
  }
  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
    throw createError('Invalid webhook signature', 400);
  }

  const event = JSON.parse(rawBody.toString('utf8'));
  const paymentEntity = event?.payload?.payment?.entity;
  const orderId = paymentEntity?.order_id;
  if (!orderId) return res.json({ received: true });

  const status =
    event.event === 'payment.captured' || event.event === 'order.paid'
      ? 'paid_directly'
      : event.event === 'payment.failed'
        ? 'failed'
        : null;

  if (status) {
    await withTransaction(async (tx) => {
      const updated = await tx.query(
        `update payments
         set payment_status = $1,
             razorpay_payment_id = coalesce(razorpay_payment_id, $2),
             payment_method = coalesce($3, payment_method),
             paid_at = case when $1 = 'paid_directly' then coalesce(paid_at, now()) else paid_at end,
             metadata = metadata || $4::jsonb
         where razorpay_order_id = $5
         returning *`,
        [
          status,
          paymentEntity.id || null,
          paymentEntity.method || null,
          JSON.stringify({ lastWebhookEvent: event.event, webhookAt: new Date().toISOString() }),
          orderId,
        ]
      );
      if (updated.rowCount && status === 'paid_directly') {
        await tx.query(`update projects set status = 'active' where id = $1`, [updated.rows[0].project_id]);
      }
      if (updated.rowCount) {
        await tx.query(
          `insert into payment_logs (payment_id, event_type, payload)
           values ($1, $2, $3)`,
          [updated.rows[0].id, event.event, event]
        );
      }
    });
  }

  res.json({ received: true });
}

module.exports = {
  createPayment,
  verify,
  getProjectPayment,
  getUserPayments,
  updateStatus,
  webhook,
  history,
  stats,
};
