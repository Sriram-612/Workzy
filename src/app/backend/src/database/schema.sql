create extension if not exists "uuid-ossp";

do $$
declare
  legacy_suffix text := to_char(now(), 'YYYYMMDDHH24MISS');
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'users' and column_name = 'id' and udt_name <> 'uuid'
  ) then
    if to_regclass('public.notifications') is not null then execute format('alter table notifications rename to legacy_notifications_%s', legacy_suffix); end if;
    if to_regclass('public.payments') is not null then execute format('alter table payments rename to legacy_payments_%s', legacy_suffix); end if;
    if to_regclass('public.reviews') is not null then execute format('alter table reviews rename to legacy_reviews_%s', legacy_suffix); end if;
    if to_regclass('public.messages') is not null then execute format('alter table messages rename to legacy_messages_%s', legacy_suffix); end if;
    if to_regclass('public.conversation_participants') is not null then execute format('alter table conversation_participants rename to legacy_conversation_participants_%s', legacy_suffix); end if;
    if to_regclass('public.conversations') is not null then execute format('alter table conversations rename to legacy_conversations_%s', legacy_suffix); end if;
    if to_regclass('public.projects') is not null then execute format('alter table projects rename to legacy_projects_%s', legacy_suffix); end if;
    if to_regclass('public.proposals') is not null then execute format('alter table proposals rename to legacy_proposals_%s', legacy_suffix); end if;
    if to_regclass('public.jobs') is not null then execute format('alter table jobs rename to legacy_jobs_%s', legacy_suffix); end if;
    execute format('alter table users rename to legacy_users_%s', legacy_suffix);
  end if;
end $$;

do $$ begin
  create type user_role as enum ('FREELANCER', 'CLIENT', 'ADMIN');
exception when duplicate_object then null; end $$;
do $$ begin
  create type job_status as enum ('DRAFT', 'ACTIVE', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
exception when duplicate_object then null; end $$;
do $$ begin
  create type budget_type as enum ('FIXED', 'HOURLY');
exception when duplicate_object then null; end $$;
do $$ begin
  create type experience_level as enum ('ENTRY', 'INTERMEDIATE', 'EXPERT');
exception when duplicate_object then null; end $$;
do $$ begin
  create type proposal_status as enum ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');
exception when duplicate_object then null; end $$;
do $$ begin
  create type project_status as enum ('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED');
exception when duplicate_object then null; end $$;
do $$ begin
  create type message_status as enum ('SENT', 'DELIVERED', 'READ');
exception when duplicate_object then null; end $$;
do $$ begin
  create type payment_status as enum ('CREATED', 'AUTHORIZED', 'HELD', 'RELEASED', 'REFUNDED', 'FAILED');
exception when duplicate_object then null; end $$;

create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  role user_role not null,
  is_profile_complete boolean not null default false,
  college_name text,
  department text,
  bio text,
  skills text[] not null default '{}',
  portfolio_links text[] not null default '{}',
  avatar text,
  hourly_rate numeric(10,2),
  company_name text,
  company_description text,
  company_logo text,
  website text,
  response_rate numeric(5,2) not null default 0,
  completion_rate numeric(5,2) not null default 0,
  total_projects integer not null default 0,
  rating numeric(3,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists jobs (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references users(id) on delete cascade,
  title text not null,
  description text not null,
  requirements text,
  skills text[] not null default '{}',
  category text not null check (category in ('Development', 'Design', 'Video Editing', 'AI & Content')),
  budget_type budget_type not null,
  fixed_budget numeric(12,2),
  hourly_rate numeric(10,2),
  duration text,
  experience_level experience_level not null default 'ENTRY',
  status job_status not null default 'ACTIVE',
  is_urgent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((budget_type = 'FIXED' and fixed_budget is not null) or (budget_type = 'HOURLY' and hourly_rate is not null))
);

create table if not exists proposals (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid not null references jobs(id) on delete cascade,
  freelancer_id uuid not null references users(id) on delete cascade,
  cover_letter text not null,
  proposed_budget numeric(12,2) not null,
  timeline text not null,
  status proposal_status not null default 'PENDING',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(job_id, freelancer_id)
);

create table if not exists projects (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid not null references jobs(id),
  proposal_id uuid not null unique references proposals(id),
  client_id uuid not null references users(id),
  freelancer_id uuid not null references users(id),
  title text not null,
  description text,
  budget numeric(12,2) not null,
  timeline text,
  status project_status not null default 'PENDING',
  milestones jsonb not null default '[]',
  delivery_url text,
  delivery_notes text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists conversations (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete set null,
  last_message text,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists conversation_participants (
  conversation_id uuid not null references conversations(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create table if not exists messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references users(id) on delete cascade,
  receiver_id uuid not null references users(id) on delete cascade,
  content text not null default '',
  attachments text[] not null default '{}',
  status message_status not null default 'SENT',
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create table if not exists reviews (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  reviewer_id uuid not null references users(id) on delete cascade,
  reviewee_id uuid not null references users(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  unique(project_id, reviewer_id, reviewee_id)
);

create table if not exists payments (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  payer_id uuid not null references users(id),
  payee_id uuid not null references users(id),
  stripe_payment_intent_id text unique,
  amount numeric(12,2) not null,
  currency text not null default 'usd',
  platform_fee_bps integer not null default 0,
  platform_fee_amount numeric(12,2) not null default 0,
  status payment_status not null default 'CREATED',
  release_requested_at timestamptz,
  released_at timestamptz,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null,
  data jsonb not null default '{}',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists users_set_updated_at on users;
create trigger users_set_updated_at before update on users for each row execute function set_updated_at();
drop trigger if exists jobs_set_updated_at on jobs;
create trigger jobs_set_updated_at before update on jobs for each row execute function set_updated_at();
drop trigger if exists proposals_set_updated_at on proposals;
create trigger proposals_set_updated_at before update on proposals for each row execute function set_updated_at();
drop trigger if exists projects_set_updated_at on projects;
create trigger projects_set_updated_at before update on projects for each row execute function set_updated_at();
drop trigger if exists conversations_set_updated_at on conversations;
create trigger conversations_set_updated_at before update on conversations for each row execute function set_updated_at();
drop trigger if exists payments_set_updated_at on payments;
create trigger payments_set_updated_at before update on payments for each row execute function set_updated_at();

create index if not exists idx_users_role on users(role);
create index if not exists idx_users_skills on users using gin(skills);
create index if not exists idx_jobs_client_id on jobs(client_id);
create index if not exists idx_jobs_status_created on jobs(status, created_at desc);
create index if not exists idx_jobs_category on jobs(category);
create index if not exists idx_jobs_skills on jobs using gin(skills);
create index if not exists idx_proposals_job_id on proposals(job_id);
create index if not exists idx_proposals_freelancer_id on proposals(freelancer_id);
create index if not exists idx_projects_client_id on projects(client_id);
create index if not exists idx_projects_freelancer_id on projects(freelancer_id);
create index if not exists idx_messages_conversation_id_created on messages(conversation_id, created_at desc);
create index if not exists idx_messages_receiver_status on messages(receiver_id, status);
create index if not exists idx_notifications_user_read_created on notifications(user_id, is_read, created_at desc);
create index if not exists idx_payments_project_id on payments(project_id);
