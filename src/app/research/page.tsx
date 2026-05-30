import { AppShell } from "@/components/app-shell";
import { runResearchOrchestratorAction } from "@/app/actions";
import { researchPipelineStages } from "@/lib/agents/research-workflow";
import { buildDuckDuckGoSearchUrl, buildGoogleSearchUrl } from "@/lib/search/free-research";
import { listResearchTasks } from "@/lib/supabase/queries";

export default async function ResearchPage() {
  const tasks = await listResearchTasks();

  return (
    <AppShell>
      <div className="px-5 py-5 sm:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Research Orchestrator</h1>
            <p className="mt-1 max-w-3xl text-sm text-[#a3a3a3]">
              Describe who E4N should find. The orchestrator uses DeepSeek V4 Flash through OpenRouter to create a
              company-first roadmap: qualified company pool, commercial verification, decision maker discovery,
              person-company analysis, E4N scoring, and next action.
            </p>
          </div>
          <span className="w-fit rounded-md bg-[#1f0a0a] px-2 py-1 text-xs font-medium text-[#ef4444]">
            Free mode
          </span>
        </div>

        <form action={runResearchOrchestratorAction} className="mt-5 rounded-md border border-[#2a2a2a] bg-[#111111] p-4">
          <label className="text-sm font-medium" htmlFor="prompt">
            Mission prompt
          </label>
          <textarea
            className="mt-2 min-h-32 w-full rounded-md border border-[#3a3a3a] bg-[#111111] px-3 py-2 text-sm outline-none focus:border-[#ef4444]"
            id="prompt"
            name="prompt"
            placeholder="Ornek: Istanbul'da saglik turizmi yapan, uluslararasi hasta operasyonu olan, kurucu veya genel mudur seviyesinde karar vericileri bul."
            required
          />
          <div className="mt-3 grid gap-3 md:grid-cols-[180px_1fr]">
            <div>
              <label className="text-sm font-medium" htmlFor="max_tasks">
                Max tasks
              </label>
              <input
                className="mt-2 h-10 w-full rounded-md border border-[#3a3a3a] px-3 text-sm"
                defaultValue="8"
                id="max_tasks"
                max="20"
                min="1"
                name="max_tasks"
                type="number"
              />
            </div>
            <div className="rounded-md bg-[#101010] p-3 text-sm text-[#a3a3a3]">
              Free mode: no SerpAPI, Google API, Brave API, Tavily, Exa, or LinkedIn. The bot creates staged research
              tasks and can fetch only public source URLs you provide.
            </div>
          </div>
          <label className="mt-4 block text-sm font-medium" htmlFor="source_urls">
            Public source URLs
          </label>
          <textarea
            className="mt-2 min-h-24 w-full rounded-md border border-[#3a3a3a] bg-[#111111] px-3 py-2 text-sm outline-none focus:border-[#ef4444]"
            id="source_urls"
            name="source_urls"
            placeholder="Optional. Add one public URL per line: fair exhibitor page, chamber directory, technopark company list, event speaker page..."
          />
          <button className="mt-4 h-10 rounded-md bg-[#ef4444] px-4 text-sm font-medium text-white" type="submit">
            Start orchestrator
          </button>
        </form>

        <section className="mt-4 rounded-md border border-[#2a2a2a] bg-[#101010] p-4">
          <h2 className="text-sm font-semibold text-[#f5f5f5]">Research strategy</h2>
          <div className="mt-3 grid gap-2 md:grid-cols-3">
            {researchPipelineStages.map((stage, index) => (
              <div className="rounded-md border border-[#2a2a2a] bg-[#111111] p-3" key={stage.id}>
                <p className="text-xs font-semibold uppercase text-[#a3a3a3]">Step {index + 1}</p>
                <p className="mt-1 text-sm text-[#f5f5f5]">{stage.label}</p>
                <p className="mt-2 text-xs text-[#a3a3a3]">{stage.ownerAgent}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-md border border-[#2a2a2a] bg-[#111111]">
          <div className="border-b border-[#242424] px-4 py-3">
            <h2 className="text-sm font-semibold">Research task queue</h2>
            <p className="mt-1 text-sm text-[#a3a3a3]">
              These are not CRM candidates yet. They are research instructions and raw discovery lanes.
            </p>
          </div>
          {tasks.length === 0 ? (
            <p className="p-4 text-sm text-[#a3a3a3]">No research tasks yet.</p>
          ) : (
            <div className="divide-y divide-[#242424]">
              {tasks.map((task) => {
                const query = String(task.query ?? "");
                const googleUrl =
                  typeof task.metadata === "object" &&
                  task.metadata &&
                  "google_search_url" in task.metadata &&
                  typeof task.metadata.google_search_url === "string"
                    ? task.metadata.google_search_url
                    : buildGoogleSearchUrl(query);
                const duckUrl =
                  typeof task.metadata === "object" &&
                  task.metadata &&
                  "duckduckgo_search_url" in task.metadata &&
                  typeof task.metadata.duckduckgo_search_url === "string"
                    ? task.metadata.duckduckgo_search_url
                    : buildDuckDuckGoSearchUrl(query);
                const pipelineStage =
                  typeof task.metadata === "object" &&
                  task.metadata &&
                  "pipeline_stage" in task.metadata &&
                  typeof task.metadata.pipeline_stage === "string"
                    ? task.metadata.pipeline_stage
                    : null;

                return (
                  <div className="grid gap-3 p-4 xl:grid-cols-[1fr_180px_120px]" key={String(task.id)}>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-[#f5f5f5]">{String(task.source_type)}</p>
                        <span className="rounded-md bg-[#171717] px-2 py-1 text-xs text-[#d4d4d4]">
                          P{String(task.priority ?? 5)}
                        </span>
                        {pipelineStage ? (
                          <span className="rounded-md bg-[#1f0a0a] px-2 py-1 text-xs text-[#ef4444]">
                            {pipelineStage}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm text-[#d4d4d4]">{query}</p>
                      <div className="mt-2 flex gap-3">
                        <a className="text-xs text-[#ef4444]" href={googleUrl} rel="noreferrer" target="_blank">
                          Google link
                        </a>
                        <a className="text-xs text-[#ef4444]" href={duckUrl} rel="noreferrer" target="_blank">
                          DuckDuckGo link
                        </a>
                      </div>
                    </div>
                    <p className="text-sm text-[#a3a3a3]">{String(task.target_segment)}</p>
                    <div className="text-sm">
                      <p className="rounded-md bg-[#1f0a0a] px-2 py-1 text-xs text-[#ef4444]">{String(task.status)}</p>
                      <p className="mt-2 text-xs text-[#a3a3a3]">{String(task.result_count ?? 0)} results</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
