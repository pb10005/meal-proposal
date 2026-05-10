-- preferences
create table preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  likes jsonb not null default '[]'::jsonb,
  dislikes jsonb not null default '[]'::jsonb,
  allergies jsonb not null default '[]'::jsonb,
  dietary_restrictions jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);
alter table preferences enable row level security;
create policy "Users can manage own preferences" on preferences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- meals_log
create table meals_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null,
  form text not null,
  eaten_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table meals_log enable row level security;
create policy "Users can manage own meals" on meals_log
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index meals_log_user_eaten_at on meals_log(user_id, eaten_at desc);

-- suggestions_log
create table suggestions_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  input jsonb not null,
  normalized_input jsonb,
  excluded_rules jsonb not null default '[]'::jsonb,
  candidates jsonb not null,
  accepted_candidate_id text,
  latency_ms integer,
  created_at timestamptz not null default now()
);
alter table suggestions_log enable row level security;
create policy "Users can read own suggestions" on suggestions_log
  for select using (auth.uid() = user_id);
create policy "Anyone can insert suggestions" on suggestions_log
  for insert with check (true);
create policy "Users can update own suggestions" on suggestions_log
  for update using (auth.uid() = user_id);

-- events_log
create table events_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  event_name text not null,
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table events_log enable row level security;
create policy "Anyone can insert events" on events_log
  for insert with check (true);
create policy "Users can read own events" on events_log
  for select using (auth.uid() = user_id);

-- Analytics views
create or replace view suggestion_stats as
select
  count(*) as total_suggestions,
  count(accepted_candidate_id) as total_accepted,
  round(count(accepted_candidate_id)::numeric / nullif(count(*), 0) * 100, 1) as acceptance_rate_pct
from suggestions_log;

create or replace view reroll_stats as
select
  count(*) as total_rerolls
from events_log
where event_name = 'reroll_clicked';
