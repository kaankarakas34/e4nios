import { AppShell } from "@/components/app-shell";
import { runResearchOrchestratorAction } from "@/app/actions";
import { buildSearchUrl } from "@/lib/research/search-query-generator";
import { getResearchCampaignDashboard, listResearchCampaigns } from "@/lib/supabase/queries";

function pill(value: string, tone: "red" | "gray" = "gray") {
  return (
    <span
      className={
        tone === "red"
          ? "rounded-md bg-[#1f0a0a] px-2 py-1 text-xs text-[#ef4444]"
          : "rounded-md bg-[#171717] px-2 py-1 text-xs text-[#d4d4d4]"
      }
    >
      {value}
    </span>
  );
}

export default async function ResearchPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; status?: string; campaign?: string }>;
}) {
  const params = await searchParams;
  const campaigns = await listResearchCampaigns();
  const activeCampaignId = params?.campaign ?? (campaigns[0]?.id ? String(campaigns[0].id) : undefined);
  const dashboard = await getResearchCampaignDashboard(activeCampaignId);
  const campaign = dashboard?.campaign;
  const scoresByProfileId = new Map((dashboard?.scores ?? []).map((score) => [String(score.candidate_profile_id), score]));

  return (
    <AppShell>
      <div className="px-5 py-5 sm:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Research Orchestrator</h1>
            <p className="mt-1 max-w-3xl text-sm text-[#a3a3a3]">
              Ham prompt artik direkt aranmiyor. Orchestrator hedefi E4N baglaminda segmentlere boler, Google/Bing
              sorgulari uretir, local Playwright worker icin task queue acar ve staging sonuclari aday havuzuna tasir.
            </p>
          </div>
          <span className="w-fit rounded-md bg-[#1f0a0a] px-2 py-1 text-xs font-medium text-[#ef4444]">
            Public web only
          </span>
        </div>

        {params?.error ? (
          <div className="mt-5 rounded-md border border-[#3f1d1d] bg-[#180707] p-3 text-sm text-[#fca5a5]">
            Orchestrator could not start: {params.error}
          </div>
        ) : null}

        {params?.status === "started" ? (
          <div className="mt-5 rounded-md border border-[#3f1d1d] bg-[#1f0a0a] p-3 text-sm text-[#fca5a5]">
            Research campaign created. Local worker can now claim Google/Bing search tasks.
          </div>
        ) : null}

        <form action={runResearchOrchestratorAction} className="mt-5 rounded-md border border-[#2a2a2a] bg-[#111111] p-4">
          <label className="text-sm font-medium" htmlFor="prompt">
            Mission prompt
          </label>
          <textarea
            className="mt-2 min-h-32 w-full rounded-md border border-[#3a3a3a] bg-[#111111] px-3 py-2 text-sm outline-none focus:border-[#ef4444]"
            id="prompt"
            name="prompt"
            placeholder="Ornek: Finans profesyonelleri, VC ekipleri, melek yatirimcilar, fintech kuruculari ve startup ekosistemi karar vericilerini arastir."
            required
          />
          <div className="mt-3 grid gap-3 md:grid-cols-[180px_1fr]">
            <div>
              <label className="text-sm font-medium" htmlFor="max_results">
                Result cap
              </label>
              <input
                className="mt-2 h-10 w-full rounded-md border border-[#3a3a3a] bg-[#111111] px-3 text-sm"
                defaultValue="100"
                id="max_results"
                max="100"
                min="1"
                name="max_results"
                type="number"
              />
            </div>
            <div className="rounded-md bg-[#101010] p-3 text-sm text-[#a3a3a3]">
              V1: Google/Bing public browser automation. Login yok, captcha bypass yok, kampanya basina 100 unique URL,
              query basina en fazla 2 retry.
            </div>
          </div>
          <button className="mt-4 h-10 rounded-md bg-[#ef4444] px-4 text-sm font-medium text-white" type="submit">
            Create research campaign
          </button>
        </form>

        <div className="mt-5 grid gap-4 xl:grid-cols-[320px_1fr]">
          <section className="rounded-md border border-[#2a2a2a] bg-[#111111]">
            <div className="border-b border-[#242424] px-4 py-3">
              <h2 className="text-sm font-semibold">Campaigns</h2>
            </div>
            {campaigns.length === 0 ? (
              <p className="p-4 text-sm text-[#a3a3a3]">No campaigns yet.</p>
            ) : (
              <div className="divide-y divide-[#242424]">
                {campaigns.map((item) => (
                  <a
                    className="block p-4 hover:bg-[#151515]"
                    href={`/research?campaign=${String(item.id)}`}
                    key={String(item.id)}
                  >
                    <p className="line-clamp-2 text-sm font-medium text-[#f5f5f5]">{String(item.prompt)}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {pill(String(item.status), item.id === activeCampaignId ? "red" : "gray")}
                      {pill(`wave ${String(item.current_wave ?? 1)}`)}
                      {pill(`${String(item.query_count ?? 0)} queries`)}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </section>

          <div className="space-y-4">
            {campaign ? (
              <>
                <section className="rounded-md border border-[#2a2a2a] bg-[#111111] p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h2 className="text-sm font-semibold">Research plan</h2>
                      <p className="mt-2 max-w-4xl text-sm text-[#d4d4d4]">{String(campaign.e4n_interpretation ?? "")}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-5">
                      {pill(`${String(campaign.segment_count ?? 0)} segments`, "red")}
                      {pill(`${String(campaign.query_count ?? 0)} queries`)}
                      {pill(`${String(campaign.result_count ?? 0)} sources`)}
                      {pill(`${String(campaign.candidate_count ?? 0)} candidates`)}
                      {pill(`cap ${String(campaign.target_result_cap ?? 100)}`)}
                    </div>
                  </div>
                </section>

                <section className="rounded-md border border-[#2a2a2a] bg-[#111111]">
                  <div className="border-b border-[#242424] px-4 py-3">
                    <h2 className="text-sm font-semibold">Segments and keyword strategy</h2>
                  </div>
                  <div className="grid gap-3 p-4 lg:grid-cols-2">
                    {(dashboard?.segments ?? []).map((segment) => (
                      <div className="rounded-md border border-[#242424] bg-[#101010] p-3" key={String(segment.id)}>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-[#f5f5f5]">{String(segment.name)}</p>
                          {pill(String(segment.target_category ?? ""))}
                        </div>
                        <p className="mt-2 text-xs text-[#a3a3a3]">{String(segment.persona_type ?? "")}</p>
                        <p className="mt-3 text-xs text-[#ef4444]">Roles</p>
                        <p className="mt-1 text-sm text-[#d4d4d4]">{(segment.role_keywords ?? []).join(", ")}</p>
                        <p className="mt-3 text-xs text-[#ef4444]">Sources</p>
                        <p className="mt-1 text-sm text-[#d4d4d4]">{(segment.source_keywords ?? []).join(", ")}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-md border border-[#2a2a2a] bg-[#111111]">
                  <div className="border-b border-[#242424] px-4 py-3">
                    <h2 className="text-sm font-semibold">Task queue</h2>
                    <p className="mt-1 text-sm text-[#a3a3a3]">
                      Worker endpoint: POST /api/research/worker/claim, then POST /api/research/worker/results.
                    </p>
                  </div>
                  <div className="divide-y divide-[#242424]">
                    {(dashboard?.tasks ?? []).slice(0, 30).map((task) => (
                      <div className="grid gap-3 p-4 xl:grid-cols-[1fr_120px_120px]" key={String(task.id)}>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            {pill(String(task.engine ?? "engine"))}
                            {pill(String(task.source_type ?? ""))}
                            {pill(`retry ${String(task.retry_count ?? 0)}/${String(task.max_retries ?? 2)}`)}
                          </div>
                          <p className="mt-2 text-sm text-[#d4d4d4]">{String(task.query)}</p>
                          <a
                            className="mt-2 inline-block text-xs text-[#ef4444]"
                            href={buildSearchUrl(task.engine === "bing" ? "bing" : "google", String(task.query))}
                            rel="noreferrer"
                            target="_blank"
                          >
                            Open public search
                          </a>
                        </div>
                        <p className="text-sm text-[#a3a3a3]">{String(task.target_segment ?? "")}</p>
                        <div className="text-sm">
                          {pill(String(task.status), task.status === "blocked" || task.status === "failed" ? "red" : "gray")}
                          <p className="mt-2 text-xs text-[#a3a3a3]">{String(task.result_count ?? 0)} results</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="grid gap-4 xl:grid-cols-2">
                  <div className="rounded-md border border-[#2a2a2a] bg-[#111111]">
                    <div className="border-b border-[#242424] px-4 py-3">
                      <h2 className="text-sm font-semibold">Results staging</h2>
                    </div>
                    <div className="divide-y divide-[#242424]">
                      {(dashboard?.sources ?? []).slice(0, 20).map((source) => (
                        <div className="p-4" key={String(source.id)}>
                          <a className="text-sm font-medium text-[#f5f5f5] hover:text-[#ef4444]" href={String(source.url)} rel="noreferrer" target="_blank">
                            {String(source.title ?? source.url)}
                          </a>
                          <p className="mt-1 line-clamp-2 text-sm text-[#a3a3a3]">{String(source.snippet ?? "")}</p>
                          <div className="mt-2 flex gap-2">{pill(String(source.engine ?? ""))}{pill(String(source.result_type ?? ""))}</div>
                        </div>
                      ))}
                      {(dashboard?.sources ?? []).length === 0 ? (
                        <p className="p-4 text-sm text-[#a3a3a3]">Worker henuz source result gondermedi.</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="rounded-md border border-[#2a2a2a] bg-[#111111]">
                    <div className="border-b border-[#242424] px-4 py-3">
                      <h2 className="text-sm font-semibold">Candidate pool</h2>
                    </div>
                    <div className="divide-y divide-[#242424]">
                      {(dashboard?.candidates ?? []).slice(0, 20).map((candidate) => {
                        const score = scoresByProfileId.get(String(candidate.id));
                        return (
                          <div className="p-4" key={String(candidate.id)}>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium text-[#f5f5f5]">{String(candidate.normalized_name)}</p>
                              {pill(`${String(score?.final_score ?? "-")} score`, Number(score?.final_score ?? 0) >= 75 ? "red" : "gray")}
                              {pill(String(score?.category ?? candidate.category ?? ""))}
                            </div>
                            <p className="mt-2 text-sm text-[#a3a3a3]">{String(candidate.summary ?? "")}</p>
                            <p className="mt-2 text-xs text-[#ef4444]">{String(candidate.evidence_count ?? 0)} evidence items</p>
                          </div>
                        );
                      })}
                      {(dashboard?.candidates ?? []).length === 0 ? (
                        <p className="p-4 text-sm text-[#a3a3a3]">Aday havuzu worker sonucundan sonra dolacak.</p>
                      ) : null}
                    </div>
                  </div>
                </section>

                <section className="rounded-md border border-[#2a2a2a] bg-[#111111] p-4">
                  <h2 className="text-sm font-semibold">Iteration panel</h2>
                  <p className="mt-2 text-sm text-[#a3a3a3]">
                    Sistem wave sonunda kaliteye gore genisletme veya daraltma karari tutar. Ornek: fintech iyi
                    sonuc verirse payment systems, embedded finance, insurtech ve wealthtech dallarina acilir.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(dashboard?.iterations ?? []).map((iteration) => pill(`wave ${String(iteration.wave)}: ${String(iteration.decision ?? "")}`, "red"))}
                    {(dashboard?.iterations ?? []).length === 0 ? pill("no iteration yet") : null}
                  </div>
                </section>
              </>
            ) : (
              <section className="rounded-md border border-[#2a2a2a] bg-[#111111] p-4">
                <p className="text-sm text-[#a3a3a3]">Create a campaign to see the orchestrator plan.</p>
              </section>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
