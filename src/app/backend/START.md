# Start Workzy Backend

```bash
cd src/app/backend
cp .env.example .env
npm install
npm run db:schema
npm run db:seed
npm run dev
```

The backend uses PostgreSQL directly with `pg`, not Prisma.
