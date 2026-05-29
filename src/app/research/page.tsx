import { AppShell } from "@/components/app-shell";
import { runResearchOrchestratorAction } from "@/app/actions";
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
            <p className="mt-1 max-w-3xl text-sm text-[#69746d]">
              Describe who E4N should find. The orchestrator uses DeepSeek V4 Flash through OpenRouter to create a
              company-first roadmap, free public source tasks, and public LinkedIn profile search queries without paid
              search APIs.
            </p>
          </div>
          <span className="w-fit rounded-md bg-[#e4eee9] px-2 py-1 text-xs font-medium text-[#1f6f5b]">
            Free mode
          </span>
        </div>

        <form action={runResearchOrchestratorAction} className="mt-5 rounded-md border border-[#d8ded5] bg-white p-4">
          <label className="text-sm font-medium" htmlFor="prompt">
            Mission prompt
          </label>
          <textarea
            className="mt-2 min-h-32 w-full rounded-md border border-[#cbd5cc] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f6f5b]"
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
                className="mt-2 h-10 w-full rounded-md border border-[#cbd5cc] px-3 text-sm"
                defaultValue="8"
                id="max_tasks"
                max="20"
                min="1"
                name="max_tasks"
                type="number"
              />
            </div>
            <div className="rounded-md bg-[#f6f8f4] p-3 text-sm text-[#69746d]">
              Free mode: no SerpAPI, Google API, Brave API, Tavily, or Exa. The bot creates manual search links and can
              fetch only public source URLs you provide.
            </div>
          </div>
          <label className="mt-4 block text-sm font-medium" htmlFor="source_urls">
            Public source URLs
          </label>
          <textarea
            className="mt-2 min-h-24 w-full rounded-md border border-[#cbd5cc] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f6f5b]"
            id="source_urls"
            name="source_urls"
            placeholder="Optional. Add one public URL per line: fair exhibitor page, chamber directory, technopark company list, event speaker page..."
          />
          <button className="mt-4 h-10 rounded-md bg-[#1f6f5b] px-4 text-sm font-medium text-white" type="submit">
            Start orchestrator
          </button>
        </form>

        <div className="mt-4 rounded-md border border-[#d8ded5] bg-[#f6f8f4] p-4 text-sm text-[#34413a]">
          LinkedIn rule: the bot creates search links like <code>site:linkedin.com/in</code>. It does not open LinkedIn,
          log in, scrape profiles, or automate outreach. If a public LinkedIn result URL is later supplied, it is stored
          only as a source signal.
        </div>

        <section className="mt-5 rounded-md border border-[#d8ded5] bg-white">
          <div className="border-b border-[#edf0ea] px-4 py-3">
            <h2 className="text-sm font-semibold">Research task queue</h2>
            <p className="mt-1 text-sm text-[#69746d]">
              These are not CRM candidates yet. They are research instructions and raw discovery lanes.
            </p>
          </div>
          {tasks.length === 0 ? (
            <p className="p-4 text-sm text-[#69746d]">No research tasks yet.</p>
          ) : (
            <div className="divide-y divide-[#edf0ea]">
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

                return (
                  <div className="grid gap-3 p-4 xl:grid-cols-[1fr_180px_120px]" key={String(task.id)}>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-[#1e2b23]">{String(task.source_type)}</p>
                        <span className="rounded-md bg-[#f1f5f0] px-2 py-1 text-xs text-[#34413a]">
                          P{String(task.priority ?? 5)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-[#34413a]">{query}</p>
                      <div className="mt-2 flex gap-3">
                        <a className="text-xs text-[#1f6f5b]" href={googleUrl} rel="noreferrer" target="_blank">
                          Google link
                        </a>
                        <a className="text-xs text-[#1f6f5b]" href={duckUrl} rel="noreferrer" target="_blank">
                          DuckDuckGo link
                        </a>
                      </div>
                    </div>
                    <p className="text-sm text-[#69746d]">{String(task.target_segment)}</p>
                    <div className="text-sm">
                      <p className="rounded-md bg-[#e4eee9] px-2 py-1 text-xs text-[#1f6f5b]">{String(task.status)}</p>
                      <p className="mt-2 text-xs text-[#69746d]">{String(task.result_count ?? 0)} results</p>
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
