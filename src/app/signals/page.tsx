import { updateRelationshipSignalAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { listRelationshipSignals } from "@/lib/supabase/queries";

const confidenceLabel = (score: number) => {
  if (score >= 75) return "High confidence";
  if (score >= 50) return "Medium confidence";
  return "Needs verification";
};

export default async function SignalsPage() {
  const signals = await listRelationshipSignals();

  return (
    <AppShell>
      <div className="px-5 py-5 sm:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Signal Inbox</h1>
            <p className="mt-1 text-sm text-[#69746d]">
              Relationship signals are reviewed before they become outreach or nurture actions.
            </p>
          </div>
          <span className="w-fit rounded-md bg-[#e4eee9] px-2 py-1 text-xs text-[#1f6f5b]">
            No auto-send from signals
          </span>
        </div>

        <div className="mt-5 rounded-md border border-[#d8ded5] bg-white">
          {signals.length === 0 ? (
            <p className="p-4 text-sm text-[#69746d]">
              Add a candidate to create the first manual intake or LinkedIn context signal.
            </p>
          ) : (
            <div className="divide-y divide-[#edf0ea]">
              {signals.map((signal) => (
                <article className="space-y-3 p-4" key={signal.id}>
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-[#e4eee9] px-2 py-1 text-xs text-[#1f6f5b]">
                          {signal.signal_type}
                        </span>
                        <span className="rounded-md bg-[#f3f4f0] px-2 py-1 text-xs text-[#69746d]">
                          {signal.source_type}
                        </span>
                        <span className="rounded-md bg-[#eef1ff] px-2 py-1 text-xs text-[#3f4f94]">
                          {confidenceLabel(signal.confidence_score)} · {signal.confidence_score}/100
                        </span>
                      </div>
                      <h2 className="mt-3 font-medium">{signal.title}</h2>
                      <p className="mt-1 text-sm text-[#34413a]">{signal.summary}</p>
                      {signal.source_url ? (
                        <a
                          className="mt-2 inline-block text-sm text-[#1f6f5b] underline-offset-4 hover:underline"
                          href={signal.source_url}
                          rel="noreferrer"
                          target="_blank"
                        >
                          Open source
                        </a>
                      ) : null}
                    </div>
                    <span className="w-fit rounded-md bg-[#fff1d6] px-2 py-1 text-xs text-[#6b5424]">
                      {signal.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <form action={updateRelationshipSignalAction}>
                      <input name="id" type="hidden" value={signal.id} />
                      <input name="status" type="hidden" value="reviewed" />
                      <button className="h-9 rounded-md bg-[#1f6f5b] px-3 text-sm text-white">
                        Mark Reviewed
                      </button>
                    </form>
                    <form action={updateRelationshipSignalAction}>
                      <input name="id" type="hidden" value={signal.id} />
                      <input name="status" type="hidden" value="dismissed" />
                      <button className="h-9 rounded-md border border-[#cbd5cc] px-3 text-sm">
                        Dismiss
                      </button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
