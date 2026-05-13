-- Run once on existing DBs: npm run db:migrate (or: node src/database/runSql.js src/database/migrate_apply_workflow.sql)

create table if not exists saved_jobs (
  user_id uuid not null references users(id) on delete cascade,
  job_id uuid not null references jobs(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, job_id)
);

create index if not exists idx_saved_jobs_user on saved_jobs(user_id);

alter table proposals add column if not exists hire_offer_status text;
