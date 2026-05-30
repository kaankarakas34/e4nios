import type { SupabaseClient } from "@supabase/supabase-js";

import { generateCommunicationStrategy } from "./communication-strategy-generator";
import { extractEntityFromSource } from "./entity-extractor";
import { normalizeProfiles } from "./profile-normalizer";
import { scoreProfile } from "./profile-scoring-engine";
import { generateSegments, interpretForE4N } from "./segment-generator";
import { buildSearchUrl, generateSearchQueries } from "./search-query-generator";
import type { SearchQueryPlan, SourceResultInput } from "./types";

type Supabase = SupabaseClient;

export type CreateCampaignInput = {
  prompt: string;
  maxResults?: number;
  maxSegments?: number;
};

export async function createResearchCampaign(supabase: Supabase, input: CreateCampaignInput) {
  const targetResultCap = Math.min(Math.max(input.maxResults ?? 100, 1), 100);
  const segments = generateSegments(input.prompt, input.maxSegments ?? 12);
  const queryPlans = generateSearchQueries(segments, 96);
  const e4nInterpretation = interpretForE4N(input.prompt);

  const { data: campaign, error: campaignError } = await supabase
    .from("research_campaigns")
    .insert({
      prompt: input.prompt,
      e4n_interpretation: e4nInterpretation,
      status: "planned",
      target_result_cap: targetResultCap,
      current_wave: 1,
      segment_count: segments.length,
      query_count: queryPlans.length,
      metadata: {
        runtime: "vercel_api_plus_local_playwright_worker",
        public_search_only: true,
        login_allowed: false,
        captcha_bypass_allowed: false,
      },
    })
    .select("*")
    .single();

  if (campaignError) {
    throw campaignError;
  }

  const segmentRows = segments.map((segment) => ({
    campaign_id: campaign.id,
    name: segment.name,
    persona_type: segment.personaType,
    target_category: segment.targetCategory,
    role_keywords: segment.roleKeywords,
    sector_keywords: segment.sectorKeywords,
    location_keywords: segment.locationKeywords,
    source_keywords: segment.sourceKeywords,
    source_hypotheses: segment.sourceHypotheses,
    priority: segment.priority,
  }));

  const { data: insertedSegments, error: segmentError } = await supabase
    .from("research_segments")
    .insert(segmentRows)
    .select("*");

  if (segmentError) {
    throw segmentError;
  }

  const segmentIdByName = new Map((insertedSegments ?? []).map((segment) => [String(segment.name), String(segment.id)]));
  const queryRows = queryPlans.map((plan) => ({
    campaign_id: campaign.id,
    segment_id: segmentIdByName.get(plan.segment.name),
    engine: plan.engine,
    query: plan.query,
    template_type: plan.templateType,
    purpose_label: plan.purposeLabel,
    expected_result_type: plan.expectedResultType,
    extraction_targets: plan.extractionTargets,
    quality_signals: plan.qualitySignals,
    low_quality_signals: plan.lowQualitySignals,
    assigned_bot: plan.assignedBot,
    wave: plan.wave,
    metadata: {
      search_url: buildSearchUrl(plan.engine, plan.query),
      retry_policy: "max_2_retries_then_blocked",
    },
  }));

  const { data: insertedQueries, error: queryError } = await supabase
    .from("search_queries")
    .insert(queryRows)
    .select("*");

  if (queryError) {
    throw queryError;
  }

  const taskRows = (insertedQueries ?? []).map((query) => {
    const plan = queryPlans.find((item) => item.query === query.query && item.engine === query.engine) as SearchQueryPlan | undefined;
    return {
      campaign_id: campaign.id,
      segment_id: query.segment_id,
      search_query_id: query.id,
      target_segment: plan?.segment.name ?? query.purpose_label,
      source_type: query.template_type,
      query: query.query,
      priority: plan?.segment.priority ?? 5,
      status: "pending",
      result_count: 0,
      engine: query.engine,
      assigned_bot: "SearchResultCollector",
      wave: query.wave,
      retry_count: 0,
      max_retries: 2,
      metadata: {
        purpose_label: query.purpose_label,
        expected_result_type: query.expected_result_type,
        search_url: query.metadata?.search_url,
        extraction_targets: query.extraction_targets,
        quality_signals: query.quality_signals,
        low_quality_signals: query.low_quality_signals,
      },
    };
  });

  const { error: taskError } = await supabase.from("research_tasks").insert(taskRows);

  if (taskError) {
    throw taskError;
  }

  await supabase.from("agent_runs").insert({
    agent_name: "ResearchOrchestrator",
    model_provider: "local",
    model_name: "deterministic_research_orchestrator_v1",
    input_json: { prompt: input.prompt, maxResults: targetResultCap },
    output_json: {
      campaign_id: campaign.id,
      segment_count: segments.length,
      query_count: queryPlans.length,
      first_wave_summary: `Created ${segments.length} segments and ${queryPlans.length} public Google/Bing search tasks.`,
    },
    status: "completed",
  });

  return {
    campaign,
    segments: insertedSegments ?? [],
    generatedQueryCount: queryPlans.length,
    firstWaveSummary: `Bu hedef icin ${segments.length} segment olusturuldu, ${queryPlans.length} Google/Bing sorgusu uretildi. Ilk dalga sirket ekip sayfalari, etkinlik konusmacilari, yatirim haberleri ve teknokent firma listelerini onceliklendirir.`,
  };
}

export async function recordWorkerResults(
  supabase: Supabase,
  input: {
    taskId: string;
    workerId?: string;
    status?: "completed" | "blocked" | "failed";
    blockedReason?: string;
    results?: SourceResultInput[];
  },
) {
  const { data: task, error: taskError } = await supabase
    .from("research_tasks")
    .select("*")
    .eq("id", input.taskId)
    .single();

  if (taskError) {
    throw taskError;
  }

  if (input.status === "blocked" || input.status === "failed") {
    await supabase
      .from("research_tasks")
      .update({
        status: input.status,
        worker_id: input.workerId ?? task.worker_id,
        blocked_reason: input.blockedReason ?? null,
        retry_count: Number(task.retry_count ?? 0) + 1,
        completed_at: new Date().toISOString(),
      })
      .eq("id", input.taskId);

    return { storedResults: 0, extractedEntities: 0, candidateProfiles: 0 };
  }

  const cappedResults = (input.results ?? []).slice(0, 20);
  const sourceRows = cappedResults.map((result, index) => ({
    campaign_id: task.campaign_id,
    segment_id: task.segment_id,
    search_query_id: task.search_query_id,
    research_task_id: task.id,
    engine: task.engine,
    result_rank: result.rank ?? index + 1,
    title: result.title ?? null,
    url: result.url,
    snippet: result.snippet ?? null,
    raw_html_excerpt: result.rawHtmlExcerpt ?? null,
    context: [result.title, result.snippet].filter(Boolean).join(" - "),
    result_type: task.source_type,
    status: "new",
  }));

  const { data: sources, error: sourceError } = await supabase
    .from("source_results")
    .upsert(sourceRows, { onConflict: "campaign_id,url", ignoreDuplicates: false })
    .select("*");

  if (sourceError) {
    throw sourceError;
  }

  const entityRows = (sources ?? []).map((source) => {
    const entity = extractEntityFromSource({
      title: source.title ?? undefined,
      url: source.url,
      snippet: source.snippet ?? undefined,
      rawHtmlExcerpt: source.raw_html_excerpt ?? undefined,
      rank: source.result_rank ?? undefined,
    });

    return {
      campaign_id: source.campaign_id,
      source_result_id: source.id,
      entity_type: entity.entityType,
      name: entity.name,
      company: entity.company ?? null,
      title: entity.title ?? null,
      sector: entity.sector ?? null,
      location: entity.location ?? null,
      website_url: entity.websiteUrl ?? null,
      profile_url: entity.profileUrl ?? null,
      context: entity.context,
      importance_reason: entity.importanceReason,
      e4n_potential: entity.e4nPotential,
      normalized_key: entity.normalizedKey,
      metadata: entity,
    };
  });

  const { data: entities, error: entityError } = await supabase
    .from("extracted_entities")
    .insert(entityRows)
    .select("*");

  if (entityError) {
    throw entityError;
  }

  const normalized = normalizeProfiles(
    (entities ?? []).map((entity) => ({
      entityType: entity.entity_type,
      name: entity.name,
      company: entity.company ?? undefined,
      title: entity.title ?? undefined,
      sector: entity.sector ?? undefined,
      location: entity.location ?? undefined,
      profileUrl: entity.profile_url ?? undefined,
      websiteUrl: entity.website_url ?? undefined,
      context: entity.context ?? "",
      importanceReason: entity.importance_reason ?? "",
      e4nPotential: entity.e4n_potential ?? "",
      normalizedKey: entity.normalized_key ?? entity.name,
    })),
  );

  const profileRows = normalized.map((profile) => ({
    campaign_id: task.campaign_id,
    normalized_name: profile.normalizedName,
    normalized_company: profile.normalizedCompany,
    title: profile.title ?? null,
    category: profile.category,
    summary: profile.summary,
    location: profile.location ?? null,
    sector: profile.sector ?? null,
    evidence_count: profile.evidenceCount,
    metadata: { entities: profile.entities },
  }));

  const { data: profiles, error: profileError } = await supabase
    .from("candidate_profiles")
    .upsert(profileRows, { onConflict: "campaign_id,normalized_name,normalized_company", ignoreDuplicates: false })
    .select("*");

  if (profileError) {
    throw profileError;
  }

  const scoreRows = (profiles ?? []).map((profile) => {
    const score = scoreProfile({
      normalizedName: profile.normalized_name,
      normalizedCompany: profile.normalized_company ?? "",
      title: profile.title ?? undefined,
      category: profile.category,
      summary: profile.summary ?? "",
      location: profile.location ?? undefined,
      sector: profile.sector ?? undefined,
      evidenceCount: profile.evidence_count ?? 0,
      entities: [],
    });

    return {
      campaign_id: task.campaign_id,
      candidate_profile_id: profile.id,
      final_score: score.finalScore,
      score_band: score.scoreBand,
      category: score.category,
      explanation: score.explanation,
      score_breakdown: score.scoreBreakdown,
      evidence_count: profile.evidence_count ?? 0,
    };
  });

  if (scoreRows.length > 0) {
    await supabase.from("profile_scores").insert(scoreRows);
  }

  const strategyRows = (profiles ?? []).map((profile) => {
    const score = scoreProfile({
      normalizedName: profile.normalized_name,
      normalizedCompany: profile.normalized_company ?? "",
      title: profile.title ?? undefined,
      category: profile.category,
      summary: profile.summary ?? "",
      location: profile.location ?? undefined,
      sector: profile.sector ?? undefined,
      evidenceCount: profile.evidence_count ?? 0,
      entities: [],
    });
    const strategy = generateCommunicationStrategy(
      {
        normalizedName: profile.normalized_name,
        normalizedCompany: profile.normalized_company ?? "",
        title: profile.title ?? undefined,
        category: profile.category,
        summary: profile.summary ?? "",
        location: profile.location ?? undefined,
        sector: profile.sector ?? undefined,
        evidenceCount: profile.evidence_count ?? 0,
        entities: [],
      },
      score,
    );

    return {
      campaign_id: task.campaign_id,
      candidate_profile_id: profile.id,
      first_touch_angle: strategy.firstTouchAngle,
      first_message_draft: strategy.firstMessageDraft,
      follow_up_plan: strategy.followUpPlan,
      risk_notes: strategy.riskNotes,
    };
  });

  if (strategyRows.length > 0) {
    await supabase.from("communication_strategies").insert(strategyRows);
  }

  await Promise.all([
    supabase
      .from("research_tasks")
      .update({
        status: "completed",
        worker_id: input.workerId ?? task.worker_id,
        result_count: sourceRows.length,
        completed_at: new Date().toISOString(),
      })
      .eq("id", input.taskId),
    supabase
      .from("search_queries")
      .update({ status: "completed", result_count: sourceRows.length })
      .eq("id", task.search_query_id),
  ]);

  await refreshCampaignCounters(supabase, String(task.campaign_id));

  return {
    storedResults: sourceRows.length,
    extractedEntities: entityRows.length,
    candidateProfiles: profileRows.length,
  };
}

export async function refreshCampaignCounters(supabase: Supabase, campaignId: string) {
  const [sources, profiles] = await Promise.all([
    supabase.from("source_results").select("id", { count: "exact", head: true }).eq("campaign_id", campaignId),
    supabase.from("candidate_profiles").select("id", { count: "exact", head: true }).eq("campaign_id", campaignId),
  ]);

  await supabase
    .from("research_campaigns")
    .update({
      result_count: sources.count ?? 0,
      candidate_count: profiles.count ?? 0,
      updated_at: new Date().toISOString(),
    })
    .eq("id", campaignId);
}

export async function createResearchIteration(supabase: Supabase, campaignId: string) {
  const { data: campaign, error } = await supabase
    .from("research_campaigns")
    .select("*")
    .eq("id", campaignId)
    .single();

  if (error) {
    throw error;
  }

  const nextWave = Math.min(Number(campaign.current_wave ?? 1) + 1, 4);
  const decision =
    Number(campaign.candidate_count ?? 0) >= 10
      ? "Kaliteli aday havuzu olustu; sirket ekip sayfasi ve benzer aday aramalari derinlestirilecek."
      : "Sonuc kalitesi sinirli; sorgular kaynak tipi degistirilerek daraltilacak.";

  const { error: iterationError } = await supabase.from("research_iterations").insert({
    campaign_id: campaignId,
    wave: nextWave,
    summary: `Wave ${nextWave} hazirlandi. Mevcut sonuc: ${campaign.result_count ?? 0}, aday: ${campaign.candidate_count ?? 0}.`,
    decision,
    next_query_seeds: [
      "company team pages",
      "podcast interview pages",
      "demo day jury lists",
      "investment news follow-up",
    ],
  });

  if (iterationError) {
    throw iterationError;
  }

  await supabase
    .from("research_campaigns")
    .update({ current_wave: nextWave, status: "iterating", updated_at: new Date().toISOString() })
    .eq("id", campaignId);

  return { wave: nextWave, decision };
}
