# Workzy Direct Payments MVP

Workzy uses a simple direct-payment workflow for the India MVP:

1. Client posts a job.
2. Student submits a proposal.
3. Client accepts the proposal or student accepts a hire offer.
4. Project status becomes `payment_pending`.
5. Student shares payment details in chat.
6. Client opens Payments and clicks Pay Freelancer.
7. Razorpay Checkout opens with UPI enabled.
8. Backend verifies the Razorpay signature.
9. Payment status becomes `paid_directly`.
10. Project status becomes `active`.
11. Student submits work.
12. Client marks the project `completed`.
13. Both users can leave reviews.

There is no escrow, wallet, payout engine, split payment, settlement logic, or platform commission in this MVP.

## Environment

Set these on the backend:

```bash
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
RAZORPAY_WEBHOOK_SECRET=xxx
PLATFORM_FEE_BPS=0
```

Secrets are used only on the backend. The frontend receives only the Razorpay key id and order metadata required by Checkout.

## Database

Fresh setup:

```bash
npm run db:schema
```

Existing setup:

```bash
npm run db:migrate
```

Payment tables:

- `payments`: project, client, student, amount, method, Razorpay ids, status, paid time, metadata.
- `payment_logs`: audit log for order creation, checkout verification, webhook events, and manual failure/cancel updates.

Payment statuses:

- `pending`
- `paid_directly`
- `failed`
- `cancelled`

Project statuses used by the payment workflow:

- `payment_pending`
- `active`
- `submitted`
- `completed`
- `cancelled`

## APIs

- `POST /api/payments/create-payment`
- `POST /api/payments/verify`
- `GET /api/payments/project/:projectId`
- `GET /api/payments/user/:userId`
- `PATCH /api/payments/status`
- `POST /api/payments/webhook`

Only Razorpay signature verification or a verified webhook can mark a payment as `paid_directly`.

## Razorpay Webhook

Configure Razorpay to send webhooks to:

```text
https://your-api-domain.com/api/payments/webhook
```

Enable these events:

- `payment.captured`
- `payment.failed`
- `order.paid`

The webhook body is verified using `RAZORPAY_WEBHOOK_SECRET`.

## Frontend

The frontend Payments screen is available at:

```text
/payments
```

The old `/escrow` route redirects to `/payments` for compatibility.
