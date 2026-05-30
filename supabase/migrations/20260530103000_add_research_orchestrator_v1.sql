create table if not exists research_campaigns (
  id uuid primary key default gen_random_uuid(),
  prompt text not null,
  e4n_interpretation text,
  status text default 'planned',
  target_result_cap int default 100,
  current_wave int default 1,
  segment_count int default 0,
  query_count int default 0,
  result_count int default 0,
  candidate_count int default 0,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists research_segments (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references research_campaigns(id) on delete cascade,
  name text not null,
  persona_type text,
  target_category text,
  role_keywords text[] default '{}'::text[],
  sector_keywords text[] default '{}'::text[],
  location_keywords text[] default '{}'::text[],
  source_keywords text[] default '{}'::text[],
  source_hypotheses text[] default '{}'::text[],
  priority int default 5,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists search_queries (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references research_campaigns(id) on delete cascade,
  segment_id uuid references research_segments(id) on delete cascade,
  engine text not null check (engine in ('google', 'bing')),
  query text not null,
  template_type text not null,
  purpose_label text,
  expected_result_type text,
  extraction_targets jsonb default '[]'::jsonb,
  quality_signals text[] default '{}'::text[],
  low_quality_signals text[] default '{}'::text[],
  assigned_bot text default 'SearchResultCollector',
  wave int default 1,
  status text default 'pending',
  result_count int default 0,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table research_tasks add column if not exists campaign_id uuid references research_campaigns(id) on delete cascade;
alter table research_tasks add column if not exists segment_id uuid references research_segments(id) on delete set null;
alter table research_tasks add column if not exists search_query_id uuid references search_queries(id) on delete set null;
alter table research_tasks add column if not exists engine text;
alter table research_tasks add column if not exists assigned_bot text default 'SearchResultCollector';
alter table research_tasks add column if not exists wave int default 1;
alter table research_tasks add column if not exists retry_count int default 0;
alter table research_tasks add column if not exists max_retries int default 2;
alter table research_tasks add column if not exists worker_id text;
alter table research_tasks add column if not exists claimed_at timestamptz;
alter table research_tasks add column if not exists completed_at timestamptz;
alter table research_tasks add column if not exists blocked_reason text;

create table if not exists source_results (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references research_campaigns(id) on delete cascade,
  segment_id uuid references research_segments(id) on delete set null,
  search_query_id uuid references search_queries(id) on delete set null,
  research_task_id uuid references research_tasks(id) on delete set null,
  engine text,
  result_rank int,
  title text,
  url text not null,
  snippet text,
  raw_html_excerpt text,
  context text,
  result_type text,
  status text default 'new',
  ttl_expires_at timestamptz default now() + interval '30 days',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create unique index if not exists source_results_campaign_url_key on source_results(campaign_id, url);

create table if not exists extracted_entities (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references research_campaigns(id) on delete cascade,
  source_result_id uuid references source_results(id) on delete cascade,
  entity_type text not null,
  name text,
  company text,
  title text,
  sector text,
  location text,
  website_url text,
  profile_url text,
  email text,
  phone text,
  context text,
  importance_reason text,
  e4n_potential text,
  normalized_key text,
  status text default 'raw',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists evidence_items (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references research_campaigns(id) on delete cascade,
  entity_id uuid references extracted_entities(id) on delete cascade,
  person_id uuid references people(id) on delete set null,
  company_id uuid references companies(id) on delete set null,
  source_result_id uuid references source_results(id) on delete set null,
  source_url text,
  claim_type text,
  claim_text text,
  confidence_score int,
  context text,
  created_at timestamptz default now()
);

create table if not exists candidate_profiles (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references research_campaigns(id) on delete cascade,
  person_id uuid references people(id) on delete set null,
  company_id uuid references companies(id) on delete set null,
  normalized_name text,
  normalized_company text,
  title text,
  category text,
  summary text,
  location text,
  sector text,
  evidence_count int default 0,
  status text default 'staging',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists candidate_profiles_campaign_identity_key
  on candidate_profiles(campaign_id, normalized_name, normalized_company);

create table if not exists company_profiles (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references research_campaigns(id) on delete cascade,
  company_id uuid references companies(id) on delete set null,
  normalized_name text,
  website_url text,
  sector text,
  location text,
  commercial_reality_score int,
  summary text,
  evidence_count int default 0,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists profile_scores (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references research_campaigns(id) on delete cascade,
  candidate_profile_id uuid references candidate_profiles(id) on delete cascade,
  person_id uuid references people(id) on delete set null,
  final_score int,
  score_band text,
  category text,
  explanation text,
  score_breakdown jsonb default '{}'::jsonb,
  evidence_count int default 0,
  created_at timestamptz default now()
);

create table if not exists communication_strategies (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references research_campaigns(id) on delete cascade,
  candidate_profile_id uuid references candidate_profiles(id) on delete cascade,
  person_id uuid references people(id) on delete set null,
  first_touch_angle text,
  first_message_draft text,
  follow_up_plan text,
  risk_notes text,
  status text default 'draft',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists research_iterations (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references research_campaigns(id) on delete cascade,
  wave int not null,
  summary text,
  decision text,
  next_query_seeds jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

alter table research_campaigns enable row level security;
alter table research_segments enable row level security;
alter table search_queries enable row level security;
alter table source_results enable row level security;
alter table extracted_entities enable row level security;
alter table evidence_items enable row level security;
alter table candidate_profiles enable row level security;
alter table company_profiles enable row level security;
alter table profile_scores enable row level security;
alter table communication_strategies enable row level security;
alter table research_iterations enable row level security;

create index if not exists research_campaigns_created_at_idx on research_campaigns(created_at desc);
create index if not exists research_segments_campaign_id_idx on research_segments(campaign_id);
create index if not exists search_queries_campaign_id_idx on search_queries(campaign_id);
create index if not exists search_queries_segment_id_idx on search_queries(segment_id);
create index if not exists research_tasks_campaign_id_idx on research_tasks(campaign_id);
create index if not exists research_tasks_worker_status_idx on research_tasks(status, priority, created_at);
create index if not exists source_results_campaign_id_idx on source_results(campaign_id);
create index if not exists source_results_task_id_idx on source_results(research_task_id);
create index if not exists extracted_entities_campaign_id_idx on extracted_entities(campaign_id);
create index if not exists evidence_items_campaign_id_idx on evidence_items(campaign_id);
create index if not exists candidate_profiles_campaign_id_idx on candidate_profiles(campaign_id);
create index if not exists profile_scores_campaign_id_idx on profile_scores(campaign_id);
