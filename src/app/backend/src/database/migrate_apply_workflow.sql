-- Run once on existing DBs: npm run db:migrate (or: node src/database/runSql.js src/database/migrate_apply_workflow.sql)

create table if not exists saved_jobs (
  user_id uuid not null references users(id) on delete cascade,
  job_id uuid not null references jobs(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, job_id)
);

create index if not exists idx_saved_jobs_user on saved_jobs(user_id);

alter table proposals add column if not exists hire_offer_status text;

do $$ begin alter type project_status add value if not exists 'proposal_accepted'; exception when duplicate_object then null; end $$;
do $$ begin alter type project_status add value if not exists 'payment_pending'; exception when duplicate_object then null; end $$;
do $$ begin alter type project_status add value if not exists 'paid_directly'; exception when duplicate_object then null; end $$;
do $$ begin alter type project_status add value if not exists 'active'; exception when duplicate_object then null; end $$;
do $$ begin alter type project_status add value if not exists 'submitted'; exception when duplicate_object then null; end $$;
do $$ begin alter type project_status add value if not exists 'completed'; exception when duplicate_object then null; end $$;
do $$ begin alter type project_status add value if not exists 'cancelled'; exception when duplicate_object then null; end $$;

do $$ begin alter type payment_status add value if not exists 'pending'; exception when duplicate_object then null; end $$;
do $$ begin alter type payment_status add value if not exists 'paid_directly'; exception when duplicate_object then null; end $$;
do $$ begin alter type payment_status add value if not exists 'failed'; exception when duplicate_object then null; end $$;
do $$ begin alter type payment_status add value if not exists 'cancelled'; exception when duplicate_object then null; end $$;

alter table payments add column if not exists client_id uuid references users(id);
alter table payments add column if not exists student_id uuid references users(id);
alter table payments add column if not exists payment_method text not null default 'upi';
alter table payments add column if not exists razorpay_payment_id text unique;
alter table payments add column if not exists razorpay_order_id text unique;
alter table payments add column if not exists payment_status payment_status not null default 'pending';
alter table payments add column if not exists paid_at timestamptz;

do $$
begin
  if exists (select 1 from information_schema.columns where table_name = 'payments' and column_name = 'payer_id') then
    alter table payments alter column payer_id drop not null;
  end if;
  if exists (select 1 from information_schema.columns where table_name = 'payments' and column_name = 'payee_id') then
    alter table payments alter column payee_id drop not null;
  end if;
  if exists (select 1 from information_schema.columns where table_name = 'payments' and column_name = 'platform_fee_bps') then
    alter table payments alter column platform_fee_bps set default 0;
  end if;
  if exists (select 1 from information_schema.columns where table_name = 'payments' and column_name = 'platform_fee_amount') then
    alter table payments alter column platform_fee_amount set default 0;
  end if;
end $$;

update payments
set client_id = coalesce(client_id, payer_id),
    student_id = coalesce(student_id, payee_id),
    payment_status = case
      when payment_status is not null then payment_status
      when status::text in ('RELEASED', 'HELD', 'AUTHORIZED') then 'paid_directly'::payment_status
      when status::text = 'FAILED' then 'failed'::payment_status
      else 'pending'::payment_status
    end
where client_id is null or student_id is null;

create table if not exists payment_logs (
  id uuid primary key default uuid_generate_v4(),
  payment_id uuid references payments(id) on delete set null,
  event_type text not null,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_projects_status on projects(status);
create index if not exists idx_payments_client_id on payments(client_id);
create index if not exists idx_payments_student_id on payments(student_id);
create index if not exists idx_payments_status on payments(payment_status);
create index if not exists idx_payment_logs_payment_id on payment_logs(payment_id);
create unique index if not exists idx_payments_one_open_per_project on payments(project_id) where payment_status in ('pending', 'paid_directly');
