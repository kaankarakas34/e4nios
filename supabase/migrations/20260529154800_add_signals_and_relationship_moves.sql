create table if not exists relationship_signals (
  id uuid primary key default gen_random_uuid(),
  person_id uuid references people(id) on delete cascade,
  company_id uuid references companies(id) on delete set null,
  signal_type text not null default 'manual_observation',
  source_type text not null default 'manual_input',
  source_url text,
  title text not null,
  summary text not null,
  confidence_score int not null default 50 check (confidence_score between 0 and 100),
  status text not null default 'new' check (status in ('new', 'reviewed', 'linked_to_candidate', 'dismissed')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists relationship_signals_person_id_idx on relationship_signals(person_id);
create index if not exists relationship_signals_status_idx on relationship_signals(status);
create index if not exists relationship_signals_source_type_idx on relationship_signals(source_type);

alter table relationship_signals enable row level security;

drop policy if exists "Authenticated users can read relationship signals" on relationship_signals;
create policy "Authenticated users can read relationship signals"
  on relationship_signals for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can write relationship signals" on relationship_signals;
create policy "Authenticated users can write relationship signals"
  on relationship_signals for all
  to authenticated
  using (true)
  with check (true);

create table if not exists relationship_moves (
  id uuid primary key default gen_random_uuid(),
  person_id uuid references people(id) on delete cascade,
  signal_id uuid references relationship_signals(id) on delete set null,
  move_type text not null default 'warm_signal',
  channel text not null default 'manual',
  stage text not null default 'warm_signal',
  title text not null,
  body text,
  status text not null default 'pending_approval' check (status in ('pending_approval', 'approved', 'rejected', 'completed_manually', 'needs_edit')),
  approval_notes text,
  approved_at timestamptz,
  completed_at timestamptz,
  due_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists relationship_moves_person_id_idx on relationship_moves(person_id);
create index if not exists relationship_moves_status_idx on relationship_moves(status);
create index if not exists relationship_moves_stage_idx on relationship_moves(stage);

alter table relationship_moves enable row level security;

drop policy if exists "Authenticated users can read relationship moves" on relationship_moves;
create policy "Authenticated users can read relationship moves"
  on relationship_moves for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can write relationship moves" on relationship_moves;
create policy "Authenticated users can write relationship moves"
  on relationship_moves for all
  to authenticated
  using (true)
  with check (true);
