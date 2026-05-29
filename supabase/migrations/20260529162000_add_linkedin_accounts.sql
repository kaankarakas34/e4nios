create table if not exists linkedin_accounts (
  id uuid primary key default gen_random_uuid(),
  linkedin_sub text not null unique,
  name text,
  email text,
  picture_url text,
  locale text,
  raw_profile jsonb not null default '{}'::jsonb,
  connected_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists linkedin_accounts_email_idx on linkedin_accounts(email);

alter table linkedin_accounts enable row level security;

drop policy if exists "Authenticated users can read linkedin accounts" on linkedin_accounts;
create policy "Authenticated users can read linkedin accounts"
  on linkedin_accounts for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can write linkedin accounts" on linkedin_accounts;
create policy "Authenticated users can write linkedin accounts"
  on linkedin_accounts for all
  to authenticated
  using (true)
  with check (true);
