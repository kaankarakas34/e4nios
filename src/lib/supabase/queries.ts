import { createAdminClient } from "@/lib/supabase/admin";

export async function getDashboardMetrics() {
  const supabase = createAdminClient();

  if (!supabase) {
    return {
      candidates: 0,
      review: 0,
      fit85: 0,
      messages: 0,
      signals: 0,
      pendingMoves: 0,
      agentErrors: 0,
    };
  }

  const [
    candidates,
    review,
    fit85,
    messages,
    signals,
    pendingMoves,
    agentErrors,
  ] = await Promise.all([
    supabase.from("people").select("id", { count: "exact", head: true }),
    supabase
      .from("people")
      .select("id", { count: "exact", head: true })
      .eq("review_status", "to_review"),
    supabase
      .from("people")
      .select("id", { count: "exact", head: true })
      .gte("fit_score", 85),
    supabase
      .from("message_drafts")
      .select("id", { count: "exact", head: true })
      .eq("status", "draft"),
    supabase
      .from("relationship_signals")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("relationship_moves")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending_approval"),
    supabase
      .from("agent_tasks")
      .select("id", { count: "exact", head: true })
      .eq("status", "failed"),
  ]);

  return {
    candidates: candidates.count ?? 0,
    review: review.count ?? 0,
    fit85: fit85.count ?? 0,
    messages: messages.count ?? 0,
    signals: signals.count ?? 0,
    pendingMoves: pendingMoves.count ?? 0,
    agentErrors: agentErrors.count ?? 0,
  };
}

export async function listCandidates() {
  const supabase = createAdminClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("people")
    .select(
      "id, full_name, title, industry, city, source, target_type, relationship_stage, review_status, fit_score, risk_score, approach_readiness_score, next_best_action, ai_summary, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  return data ?? [];
}

export async function getCandidateCrmProfile(id: string) {
  const supabase = createAdminClient();

  if (!supabase) {
    return null;
  }

  const [
    person,
    intelligence,
    scores,
    approach,
    messages,
    signals,
    moves,
    tasks,
    runs,
    linearTasks,
  ] = await Promise.all([
    supabase
      .from("people")
      .select("*")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("candidate_intelligence_profiles")
      .select("*")
      .eq("person_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("fit_scores")
      .select("*")
      .eq("person_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("approach_strategies")
      .select("*")
      .eq("person_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("message_drafts")
      .select("id, channel, message_type, subject, body, status, created_at")
      .eq("person_id", id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("relationship_signals")
      .select("id, signal_type, source_type, source_url, title, summary, confidence_score, status, created_at")
      .eq("person_id", id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("relationship_moves")
      .select("id, move_type, channel, stage, title, body, status, approved_at, completed_at, created_at")
      .eq("person_id", id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("agent_tasks")
      .select("id, task_type, status, priority, created_at")
      .eq("person_id", id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("agent_runs")
      .select("id, agent_name, model_provider, model_name, status, tokens_used, cost_estimate, created_at")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("linear_tasks")
      .select("id, linear_issue_id, linear_issue_url, title, task_type, status, created_at")
      .eq("related_person_id", id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  if (!person.data) {
    return null;
  }

  return {
    person: person.data,
    intelligence: intelligence.data,
    scores: scores.data,
    approach: approach.data,
    messages: messages.data ?? [],
    signals: signals.data ?? [],
    moves: moves.data ?? [],
    tasks: tasks.data ?? [],
    runs: runs.data ?? [],
    linearTasks: linearTasks.data ?? [],
  };
}

export async function listCompanies() {
  const supabase = createAdminClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("companies")
    .select("id, name, website_url, industry, city, country, company_size, notes, created_at")
    .order("created_at", { ascending: false })
    .limit(80);

  return data ?? [];
}

export async function listOrganizations() {
  const supabase = createAdminClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("organizations")
    .select("id, name, organization_type, website_url, city, country, notes, created_at")
    .order("created_at", { ascending: false })
    .limit(80);

  return data ?? [];
}

export async function listRelationshipSignals() {
  const supabase = createAdminClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("relationship_signals")
    .select("id, person_id, signal_type, source_type, source_url, title, summary, confidence_score, status, created_at")
    .order("created_at", { ascending: false })
    .limit(80);

  return data ?? [];
}

export async function listRelationshipMoves() {
  const supabase = createAdminClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("relationship_moves")
    .select("id, person_id, signal_id, move_type, channel, stage, title, body, status, approval_notes, approved_at, completed_at, due_at, created_at")
    .order("created_at", { ascending: false })
    .limit(80);

  return data ?? [];
}

export async function listReviewCandidates() {
  const supabase = createAdminClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("people")
    .select(
      "id, full_name, title, target_type, relationship_stage, review_status, fit_score, risk_score, next_best_action, ai_summary, created_at",
    )
    .in("review_status", ["to_review", "needs_more_research", "new"])
    .order("fit_score", { ascending: false })
    .limit(50);

  return data ?? [];
}

export async function listMessageDrafts() {
  const supabase = createAdminClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("message_drafts")
    .select("id, person_id, channel, message_type, subject, body, status, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return data ?? [];
}

export async function listAgentTasks() {
  const supabase = createAdminClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("agent_tasks")
    .select("id, task_type, status, priority, person_id, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return data ?? [];
}

export async function listKnowledgeItems() {
  const supabase = createAdminClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("knowledge_base_items")
    .select("id, title, category, content, source_url, is_active, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return data ?? [];
}

export async function listPromptTemplates() {
  const supabase = createAdminClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("prompt_templates")
    .select("id, name, agent_type, prompt_type, language, version, is_active, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return data ?? [];
}

export async function listLinkedInAccounts() {
  const supabase = createAdminClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("linkedin_accounts")
    .select("id, name, email, picture_url, locale, connected_at, updated_at")
    .order("updated_at", { ascending: false })
    .limit(10);

  return data ?? [];
}
