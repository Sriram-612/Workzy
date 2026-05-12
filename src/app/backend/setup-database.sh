#!/usr/bin/env bash
set -euo pipefail

export DATABASE_URL="${DATABASE_URL:-postgresql://postgres:sriram123@localhost:5432/workzy}"

npm run db:schema
npm run db:seed

echo "Database is ready."
