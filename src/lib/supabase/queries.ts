import { createAdminClient } from "@/lib/supabase/admin";

export async function getDashboardMetrics() {
  const supabase = createAdminClient();

  if (!supabase) {
    return {
      candidates: 0,
      review: 0,
      fit85: 0,
      messages: 0,
      agentErrors: 0,
    };
  }

  const [
    candidates,
    review,
    fit85,
    messages,
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
      .from("agent_tasks")
      .select("id", { count: "exact", head: true })
      .eq("status", "failed"),
  ]);

  return {
    candidates: candidates.count ?? 0,
    review: review.count ?? 0,
    fit85: fit85.count ?? 0,
    messages: messages.count ?? 0,
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
