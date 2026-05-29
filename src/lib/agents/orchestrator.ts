import { z } from "zod";

import { OpenRouterProvider } from "@/lib/ai/openrouter";
import { researchSourceTypes } from "@/lib/agents/research-workflow";
import { buildGoogleSearchUrl, hasWebSearchProvider, searchWeb } from "@/lib/search/web-search";
import type { SupabaseClient } from "@supabase/supabase-js";

const ResearchTaskSchema = z.object({
  source_type: z.string(),
  target_segment: z.string(),
  query: z.string(),
  priority: z.number().int().min(1).max(10).default(5),
  expected_output: z.string(),
  why_this_query: z.string(),
});

const LinkedInProfileSearchSchema = z.object({
  query: z.string(),
  expected_person_type: z.string(),
  company_hint: z.string().optional(),
});

const OrchestratorPlanSchema = z.object({
  mission_summary: z.string(),
  assumptions: z.array(z.string()).default([]),
  roadmap: z.array(z.string()).default([]),
  source_tasks: z.array(ResearchTaskSchema).min(1).max(20),
  linkedin_profile_searches: z.array(LinkedInProfileSearchSchema).default([]),
  extraction_rules: z.array(z.string()).default([]),
  stop_rules: z.array(z.string()).default([]),
});

export type OrchestratorPlan = z.infer<typeof OrchestratorPlanSchema>;

type OrchestratorRunOptions = {
  prompt: string;
  maxTasks?: number;
  runSearch?: boolean;
};

type AdminClient = SupabaseClient;

const allowedSourceText = researchSourceTypes.join(", ");

function fallbackPlan(prompt: string, maxTasks: number): OrchestratorPlan {
  const baseQueries = [
    `"${prompt}" fuar katilimci listesi sirket sahibi genel mudur`,
    `"${prompt}" etkinlik konusmaci sponsor firma kurucu`,
    `"${prompt}" ticaret odasi komite uye firma sahibi`,
    `"${prompt}" dernek yonetim kurulu firma sahibi`,
  ];

  return {
    mission_summary: prompt,
    assumptions: ["OpenRouter plan generation failed or is not configured; deterministic fallback created safe research tasks."],
    roadmap: [
      "Build a company pool first.",
      "Verify company reality from at least two public sources.",
      "Find likely decision makers without opening LinkedIn.",
      "Store LinkedIn only as a public search-result URL when visible.",
      "Move only evidence-backed candidates to review.",
    ],
    source_tasks: baseQueries.slice(0, maxTasks).map((query, index) => ({
      source_type: researchSourceTypes[index % researchSourceTypes.length],
      target_segment: prompt,
      query,
      priority: index + 1,
      expected_output: "Company names, public source URLs, and decision-maker hints.",
      why_this_query: "Fallback query based on the user mission.",
    })),
    linkedin_profile_searches: [
      {
        query: `site:linkedin.com/in "${prompt}" founder OR CEO OR "genel mudur"`,
        expected_person_type: "Founder, owner, CEO, general manager, or senior decision maker",
      },
    ],
    extraction_rules: ["Do not create a CRM candidate from one weak source.", "Keep unverified people in research_results."],
    stop_rules: ["Do not log in to LinkedIn.", "Do not scrape LinkedIn pages.", "Do not infer private contact details."],
  };
}

async function generatePlan(prompt: string, maxTasks: number) {
  const provider = new OpenRouterProvider();

  const system = `You are the Orchestrator Agent for E4N Relationship Brain.
You receive a Turkish natural-language research mission and must create a concrete research roadmap.

Rules:
- Use OpenRouter reasoning only for planning. Do not claim you browsed the web.
- LinkedIn is allowed only as a public search-result URL discovery target.
- Never instruct login, scraping, browser automation, profile parsing, or automated LinkedIn collection.
- The workflow is company-first: company pool -> company validation -> decision maker search -> evidence confidence -> candidate report.
- Use these source types when possible: ${allowedSourceText}.
- Produce compact JSON only.`;

  const user = `Mission:
${prompt}

Return JSON with:
{
  "mission_summary": string,
  "assumptions": string[],
  "roadmap": string[],
  "source_tasks": [
    {
      "source_type": string,
      "target_segment": string,
      "query": string,
      "priority": number,
      "expected_output": string,
      "why_this_query": string
    }
  ],
  "linkedin_profile_searches": [
    {
      "query": "site:linkedin.com/in ...",
      "expected_person_type": string,
      "company_hint": string
    }
  ],
  "extraction_rules": string[],
  "stop_rules": string[]
}

Create at most ${maxTasks} source_tasks and at most 5 LinkedIn profile search queries.`;

  const result = await provider.generateJson<unknown>({
    system,
    user,
    model: process.env.OPENROUTER_RESEARCH_MODEL ?? "deepseek/deepseek-v4-flash:free",
    temperature: 0.15,
  });

  return {
    ...result,
    data: OrchestratorPlanSchema.parse(result.data),
  };
}

export async function runResearchOrchestrator(
  supabase: AdminClient,
  { prompt, maxTasks = 8, runSearch = true }: OrchestratorRunOptions,
) {
  const startedAt = new Date().toISOString();
  const safeMaxTasks = Math.max(1, Math.min(20, maxTasks));
  let plan: OrchestratorPlan;
  let modelProvider = "openrouter";
  let modelName = process.env.OPENROUTER_RESEARCH_MODEL ?? "deepseek/deepseek-v4-flash:free";
  let raw: unknown = null;
  let status = "completed";
  let errorMessage: string | null = null;

  try {
    const generated = await generatePlan(prompt, safeMaxTasks);
    plan = generated.data;
    raw = generated.raw;
    modelName = generated.model;
  } catch (error) {
    plan = fallbackPlan(prompt, safeMaxTasks);
    modelProvider = "local";
    modelName = "deterministic_orchestrator_fallback";
    status = "completed_with_fallback";
    errorMessage = error instanceof Error ? error.message : "Unknown OpenRouter error";
  }

  const sourceTasks = plan.source_tasks.slice(0, safeMaxTasks);
  const linkedinTasks = plan.linkedin_profile_searches.slice(0, 5).map((item, index) => ({
    source_type: "google_linkedin_profile_result",
    target_segment: item.expected_person_type,
    query: item.query,
    priority: Math.min(10, index + 1),
    expected_output: "Public Google result URL for a likely LinkedIn profile; do not open LinkedIn.",
    why_this_query: item.company_hint ? `Company hint: ${item.company_hint}` : "Find public LinkedIn profile URL from search results only.",
  }));

  const allTasks = [...sourceTasks, ...linkedinTasks];

  const { data: researchTasks, error: taskError } = await supabase
    .from("research_tasks")
    .insert(
      allTasks.map((task) => ({
        target_segment: task.target_segment,
        source_type: task.source_type,
        query: task.query,
        priority: task.priority,
        status: hasWebSearchProvider() && runSearch ? "running" : "pending_search_provider",
        metadata: {
          expected_output: task.expected_output,
          why_this_query: task.why_this_query,
          google_search_url: buildGoogleSearchUrl(task.query),
          linkedin_rule:
            task.source_type === "google_linkedin_profile_result"
              ? "Store only public search result URL; do not open LinkedIn."
              : undefined,
        },
      })),
    )
    .select("id, query, source_type");

  if (taskError) {
    throw taskError;
  }

  const { data: agentTask } = await supabase
    .from("agent_tasks")
    .insert({
      task_type: "orchestrate_research_mission",
      status: "completed",
      priority: 1,
      input_json: { prompt, maxTasks: safeMaxTasks, runSearch },
      output_json: { plan, research_task_count: allTasks.length },
      executed_at: startedAt,
    })
    .select("id")
    .single();

  const searchResultsByTask: Array<{ task_id: string; result_count: number }> = [];

  if (hasWebSearchProvider() && runSearch && researchTasks) {
    for (const task of researchTasks.slice(0, 8)) {
      const results = await searchWeb(String(task.query), 5);
      searchResultsByTask.push({ task_id: String(task.id), result_count: results.length });

      if (results.length > 0) {
        await supabase.from("research_results").insert(
          results.map((result) => ({
            raw_result: {
              title: result.title,
              url: result.url,
              snippet: result.snippet,
              source: result.source,
              research_task_id: task.id,
              source_type: task.source_type,
              is_linkedin_public_result:
                String(task.source_type) === "google_linkedin_profile_result" ||
                result.url.includes("linkedin.com/in/"),
            },
            status: "new",
          })),
        );
      }

      await supabase
        .from("research_tasks")
        .update({ status: "completed", result_count: results.length })
        .eq("id", task.id);
    }
  }

  await supabase.from("agent_runs").insert({
    agent_name: "orchestrator_agent",
    task_id: agentTask?.id ?? null,
    model_provider: modelProvider,
    model_name: modelName,
    input_json: { prompt, maxTasks: safeMaxTasks },
    output_json: { plan, searchResultsByTask, raw },
    status,
    error_message: errorMessage,
  });

  return {
    plan,
    researchTaskCount: allTasks.length,
    searchProviderEnabled: hasWebSearchProvider(),
    searchedTaskCount: searchResultsByTask.length,
  };
}
