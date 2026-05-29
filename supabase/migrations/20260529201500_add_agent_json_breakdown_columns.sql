alter table fit_scores
  add column if not exists score_breakdown jsonb default '{}'::jsonb,
  add column if not exists e4n_research_breakdown jsonb default '{}'::jsonb;

alter table candidate_intelligence_profiles
  add column if not exists non_linkedin_research_plan text;
