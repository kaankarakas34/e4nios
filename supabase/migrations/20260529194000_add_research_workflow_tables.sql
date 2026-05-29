create table if not exists research_tasks (
  id uuid primary key default gen_random_uuid(),
  target_segment text not null,
  source_type text not null,
  query text not null,
  priority int default 5,
  status text default 'pending',
  result_count int default 0,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists candidate_reports (
  id uuid primary key default gen_random_uuid(),
  person_id uuid references people(id) on delete set null,
  company_id uuid references companies(id) on delete set null,
  file_name text not null,
  markdown_content text not null,
  json_content jsonb default '{}'::jsonb,
  sources jsonb default '[]'::jsonb,
  data_confidence_score int,
  action_category text,
  created_at timestamptz default now()
);

alter table research_tasks enable row level security;
alter table candidate_reports enable row level security;

create index if not exists research_tasks_status_idx on research_tasks(status);
create index if not exists research_tasks_source_type_idx on research_tasks(source_type);
create index if not exists candidate_reports_person_id_idx on candidate_reports(person_id);
create index if not exists candidate_reports_company_id_idx on candidate_reports(company_id);
create index if not exists candidate_reports_action_category_idx on candidate_reports(action_category);
