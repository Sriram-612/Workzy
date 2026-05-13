# Workzy Backend

Production-oriented MVP backend for the existing Workzy frontend.

## Structure

```text
src/
  app.js                 Express app, security middleware, API mounts
  server.js              HTTP + Socket.io boot
  config/                Environment and Stripe clients
  controllers/           Request/response orchestration
  database/              PostgreSQL pool, schema, seeds
  middleware/            Auth, role checks, validation, uploads, errors
  queries/               Reusable SQL query modules
  routes/                API route definitions
  services/              Business workflows and transactions
  sockets/               Realtime chat events
  utils/                 Shared helpers
  validators/            Zod request schemas
```

## Setup

1. Create the database:

```bash
createdb workzy
```

2. Configure environment:

```bash
cp .env.example .env
```

3. Apply schema and seed data:

```bash
npm run db:schema
npm run db:seed
```

4. Start the API:

```bash
npm install
npm run dev
```

The API runs at `http://localhost:3001`, and the frontend expects `VITE_API_URL=http://localhost:3001/api`.

## API Map

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `PUT /api/users/profile`
- `GET /api/users/:id`
- `GET /api/users/search/freelancers`
- `POST /api/jobs`
- `GET /api/jobs`
- `GET /api/jobs/:id`
- `PUT /api/jobs/:id`
- `DELETE /api/jobs/:id`
- `POST /api/proposals`
- `GET /api/proposals/job/:jobId`
- `PATCH /api/proposals/:id/status`
- `POST /api/proposals/:id/accept`
- `POST /api/proposals/:id/reject`
- `GET /api/projects/user`
- `PATCH /api/projects/:id/status`
- `POST /api/projects/:id/delivery`
- `POST /api/messages`
- `GET /api/messages/conversations`
- `GET /api/messages/conversations/:conversationId`
- `POST /api/payments/create-payment`
- `POST /api/payments/verify`
- `GET /api/payments/project/:projectId`
- `GET /api/payments/user/:userId`
- `PATCH /api/payments/status`
- `POST /api/payments/webhook`
- `POST /api/reviews`
- `GET /api/notifications`

## Realtime Events

- `join_conversation`
- `send_message`
- `typing`
- `message_received`

## MVP Notes

- PostgreSQL is used directly through `pg`; there is no Prisma ORM.
- Platform fee is configured with `PLATFORM_FEE_BPS` and defaults to `0`.
- College verification is intentionally not mandatory. Profile fields are present so verification can be added later without breaking users.
